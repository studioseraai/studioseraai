#!/usr/bin/env python3
"""Studio Seraai V4: read-only WordPress SQL catalog extraction.
Usage: python scripts/wordpress-catalog-extract.py path/to/studiose_w957.sql --out wp-catalog.csv
Requires Python 3.10+. Does not connect to WordPress, GitHub or Supabase.
"""
import argparse
import csv
import json
import re
from collections import defaultdict
from pathlib import Path

Q = chr(96)
SCHEMA = {}
WANTED = ("_posts", "_postmeta", "_terms", "_term_taxonomy", "_term_relationships")
CREATE = re.compile(r"^CREATE TABLE\s+[" + Q + r"']?([\w]+)", re.I)
INSERT = re.compile(r"^INSERT INTO\s+[" + Q + r"']?([\w]+)[" + Q + r"']?\s*(?:\((.*?)\))?\s*VALUES\s*", re.I | re.S)

def rows_from_values(text):
    """Stream MySQL VALUES tuples with quoted strings, escaped delimiters and NULL."""
    i, n = 0, len(text)
    while i < n:
        while i < n and text[i] not in "(":
            i += 1
        if i >= n:
            break
        i += 1
        fields, field = [], []
        quote, escaped = False, False
        while i < n:
            c = text[i]
            i += 1
            if quote:
                if escaped:
                    field.append({"0": "\0", "n": "\n", "r": "\r", "t": "\t", "Z": "\x1a"}.get(c, c))
                    escaped = False
                elif c == "\\":
                    escaped = True
                elif c == "'":
                    if i < n and text[i] == "'":
                        field.append("'")
                        i += 1
                    else:
                        quote = False
                else:
                    field.append(c)
            elif c == "'":
                quote = True
            elif c == ",":
                fields.append("".join(field).strip())
                field = []
            elif c == ")":
                fields.append("".join(field).strip())
                yield [None if v == "NULL" else v for v in fields]
                break
            else:
                field.append(c)

def sql_rows(path):
    """Read logical SQL statements; never execute backup SQL."""
    current = []
    in_create = False
    with path.open("r", encoding="utf-8", errors="replace") as stream:
        for line in stream:
            stripped = line.lstrip()
            if not current:
                if stripped.upper().startswith("CREATE TABLE"):
                    in_create = True
                elif not stripped.upper().startswith("INSERT INTO"):
                    continue
            current.append(line)
            if in_create:
                if stripped.startswith(") ") or stripped.startswith(");"):
                    statement = "".join(current)
                    match = CREATE.match(statement.lstrip())
                    if match and match.group(1).endswith(WANTED):
                        cols = re.findall(r"^\s*[" + Q + r"']([\w]+)[" + Q + r"']\s", statement, re.M)
                        SCHEMA[match.group(1)] = cols
                    current = []
                    in_create = False
            elif stripped.rstrip().endswith(";"):
                statement = "".join(current).lstrip()
                current = []
                match = INSERT.match(statement)
                if not match or not match.group(1).endswith(WANTED):
                    continue
                table, named_cols = match.group(1), match.group(2)
                columns = ([v.strip().strip(Q).strip("'") for v in named_cols.split(",")]
                           if named_cols else SCHEMA.get(table))
                if not columns:
                    raise ValueError("Cannot determine columns for " + table + "; check CREATE TABLE in SQL dump")
                for values in rows_from_values(statement[match.end():]):
                    if len(values) == len(columns):
                        yield table, dict(zip(columns, values))

def first(meta, key):
    values = meta.get(key, [])
    return values[0] if values else ""

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("dump", type=Path, help="Extracted WordPress MySQL .sql file (NOT the entire .tar.gz)")
    parser.add_argument("--out", type=Path, default=Path("wp-catalog.csv"))
    args = parser.parse_args()
    if not args.dump.is_file():
        parser.error("File not found: " + str(args.dump))
    posts, meta, terms, taxonomies, relations = {}, defaultdict(lambda: defaultdict(list)), {}, {}, defaultdict(list)
    seen = defaultdict(int)
    for table, row in sql_rows(args.dump):
        if table.endswith("_posts"):
            typ = row.get("post_type", "")
            if typ in ("product", "attachment", "product_variation"):
                posts[str(row.get("ID"))] = row
                seen[typ] += 1
        elif table.endswith("_postmeta"):
            k = str(row.get("meta_key", ""))
            if k in ("_sku", "_product_image_gallery", "_thumbnail_id", "_regular_price",
                     "_sale_price", "_price", "_stock_status", "_stock", "_height",
                     "_width", "_length", "_weight", "_product_attributes",
                     "_wp_attached_file", "_wp_attachment_metadata") or not k.startswith("_"):
                meta[str(row.get("post_id"))][k].append(row.get("meta_value") or "")
        elif table.endswith("_terms"):
            terms[str(row.get("term_id"))] = row.get("name", "")
        elif table.endswith("_term_taxonomy"):
            taxonomies[str(row.get("term_taxonomy_id"))] = (str(row.get("term_id")), row.get("taxonomy", ""))
        elif table.endswith("_term_relationships"):
            relations[str(row.get("object_id"))].append(str(row.get("term_taxonomy_id")))
    rows = []
    for id_, post in posts.items():
        if post.get("post_type") != "product":
            continue
        tags = defaultdict(list)
        for tax_id in relations.get(id_, []):
            term_id, taxonomy = taxonomies.get(tax_id, ("", ""))
            name = terms.get(term_id)
            if name and taxonomy:
                tags[taxonomy].append(name)
        m = meta[id_]
        attachment_ids = [v for v in [first(m, "_thumbnail_id")] + first(m, "_product_image_gallery").split(",") if v]
        photo_paths = []
        for attachment_id in attachment_ids:
            p = posts.get(attachment_id, {})
            filepath = first(meta[attachment_id], "_wp_attached_file")
            photo_paths.append(filepath or p.get("guid", ""))
        attrs = {key: values for key, values in m.items() if key.startswith("attribute_")}
        rows.append({
            "wp_id": id_, "title": post.get("post_title", ""),
            "status": post.get("post_status", ""), "slug": post.get("post_name", ""),
            "sku": first(m, "_sku"), "description": post.get("post_content", ""),
            "short_description": post.get("post_excerpt", ""),
            "price": first(m, "_price"), "stock_status": first(m, "_stock_status"),
            "width": first(m, "_width"), "height": first(m, "_height"),
            "categories": " | ".join(tags.get("product_cat", [])),
            "tags": " | ".join(tags.get("product_tag", [])),
            "attributes_json": json.dumps({k: v for k, v in tags.items() if k.startswith("pa_")} | attrs, ensure_ascii=False),
            "image_paths": " | ".join(photo_paths),
        })
    args.out.parent.mkdir(parents=True, exist_ok=True)
    fields = ["wp_id","title","status","slug","sku","description","short_description",
              "price","stock_status","width","height","categories","tags","attributes_json","image_paths"]
    with args.out.open("w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)
    report = {"wordpress_products": len(rows), "post_types": dict(seen),
              "products_with_images": sum(bool(r["image_paths"]) for r in rows),
              "products_with_attributes": sum(r["attributes_json"] != "{}" for r in rows),
              "products_with_categories": sum(bool(r["categories"]) for r in rows),
              "output": str(args.out), "note": "Extraction only; no Supabase changes performed."}
    report_file = args.out.with_suffix(".report.json")
    report_file.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps(report, indent=2))

if __name__ == "__main__":
    main()
