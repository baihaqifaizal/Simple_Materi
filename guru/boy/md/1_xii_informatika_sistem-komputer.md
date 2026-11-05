## BAB 1: PENDAHULUAN

### 1.1 Apa Itu Sistem Komputer?

Sistem Komputer adalah kombinasi dari elemen-elemen fisik, logis, dan manusia yang bekerja sama secara terintegrasi untuk menerima data (input), memprosesnya secara matematis/logis (processing), menyimpan hasilnya (storage), dan menghasilkan informasi (output).

Kata "Sistem" berarti jika salah satu komponen tidak ada atau rusak, maka seluruh perangkat tidak dapat berfungsi sebagaimana mestinya.

### 1.2 Model Kerja Universal: Siklus IPOS
Seluruh perangkat komputasi di dunia, mulai dari superkomputer, PC Windows, iPhone, hingga mikrokontroler pembuat kopi otomatis, mengikuti siklus dasar yang sama: **IPOS (Input - Process - Output - Storage)**.

> *[Gambar: Diagram Sistem Komputer - Input -> Perangkat Input -> Processing (CPU) <-> Storage (Memori) -> Perangkat Output -> Output]*

## BAB 2: HARDWARE (PERANGKAT KERAS)
Hardware adalah seluruh bagian fisik dari sistem komputer yang dapat disentuh, dilihat, dan diukur.
### 2.1 Anatomi Hardware Utama (Pendekatan Universal)

Semua sistem komputer membagi hardware menjadi 4 blok dasar:
**A. Central Processing Unit (CPU / MCU Core)**
Otak utama pengendali eksekusi instruksi.
*   **Dasar:** CPU mengambil instruksi dari memori, menerjemahkannya, dan mengeksekusinya.
*   **Komponen Didalamnya:**
    *   **ALU (Arithmetic Logic Unit):** Melakukan perhitungan matematika (+, -, *, :) dan logika (AND, OR, NOT).
    *   **CU (Control Unit):** Mengatur lalu lintas data, dan memberi perintah ke komponen lain.
    *   **Register:** Memori super cepat berkapasitas sangat kecil di dalam CPU untuk menyimpan variabel sementara saat komputasi berlangsung.
*   **Pada Mikrokontroler:** CPU dikemas bersama komponen lain dalam satu chip tunggal yang disebut **SoC (System on Chip)** atau **MCU (Microcontroller Unit)**.

**B. Antaruka Komunikasi Utama**
1.  **Parallel Bus (PCle, DDR Bus):** Mengirim Banyak Bit Sekaligus. Sangat Cepat (PC).
2.  **Serial Bus (Universal Interface):** Mengirim Bit Demi Bit Berurutan. Efisien (HP, Sensor).
    *   *USB / THUNDERBOLT:* Protokol Serial Tingkat Tinggi.
    *   *Skala Kecepatan & Kompleksitas:* [UART] > [I2C] > [USB/Parallel]
## BAB 3: SOFTWARE (PERANGKAT LUNAK)
Software adalah sekumpulan instruksi, data, atau program terstruktur yang memberi tahu hardware apa yang harus dilakukan. Hardware tanpa software ibarat tubuh tanpa jiwa.

> *[Gambar: Piramida Hirarki Software]*
> *   **LEVEL 4:** APLIKASI PENGGUNA (Browser, Game, WhatsApp, App Kustom)
> *   **LEVEL 3:** SISTEM OPERASI / OS / RTOS (Windows, Linux, Android, FreeRTOS)
> *   **LEVEL 2:** ABSTRAKSI HARDWARE / DRIVER (Jembatan penghubung Hardware & Software)
> *   **LEVEL 1:** FIRMWARE / BOOTLOADER (BIOS / UEFI / Arduino Bootloader)
> *   **LEVEL 0:** HARDWARE FISIK (Transistor, Silicon, Komponen Dasar)

### 3.1 Lapisan-Lapisan Software Khusus
**A. FIRMWARE & BOOTLOADER - Fondasi Pertama**
*   Software paling dasar di memori non-volatile (ROM/Flash).
*   **Tugas Utama:** Menghidupkan & inisialisasi awal hardware.
*   **PC:** BIOS / UEFI.
*   **Mikrokontroler:** Bootloader (bisa upload kode via kabel USB tanpa alat tambahan).

**B. DRIVER & HAL - Hardware Abstraction Layer**
*   **Driver:** Penerjemah bahasa antara OS dan hardware.
*   **HAL:** Menyembunyikan kerumitan kode mesin agar ramah manusia.
    *   *Tanpa HAL (Kode Rumit):* [Gambar: Chip dengan panah bolak-balik]
    *   *Dengan HAL (Kode Mudah):* `digitalWrite(13, HIGH)` [Gambar: Lampu LED menyala]

**C. System Software (Sistem Operasi)**
Sistem Operasi (OS) bertindak sebagai pengelola sumber daya (*Resource Manager*) seluruh sistem komputer.
1.  **General Purpose OS (GPOS - Windows, Linux, Android, macOS):**
    *   Dirancang untuk multitasking berat, efisiensi ruang, dan antarmuka kaya visual.
    *   Menggunakan *Non-Deterministic Scheduling* (Waktu respon tidak dijamin presisi hingga milidetik).
2.  **Real-Time Operating System (RTOS - FreeRTOS, VxWorks):**
    *   Digunakan pada sistem tertanam / mikrokontroler mahir (Mobil pengereman ABS, Drone, Alat Medis).
    *   Bersifat *Deterministic*: Menjamin eksekusi tugas tepat waktu hingga skala mikrodetik (*microsecond*).
3.  **Bare-Metal Programming (Tanpa OS):**
    *   Pemrograman langsung pada mikrokontroler sederhana (misal Arduino dasar).
    *   Program berjalan dalam ikal tak terbatas (*Infinite Loop*) berupa `void setup()` dan `void loop()`.
## BAB 4: BRAINWARE (PERANGKAT INSANI)
### 4.1 Tingkatan dan Peran Brainware

> *[Gambar: Tiga Kolom Brainware]*
> *   **KOLOM 1 - ARCHITECT & DESIGNER:** Perancang Sistem, Hardware Eng, Network Planner.
> *   **KOLOM 2 - DEVELOPER & ENGINEER:** Pembuat Program, Firmware, SysAdmin.
> *   **KOLOM 3 - END USER & OPERATOR:** Pengguna Umum, Operator, Konsumen App.

1.  **System Architect & Hardware Engineer:** Merancang arsitektur papan sirkuit (PCB), memilih chip CPU/MCU yang sesuai, dan merancang topologi komunikasi data.
2.  **Firmware & Embedded Software Engineer:** Menulis kode tingkat rendah (C/C++, Assembly) untuk mengendalikan register, sensor, dan komunikasi perangkat terikat.
3.  **Software & Application Developer:** Menulis aplikasi tingkat atas (Python, Java, C#, JS) yang berinteraksi dengan manusia atau sistem cloud.
4.  **System Administrator & DevOps:** Menjaga keandalan sistem, server, keamanan jaringan, dan manajemen pembaruan software.
5.  **End User (Pengguna Akhir):** Menggunakan hasil akhir sistem komputer untuk mendukung pekerjaan sehari-hari.

### 4.2 Interaksi Manusia dan Komputer (Human-Computer Interface / HCI)
> *[Gambar: Perbandingan GUI, CLI, Physical HMI, Serial Telemetry]*

*   **GUI (Graphical User Interface):** Jendela visual, ikon, tombol pada monitor PC/HP.
*   **CLI (Command Line Interface):** Teks perintah berbasis terminal.
*   **Physical HMI (Human-Machine Interface):** Layar sentuh industri, tombol panel, indikator LED pada mesin cuci/mobil.
*   **Serial Telemetry Interface:** Layar monitor serial (misal Arduino Serial Monitor) untuk inspeksi logika perangkat mikrokontroler.
## BAB 5: KONSEP SISTEM & INTERAKSI HARMONIS
Sistem adalah cara keempat komponen tersebut saling mengikat dan mengeksekusi skenario dunia nyata secara harmonis.

> *[Gambar: Tahapan Sistem]*
> *   **TAHAP 1. BRAINWARE:** Menekan Tombol Sakelar
> *   **TAHAP 2. HARDWARE:** Sinyal Listrik GPIO
> *   **TAHAP 3. SOFTWARE:** Interrupt & Driver
> *   **TAHAP 4. SISTEM (AKSI):** Logika Output Aktif
### 5.1 Studi Kasus Perbandingan Universal

Mari kita lihat bagaimana ke-4 pilar bekerja dalam 3 perangkat yang berbeda untuk menyelesaikan tugas yang serupa: **Menyalakan Lampu ketika Tombol Ditekan.**
#### Skenario A: Komputer Desktop (PC Windows)

> *[Gambar: Skenario PC Windows - Brainware (Klik Mouse) -> Hardware Input (USB) -> Software (OS & Aplikasi) -> Hardware Output (Gelombang Radio)]*

1.  **Brainware:** Pengguna mengklik ikon "Lampu ON" di aplikasi Smart Home menggunakan Mouse.
2.  **Hardware Input:** Mouse mengirim sinyal pergerakan dan klik melalui bus USB ke CPU.
3.  **Software:**
    *   Driver USB menangani interupsi hardware.
    *   OS Windows meneruskan pesan klik ke Aplikasi Smart Home.
    *   Aplikasi Smart Home mengirim perintah data melalui kartu Wi-Fi.
4.  **Hardware Output:** Kartu Wi-Fi memancarkan gelombang radio ke jaringan.
5.  **Sistem:** Seluruh proses melibatkan ribuan lapisan abstraksi software dan miliaran transistor.
#### Skenario B: Mikrokontroler Bare-Metal (Arduino)

> *[Gambar: Skenario Arduino - Tekan Push Button -> Sinyal 5V ke 0V (LOW) -> Eksekusi Kode Langsung -> LED Menyala]*

1.  **Brainware:** Teknisi menekan sakelar Push Button fisik yang terhubung ke Pin D2.
2.  **Hardware Input:** Perubahan tegangan listrik dari 5V ke 0V (Low) terjadi pada Pin GPIO D2.
3.  **Software & Sistem:** Eksekusi Kode C++ secara langsung (LED High).
#### Skenario C: Perangkat IoT Pintar (ESP32)

> *[Gambar: Skenario ESP32 - Tekan HP/Tombol Fisik -> RTOS (Core 0 Wi-Fi, Core 1 Logika) -> Proses Data Wi-Fi & Pin (SoC) -> Relay Aktif & Lampu 220V Nyala]*

1.  **Brainware:** Pengguna menekan tombol via aplikasi HP atau sakelar fisik.
2.  **Software (Dual Layer):** RTOS pada ESP32 membagi tugas: Core 0 mengurus komunikasi Wi-Fi/MQTT, Core 1 mengurus pemrosesan logika tombol.
3.  **Hardware:** SoC ESP32 memproses data dari Wi-Fi sekaligus pin input.
4.  **Output:** Pin GPIO mengaktifkan komponen Relay untuk menyalakan lampu daya tinggi 220V.
## BAB 7: PERBANDINGAN

**Analogi Sistem Komputer dengan Restoran**

| Komponen Sistem | Analogi Restoran | Fungsi dalam Sistem |
| :--- | :--- | :--- |
| **Hardware** | Dapur, Kompor, Bahan Makanan, Piring | Elemen fisik tempat proses terjadi. |
| **Software** | Buku Resep & Standar Operasional (SOP) | Aturan logis tentang cara mengolah input menjadi output. |
| **Brainware** | Koki, Pelayan, & Pelanggan | Pengendali, pembuat, dan penikmat hasil proses. |
| **Sistem** | Operasional Keseluruhan Restoran | Alur kerja yang membuat pesanan pelanggan bisa menjadi makanan siap makan. |

**Perbandingan Spesifikasi Perangkat**

| Kriteria Sistem | Komputer Desktop / Server | Smartphone Modern | Mikrokontroler (ESP32/Arduino) |
| :--- | :--- | :--- | :--- |
| **Arsitektur CPU** | x86-64 (Intel/AMD) / ARM64 | ARM64 / RISC-V | AVR (8-bit) / Xtensa 32-bit / ARM Cortex-M |
| **Frekuensi Clock** | 2.5 GHz - 5.5 GHz | 1.8 GHz - 3.4 GHz | 16 MHz - 240 MHz |
| **Kapasitas RAM** | 8 GB - 128 GB (DDR4/DDR5) | 4 GB - 16 GB (LPDDR5) | 2 KB (Arduino) - 520 KB (ESP32) |
| **Penyimpanan Kode** | SSD NVMe / HDD (SATA) | Flash Memory (UFS/eMMC) | Internal Flash (32KB - 16MB) |
| **Sistem Operasi** | Windows, Linux | Android, iOS | Bare-Metal / FreeRTOS |

## HUKUM UTAMA SISTEM KOMPUTER
1.  **Prinsip Abstraksi:** Semakin tinggi tingkatan software (aplikasi visual), semakin mudah dipahami manusia, tetapi semakin jauh dari kontrol langsung hardware.
2.  **Prinsip Keterbatasan Hardware:** Software sejago apa pun tidak dapat melampaui batasan fisik hardware (kapasitas memori, batas frekuensi clock, dan jumlah arus listrik).
3.  **Prinsip Human Centric:** Seanggih apa pun hardware dan software dirancang, kinerjanya dinilai dari sejauh mana sistem tersebut menyelesaikan masalah atau membantu Brainware (manusia).