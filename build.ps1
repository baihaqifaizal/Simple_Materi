param(
    [string]$Target = "boy",
    [switch]$Watch,
    [switch]$Deploy
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

# --- Prasyarat ---
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[X] Node.js belum terpasang. Unduh: https://nodejs.org" -ForegroundColor Red
    exit 1
}
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "[X] npm tidak ditemukan, cek Node.js kamu." -ForegroundColor Red
    exit 1
}

if (-not (Test-Path node_modules)) {
    Write-Host "[*] Pasang dependensi pertama kali (sekali saja)..." -ForegroundColor Cyan
    npm install
}

# --- Mode WATCH: tulis materi sembari hasil terlihat live ---
if ($Watch) {
    Write-Host "[*] Mode tulis: materi di guru/$Target/md terlihat live di http://localhost:3000 - Ctrl+C berhenti." -ForegroundColor Cyan
    $env:GURU = $Target
    npx next dev
    exit 0
}

# --- Build situs statis ---
Write-Host "[*] Bangunan situs untuk guru '$Target'..." -ForegroundColor Cyan
$env:GURU = $Target
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "[X] Build gagal - baca pesan di atas." -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Situs siap di folder 'out/'." -ForegroundColor Green
Write-Host "    Sumber materi: guru/$Target/md/*.md | Gambar: guru/$Target/gambar/" -ForegroundColor DarkGray

# --- Deploy (opsional, butuh setup Firebase, baca README) ---
if ($Deploy) {
    if (Get-Command firebase -ErrorAction SilentlyContinue) {
        firebase deploy --only hosting:$Target
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[OK] Terbit! Halaman: https://$Target.manurhidma.my.id" -ForegroundColor Green
        }
        exit $LASTEXITCODE
    }
    Write-Host "[X] CLI firebase belum terpasang: npm install -g firebase-tools" -ForegroundColor Red
    exit 1
}

# --- Preview lokal ---
Write-Host "[*] Lihat di http://localhost:4177 - Ctrl+C menghentikan." -ForegroundColor Cyan
npx serve out -l 4177

