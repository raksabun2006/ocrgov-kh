import urllib.request
import urllib.error

# 1. Test PDF upload
boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'

# Minimal valid PDF
pdf_bytes = b"%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000052 00000 n\n0000000101 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF"

parts = [
    (f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="test.pdf"\r\nContent-Type: application/pdf\r\n\r\n').encode('utf-8'),
    pdf_bytes,
    (f'\r\n--{boundary}\r\nContent-Disposition: form-data; name="officer_name"\r\n\r\nofficer\r\n--{boundary}--\r\n').encode('utf-8')
]
body = b''.join(parts)

req = urllib.request.Request(
    'https://3-25-134-111.sslip.io/api/v1/documents/upload',
    data=body,
    headers={'Content-Type': f'multipart/form-data; boundary={boundary}'}
)

try:
    with urllib.request.urlopen(req) as resp:
        print('PDF Upload Success:', resp.status, resp.read().decode())
except urllib.error.HTTPError as e:
    print('PDF HTTPError:', e.code, e.read().decode())
except Exception as e:
    print('PDF Error:', e)
