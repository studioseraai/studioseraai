#!/usr/bin/env python3
"""Generate a non-destructive match report for WordPress catalog vs SERAAI OS.
Inputs: wp-catalog.csv from wordpress-catalog-extract.py and seraai-artworks.csv
exported from the read-only SQL query in docs/V4_WORDPRESS_MIGRATION.md.
No external network calls or database writes.
"""
import argparse
import csv
import json
import re
from collections import defaultdict
from pathlib import Path

def norm(s):
    return re.sub(r"[^a-z0-9]+", " ", str(s or "").casefold()).strip()

def digits(s):
    return re.sub(r"\D+", "", str(s or ""))

def load_csv(path):
    with path.open("r", encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument("wordpress", type=Path)
    p.add_argument("inventory", type=Path)
    p.add_argument("--out", type=Path, default=Path("v4-matching-report.csv"))
    args=p.parse_args()
    wp=load_csv(args.wordpress)
    os=load_csv(args.inventory)
    by_web=defaultdict(set)
    by_legacy=defaultdict(set)
    by_title=defaultdict(set)
    for item in os:
        rec=item.get("data", "")
        try:
            data=json.loads(rec) if isinstance(rec,str) else rec
        except json.JSONDecodeError:
            raise SystemExit("Supabase CSV data column must contain valid JSON")
        key=str(item.get("id",""))
        if not key: continue
        for fld in ("webId","legacyWebNumber"):
            number=digits(data.get(fld,""))
            if number: by_web[number].add(key)
        for fld in ("webCode","legacyInventoryId","importKey"):
            value=norm(data.get(fld,""))
            if value: by_legacy[value].add(key)
        title=norm(data.get("title",""))
        artist=norm(data.get("artist",""))
        if title: by_title[title+"|"+artist].add(key)
    result=[]
    summary=defaultdict(int)
    for art in wp:
        wp_id=str(art.get("wp_id",""))
        sku=norm(art.get("sku",""))
        title=norm(art.get("title",""))
        evidence=[]
        if wp_id and wp_id in by_web:
            evidence.append(("wordpress_id_matches_existing_web_id",by_web[wp_id]))
        if sku and sku in by_legacy:
            evidence.append(("sku_matches_legacy_id",by_legacy[sku]))
        if title:
            # Title-only is NOT a safe automatic match; artist is not reliably
            # available as a dedicated WooCommerce field.
            possible=set()
            for signature,ids in by_title.items():
                if signature.startswith(title+"|"):
                    possible.update(ids)
            if possible:
                evidence.append(("title_candidate_needs_manual_review",possible))
        strong=[s for label,ids in evidence if not label.startswith("title_") for s in ids]
        strong_ids=set(strong)
        if len(strong_ids)==1:
            status="candidate_exact_id"
            ids=strong_ids
        elif len(strong_ids)>1:
            status="conflicting_ids_review"
            ids=strong_ids
        else:
            ids=set().union(*(ids for _,ids in evidence)) if evidence else set()
            status="possible_title_match_review" if ids else "unmatched_review"
        summary[status]+=1
        result.append({
            "wp_id":wp_id,"wp_title":art.get("title",""),
            "wp_sku":art.get("sku",""),"match_status":status,
            "supabase_ids":" | ".join(sorted(ids,key=lambda x:int(x) if x.isdigit() else 0)),
            "evidence":" | ".join(label for label,_ in evidence),
            "wp_categories":art.get("categories",""),
            "wp_attributes_json":art.get("attributes_json","")
        })
    args.out.parent.mkdir(parents=True,exist_ok=True)
    with args.out.open("w",encoding="utf-8-sig",newline="") as f:
        writer=csv.DictWriter(f,fieldnames=list(result[0]) if result else [
            "wp_id","wp_title","wp_sku","match_status","supabase_ids","evidence","wp_categories","wp_attributes_json"])
        writer.writeheader()
        writer.writerows(result)
    print(json.dumps({"wordpress_rows":len(wp),"supabase_rows":len(os),
                      "match_classes":dict(summary),"report":str(args.out),
                      "warning":"All matches require verification; no database updates performed."},indent=2))
if __name__=="__main__":main()
