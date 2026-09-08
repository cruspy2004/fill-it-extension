#!/usr/bin/env bash
# Produces fill-it-v<version>.zip for Chrome Web Store upload.
# Ships only runtime files — repo docs stay out so the reviewer isn't left
# wondering why a privacy policy page is inside the bundle.
#
# Uses .NET's ZipFile directly rather than Compress-Archive, because
# Compress-Archive writes Windows backslashes as path separators and the ZIP
# spec requires forward slashes.
set -euo pipefail
cd "$(dirname "$0")"

VERSION=$(node -p "require('./manifest.json').version")
OUT="fill-it-v${VERSION}.zip"
rm -f "$OUT"

powershell.exe -NoProfile -Command "
  Add-Type -AssemblyName System.IO.Compression.FileSystem
  Add-Type -AssemblyName System.IO.Compression
  \$root = (Get-Location).Path
  \$files = @(
    'manifest.json','background.js','autodetect.js','content.js',
    'popup.html','popup.js','options.html','options.js',
    'welcome.html','welcome.js','LICENSE',
    'lib/fields.js','lib/match.js',
    'icons/icon16.png','icons/icon48.png','icons/icon128.png'
  )
  \$zip = [System.IO.Compression.ZipFile]::Open((Join-Path \$root '$OUT'), 'Create')
  foreach (\$f in \$files) {
    \$full = Join-Path \$root (\$f -replace '/','\')
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(\$zip, \$full, \$f) | Out-Null
  }
  \$zip.Dispose()
" >/dev/null

echo "built $OUT"
