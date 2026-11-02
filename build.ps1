param(
    [string]$Target = "boy",
    [switch]$Watch,
    [switch]$Deploy,
    [ValidateSet("cloudflare", "firebase")][string]$Provider = "cloudflare"
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

# --- Deploy ke Cloudflare Pages (Multi-Tenant Semua Guru Sekaligus) ---
if ($Deploy -and $Provider -eq "cloudflare") {
    Write-Host "[*] Menjalankan Multi-Tenant Build untuk semua guru di folder 'guru/'..." -ForegroundColor Cyan
    node build-all.mjs
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[X] Build gagal!" -ForegroundColor Red
        exit 1
    }

    Write-Host "`n[*] Melakukan 1-Klik Deploy ke Cloudflare Pages (Project: simple-materi)..." -ForegroundColor Cyan
    npx wrangler pages deploy dist --project-name="simple-materi" --branch="main" --commit-dirty=true
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n========================================================" -ForegroundColor Green
        Write-Host "[OK] DEPLOY BERHASIL KE CLOUDFLARE PAGES!" -ForegroundColor Green
        Write-Host "     Project Cloudflare : simple-materi" -ForegroundColor Cyan
        Write-Host "     Domain Utama       : https://simple-materi.pages.dev" -ForegroundColor Cyan
        Write-Host "     Subdomain Guru     : https://<nama-folder>.manurhidma.my.id" -ForegroundColor Green
        Write-Host "========================================================" -ForegroundColor Green
    } else {
        Write-Host "[X] Gagal deploy ke Cloudflare Pages." -ForegroundColor Red
    }
    exit $LASTEXITCODE
}

# --- Build & Deploy Legacy / Firebase (Opsional) ---
if ($Deploy -and $Provider -eq "firebase") {
    $env:GURU = $Target
    npm run build
    if (Get-Command firebase -ErrorAction SilentlyContinue) {
        firebase deploy --only hosting:$Target
        exit $LASTEXITCODE
    }
    Write-Host "[X] CLI firebase belum terpasang: npm install -g firebase-tools" -ForegroundColor Red
    exit 1
}

# --- Build situs tunggal lokal untuk preview ---
Write-Host "[*] Bangunan situs untuk guru '$Target'..." -ForegroundColor Cyan
$env:GURU = $Target
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "[X] Build gagal - baca pesan di atas." -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Situs siap di folder 'out/'." -ForegroundColor Green
Write-Host "[*] Lihat di http://localhost:4177 - Ctrl+C menghentikan." -ForegroundColor Cyan
npx serve out -l 4177
