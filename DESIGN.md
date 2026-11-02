# DESIGN DIRECTION: Neubrutalism Edukasi (Bold, Playful, Super Clean & Readable)

## 1. Identity & Mood
Gaya **Neubrutalism**: Tegas, berani, jujur, dan playful namun tetap sangat nyaman dibaca oleh murid di smartphone.
- Karakter: Hard outlines (2-3px solid), flat vibrant colors (tidak ada gradien/blur/glassmorphism), solid offset drop-shadows (3px 3px 0 #000).
- Tone: Menyenangkan, percaya diri, tanpa AI slop.

## 2. Dial Setting
- **ENERGY: 3 (Bold)**
- **RHYTHM: 2 (Balanced)**
- **MOTION: 1 (Snappy / Tactile)**: Pergeseran translate tactile saat klik/hover, tanpa float/bounce melayang.

## 3. Visual System
- **Borders:** 2px - 3px solid #000 (atau border kontras tinggi di dark mode).
- **Shadows:** Hard offset shadow: `3px 3px 0 #000` (atau `3px 3px 0 var(--border)` di dark mode). Hover: `1px 1px 0`, active: `0px 0px 0` (tactile press).
- **Radius:** 8px (rounded neubrutalism, friendly for students).
- **Warna Pokok:**
  - Kuning cerah / Primary: `#FFE500` / `#FFEB3B`
  - Merah coral: `#FF5252`
  - Biru pop: `#3B82F6`
  - Base light: `#FBFBEE` / off-white cream
  - Base dark: `#121212` dengan outline `#FFFFFF` / border kontras tinggi.
- **Tipografi:** Plus Jakarta Sans (bold & punchy untuk judul, readable untuk artikel).
