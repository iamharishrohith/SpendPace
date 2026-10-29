import urllib.request
import os
import sys
import time

url = 'https://expo.dev/artifacts/eas/R2j6d_AxvYWVj0387DhdrMovhlE9hFW0ZZF_ibJjEQQ.apk'
dest = 'd:/Shortfundly/spendpace/spendpace-expo.apk'
dest_public = 'd:/Shortfundly/spendpace/public/spendpace-expo.apk'

req = urllib.request.Request(url, headers={
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
})

print("Opening stream to EAS artifact...")
t0 = time.time()
with urllib.request.urlopen(req) as resp:
    total_size = int(resp.headers.get('Content-Length', 0))
    print(f"Total size to download: {total_size} bytes ({total_size / (1024*1024):.2f} MB)")
    
    downloaded = 0
    with open(dest, 'wb') as f:
        while True:
            chunk = resp.read(1024 * 256)
            if not chunk:
                break
            f.write(chunk)
            downloaded += len(chunk)
            percent = (downloaded / total_size) * 100 if total_size else 0
            sys.stdout.write(f"\rProgress: {percent:.1f}% ({downloaded / (1024*1024):.1f} MB) in {time.time()-t0:.1f}s")
            sys.stdout.flush()

print("\nDownload finished! Copying to public web folder...")
with open(dest, 'rb') as src, open(dest_public, 'wb') as dst:
    dst.write(src.read())

print(f"Verified complete APK: {os.path.getsize(dest)} bytes")
