"""Run against a new/test workspace; token supplied through hidden stdin only.
Creates a fictional artwork and tiny test photograph; keeps the audit trail.
"""
import sys,json,urllib.request,urllib.error,termios,hashlib,base64
if sys.stdin.isatty():
 attrs=termios.tcgetattr(sys.stdin);attrs[3]&=~termios.ECHO;termios.tcsetattr(sys.stdin,termios.TCSANOW,attrs)
print('Ready for private backend test settings',flush=True)
cfg=json.loads(sys.stdin.readline());base=cfg['url'];token=cfg['token']
def call(path,body=None,headers=None,auth=True):
 h={'Authorization':'Bearer '+token} if auth else {}
 if headers:h.update(headers)
 if isinstance(body,dict):body=json.dumps(body).encode();h['Content-Type']='application/json'
 req=urllib.request.Request(base+path,data=body,headers=h)
 try:
  with urllib.request.urlopen(req,timeout=40) as r:return r.status,r.read()
 except urllib.error.HTTPError as e:return e.code,e.read()
def post(body):
 status,b=call('/api/data',body);assert status==200,(status,b.decode());return json.loads(b)
status,_=call('/api/data',auth=False);assert status==401,status
status,b=call('/api/data');assert status==200,(status,b.decode())
aid=post({'action':'save','kind':'artwork','data':{'title':'Fictional backend validation artwork','artist':'Fictional QA artist','sample':True,'status':'Available','location':'Storage · Rack A','price':100}})['id']
post({'action':'movement','artworkId':aid,'type':'Receive artwork','to':'Gallery · Wall A','receiver':'Fictional QA receiver','effective':'2026-10-22T12:00'})
rows=json.loads(call('/api/data')[1])['records'];a=next(r for r in rows if r['id']==aid);assert a['location']=='Gallery · Wall A'
post({'action':'save','kind':'artwork','id':aid,'data':dict(a,status='Sold',location='Customer')})
rows=json.loads(call('/api/data')[1])['records'];a=next(r for r in rows if r['id']==aid);assert a['status']=='Sold' and a['location']=='Gallery · Wall A'
status,_=call('/api/data',{'action':'movement','artworkId':aid,'type':'Transfer artwork','to':'Gallery · Wall A','receiver':'QA'});assert status==400
png=base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l9sAAAAASUVORK5CYII=')
boundary='SeraaiTestBoundary791'
body=(f'--{boundary}\r\nContent-Disposition: form-data; name="artworkId"\r\n\r\n{aid}\r\n--{boundary}\r\nContent-Disposition: form-data; name="category"\r\n\r\nFront\r\n--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="fictional-qa.png"\r\nContent-Type: image/png\r\n\r\n').encode()+png+f'\r\n--{boundary}--\r\n'.encode()
status,b=call('/api/media',body,{'Content-Type':'multipart/form-data; boundary='+boundary});assert status==200,(status,b.decode())
result=json.loads(call('/api/data')[1]);p=next(p for p in result['photos'] if p['artwork_id']==aid)
status,b=call('/api/media?id='+p['id']);assert status==200 and hashlib.sha256(b).hexdigest()==p['hash']
assert call('/api/media?id='+p['id'],auth=False)[0]==401
post({'action':'save','kind':'artwork','id':aid,'data':dict(a,archived=True,notes='Fictional backend validation record. Archived after testing; audit retained.')})
print(json.dumps({'passed':['unauthorized access rejected','artwork save and readback','atomic movement/location history','sale does not deliver artwork','invalid transfer rejected','original image upload and SHA-256 download','private media access','test artwork archived'],'artwork_id':aid,'media_id':p['id']}),flush=True)
