import urllib.request
import urllib.error
import io
from PIL import Image, ImageDraw

# Create image with some text
img = Image.new('RGB', (400, 200), color=(255, 255, 255))
d = ImageDraw.Draw(img)
d.text((20, 40), "Preah Reach Ana Chak Kampuchea", fill=(0, 0, 0))
buf = io.BytesIO()
img.save(buf, format='PNG')
png_bytes = buf.getvalue()

boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
parts = [
    (f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="test.png"\r\nContent-Type: image/png\r\n\r\n').encode('utf-8'),
    png_bytes,
    (f'\r\n--{boundary}\r\nContent-Disposition: form-data; name="officer_name"\r\n\r\nofficer\r\n--{boundary}--\r\n').encode('utf-8')
]
body = b''.join(parts)

req = urllib.request.Request(
    'https://3-25-134-111.sslip.io/api/v1/documents/upload',
    data=body,
    headers={
        'Content-Type': f'multipart/form-data; boundary={boundary}',
        'User-Agent': 'Mozilla/5.0'
    }
)

try:
    with urllib.request.urlopen(req) as resp:
        print('Upload Success:', resp.status, resp.read().decode())
except urllib.error.HTTPError as e:
    print('HTTPError:', e.code, e.read().decode())
except Exception as e:
    print('Error:', e)
