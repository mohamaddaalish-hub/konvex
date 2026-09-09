from pathlib import Path
import os, zipfile, hashlib, re, sys
root=Path(__file__).resolve().parents[1]
output=root.parent/('konvex-redesign-source.zip' if '--redesign' in sys.argv else 'konvex-source.zip')
excluded={'node_modules','.next','.git','.cache','.arena','.local','private','backups','exports','test-results','playwright-report','__pycache__'}
secrets=[]
env=root/'.env.local'
if env.exists():
 for key in ['ADMIN_PASSWORD','SESSION_SECRET']:
  m=re.search(r'^'+key+r'=(.+)$',env.read_text(),re.M)
  if m and len(m[1])>12:secrets.append(m[1].encode())
files=[]
for folder,dirs,names in os.walk(root):
 dirs[:]=[d for d in dirs if d not in excluded and not (Path(folder).relative_to(root)==Path('data') and d=='uploads')]
 for name in names:
  p=Path(folder)/name;rel=p.relative_to(root)
  if name.startswith('.env') and name!='.env.example':continue
  if '.sqlite' in name or name.endswith('.tsbuildinfo'):continue
  if str(rel)=='docs/image-contact-sheet.jpg':continue
  if 'docs/qa' in str(rel) and p.suffix.lower() in {'.png','.jpg'} and not name.startswith('final-'):continue
  data=p.read_bytes()
  if any(secret in data for secret in secrets):raise RuntimeError('Private credential detected in '+str(rel))
  files.append((p,Path('konvex')/rel))
with zipfile.ZipFile(output,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as archive:
 for p,name in files:archive.write(p,str(name))
with zipfile.ZipFile(output) as archive:
 assert archive.testzip() is None
 assert 'konvex/README.md' in archive.namelist()
 assert 'konvex/public/downloads/konvex-catalog-sample.pdf' in archive.namelist()
 assert not any('/private/' in n or '.env.local' in n or '.sqlite' in n or '/node_modules/' in n for n in archive.namelist())
print(f'Created {output.name}: {len(files)} files, {output.stat().st_size/1024/1024:.1f} MiB; integrity checked; credentials/database/backups excluded.')
print('SHA-256:',hashlib.sha256(output.read_bytes()).hexdigest())
