import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { exec } from "node:child_process";

const PORT = 3001;
const GURU_DIR = path.resolve("guru");

if (!fs.existsSync(GURU_DIR)) {
  fs.mkdirSync(GURU_DIR, { recursive: true });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(JSON.stringify(data));
}

function sendHtml(res, html) {
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(html);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(new Error("Format JSON tidak valid"));
      }
    });
    req.on("error", reject);
  });
}

function cleanId(id) {
  return (id || "").toLowerCase().replace(/[^a-z0-9_-]/g, "");
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    res.end();
    return;
  }

  // --- API ROUTES ---

  // 1. GET /api/guru
  if (req.method === "GET" && pathname === "/api/guru") {
    try {
      const items = fs.readdirSync(GURU_DIR, { withFileTypes: true });
      const gurus = items
        .filter((d) => d.isDirectory())
        .map((d) => {
          const id = d.name;
          const settingsPath = path.join(GURU_DIR, id, "settings.json");
          let settings = null;
          if (fs.existsSync(settingsPath)) {
            try {
              settings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
            } catch {}
          }
          const mdDir = path.join(GURU_DIR, id, "md");
          const mdFiles = fs.existsSync(mdDir)
            ? fs.readdirSync(mdDir).filter((f) => f.endsWith(".md"))
            : [];
          return { id, settings, mdCount: mdFiles.length };
        });
      return sendJson(res, 200, { success: true, gurus });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 2. POST /api/guru
  if (req.method === "POST" && pathname === "/api/guru") {
    try {
      const body = await readBody(req);
      const id = cleanId(body.subdomain || body.id);
      if (!id) {
        return sendJson(res, 400, { success: false, error: "Subdomain/ID guru wajib diisi (alfanumerik)" });
      }

      const targetDir = path.join(GURU_DIR, id);
      if (fs.existsSync(targetDir)) {
        return sendJson(res, 400, { success: false, error: `Guru dengan folder '${id}' sudah ada` });
      }

      fs.mkdirSync(path.join(targetDir, "md"), { recursive: true });
      fs.mkdirSync(path.join(targetDir, "gambar"), { recursive: true });

      const settings = {
        namaGuru: body.namaGuru || id,
        judulSitus: `Materi Pembelajaran Pak ${body.namaGuru || id}`,
        deskripsi: `Portal materi dan tugas siswa untuk pelajaran Pak ${body.namaGuru || id}`,
        fotoProfil: "profile.jpg",
        pemberitahuan: body.pemberitahuan || "Selamat datang siswa-siswi! Silakan pelajari materi yang tersedia.",
        temaWarna: body.temaWarna || "biru",
        pelajaran: [
          {
            judul: `Pelajaran X Semester 1`,
            materi: [
              {
                judulMateri: "Pengenalan Materi",
                file: "pengenalan.md",
              },
            ],
          },
        ],
      };

      fs.writeFileSync(path.join(targetDir, "settings.json"), JSON.stringify(settings, null, 2), "utf8");

      const sampleSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="#FFE500" stroke="#000" stroke-width="8"/><circle cx="150" cy="115" r="55" fill="#3B82F6" stroke="#000" stroke-width="8"/><path d="M70,260 C70,195 110,180 150,180 C190,180 230,195 230,260" fill="#FF5252" stroke="#000" stroke-width="8"/></svg>`;
      fs.writeFileSync(path.join(targetDir, "gambar", "profile.jpg"), sampleSvg, "utf8");

      const sampleMd = `# Pengenalan Materi\n\nSelamat datang di materi pembelajaran.\n\n## Tujuan Pembelajaran\n1. Memahami materi dasar.\n\n:::youtube dQw4w9WgXcQ\n`;
      fs.writeFileSync(path.join(targetDir, "md", "pengenalan.md"), sampleMd, "utf8");

      return sendJson(res, 201, { success: true, id, message: `Guru ${id} berhasil dibuat` });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 3. DELETE /api/guru/:id
  const matchDeleteGuru = pathname.match(/^\/api\/guru\/([a-z0-9_-]+)$/);
  if (req.method === "DELETE" && matchDeleteGuru) {
    try {
      const id = matchDeleteGuru[1];
      const targetDir = path.join(GURU_DIR, id);
      if (!fs.existsSync(targetDir)) {
        return sendJson(res, 404, { success: false, error: "Guru tidak ditemukan" });
      }
      fs.rmSync(targetDir, { recursive: true, force: true });
      return sendJson(res, 200, { success: true, message: `Folder guru ${id} berhasil dihapus` });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 4. GET /api/guru/:id/settings
  const matchGetSettings = pathname.match(/^\/api\/guru\/([a-z0-9_-]+)\/settings$/);
  if (req.method === "GET" && matchGetSettings) {
    try {
      const id = matchGetSettings[1];
      const filePath = path.join(GURU_DIR, id, "settings.json");
      if (!fs.existsSync(filePath)) {
        return sendJson(res, 404, { success: false, error: "settings.json belum ada" });
      }
      const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
      return sendJson(res, 200, { success: true, settings: data });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 5. PUT /api/guru/:id/settings
  const matchPutSettings = pathname.match(/^\/api\/guru\/([a-z0-9_-]+)\/settings$/);
  if (req.method === "PUT" && matchPutSettings) {
    try {
      const id = matchPutSettings[1];
      const body = await readBody(req);
      const filePath = path.join(GURU_DIR, id, "settings.json");
      fs.writeFileSync(filePath, JSON.stringify(body, null, 2), "utf8");

      // Otomatis pastikan file-file .md yang didaftarkan ada di folder md/
      const mdDir = path.join(GURU_DIR, id, "md");
      if (Array.isArray(body.pelajaran)) {
        for (const pel of body.pelajaran) {
          if (Array.isArray(pel.materi)) {
            for (const m of pel.materi) {
              if (m && m.file) {
                let fname = m.file.endsWith(".md") ? m.file : m.file + ".md";
                const p = path.join(mdDir, fname);
                if (!fs.existsSync(p)) {
                  fs.writeFileSync(p, `# ${m.judulMateri || "Materi Baru"}\n\nTulis isi materi di sini.\n`, "utf8");
                }
              }
            }
          }
        }
      }

      return sendJson(res, 200, { success: true, message: "Pengaturan berhasil disimpan & materi disinkronkan!" });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 6. GET /api/guru/:id/md
  const matchGetMds = pathname.match(/^\/api\/guru\/([a-z0-9_-]+)\/md$/);
  if (req.method === "GET" && matchGetMds) {
    try {
      const id = matchGetMds[1];
      const mdDir = path.join(GURU_DIR, id, "md");
      if (!fs.existsSync(mdDir)) return sendJson(res, 200, { success: true, files: [] });
      const files = fs.readdirSync(mdDir).filter((f) => f.endsWith(".md"));
      return sendJson(res, 200, { success: true, files });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 7. GET /api/guru/:id/md/:file
  const matchGetMdContent = pathname.match(/^\/api\/guru\/([a-z0-9_-]+)\/md\/([a-zA-Z0-9_.-]+)$/);
  if (req.method === "GET" && matchGetMdContent) {
    try {
      const id = matchGetMdContent[1];
      const file = matchGetMdContent[2];
      const filePath = path.join(GURU_DIR, id, "md", file);
      if (!fs.existsSync(filePath)) {
        return sendJson(res, 404, { success: false, error: "File Markdown tidak ditemukan" });
      }
      const content = fs.readFileSync(filePath, "utf8");
      return sendJson(res, 200, { success: true, content });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 8. PUT /api/guru/:id/md/:file
  const matchPutMdContent = pathname.match(/^\/api\/guru\/([a-z0-9_-]+)\/md\/([a-zA-Z0-9_.-]+)$/);
  if (req.method === "PUT" && matchPutMdContent) {
    try {
      const id = matchPutMdContent[1];
      let file = matchPutMdContent[2];
      if (!file.endsWith(".md")) file += ".md";
      const body = await readBody(req);
      const mdDir = path.join(GURU_DIR, id, "md");
      if (!fs.existsSync(mdDir)) fs.mkdirSync(mdDir, { recursive: true });
      fs.writeFileSync(path.join(mdDir, file), body.content ?? "", "utf8");
      return sendJson(res, 200, { success: true, message: `File ${file} tersimpan` });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 9. DELETE /api/guru/:id/md/:file
  const matchDeleteMd = pathname.match(/^\/api\/guru\/([a-z0-9_-]+)\/md\/([a-zA-Z0-9_.-]+)$/);
  if (req.method === "DELETE" && matchDeleteMd) {
    try {
      const id = matchDeleteMd[1];
      const file = matchDeleteMd[2];
      const filePath = path.join(GURU_DIR, id, "md", file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return sendJson(res, 200, { success: true, message: `File ${file} dihapus` });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // 10. POST /api/deploy (Build & Deploy ke Cloudflare Pages)
  if (req.method === "POST" && pathname === "/api/deploy") {
    try {
      exec("node build-all.mjs && npx wrangler pages deploy dist --project-name=\"simple-materi\" --branch=\"main\" --commit-dirty=true", (err, stdout, stderr) => {
        if (err) {
          console.error("[Deploy Error]", err, stderr);
          return sendJson(res, 500, { success: false, error: err.message || stderr });
        }
        console.log("[Deploy Output]", stdout);
        return sendJson(res, 200, { success: true, message: "Deploy ke Cloudflare Pages berhasil!", output: stdout });
      });
      return;
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // --- DASHBOARD UI ---
  if (pathname === "/" || pathname === "/dashboard") {
    const html = getDashboardHtml();
    return sendHtml(res, html);
  }

  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not Found");
});

function getDashboardHtml() {
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard Admin Guru & Materi</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800;900&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #FBFBEE; color: #121212; }
    .neu-box { border: 3px solid #121212; box-shadow: 4px 4px 0px #121212; border-radius: 12px; }
    .neu-box-sm { border: 2px solid #121212; box-shadow: 3px 3px 0px #121212; border-radius: 8px; }
    .neu-btn { border: 2px solid #121212; box-shadow: 3px 3px 0px #121212; font-weight: 800; transition: all 0.1s; cursor: pointer; }
    .neu-btn:hover { transform: translate(-1px, -1px); box-shadow: 4px 4px 0px #121212; }
    .neu-btn:active { transform: translate(2px, 2px); box-shadow: 1px 1px 0px #121212; }
  </style>
</head>
<body class="p-4 sm:p-8 max-w-6xl mx-auto">
  <!-- Toast Notification -->
  <div id="toast" class="fixed top-5 right-5 z-50 transform transition-all duration-300 translate-y-[-100px] opacity-0 pointer-events-none">
    <div id="toastBox" class="neu-box bg-white px-5 py-3 flex items-center gap-3">
      <span id="toastIcon" class="text-xl">✅</span>
      <span id="toastMsg" class="font-black text-sm">Notifikasi</span>
    </div>
  </div>

  <!-- Header -->
  <header class="neu-box bg-white p-6 mb-8 flex flex-wrap items-center justify-between gap-4">
    <div>
      <span class="inline-block bg-[#FFE500] border-2 border-black text-xs font-black px-2.5 py-0.5 rounded uppercase">Simple Materi Dashboard</span>
      <h1 class="text-2xl sm:text-3xl font-black mt-2">Pusat Kelola Guru & Materi</h1>
      <p class="text-sm font-semibold text-gray-600">Kelola informasi guru, rombel pelajaran, dan modul materi secara visual.</p>
    </div>
    <div class="flex flex-wrap items-center gap-3">
      <button id="btnGlobalDeploy" onclick="triggerDeploy()" class="neu-btn bg-[#F97316] text-white px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm font-black shadow-md hover:bg-[#EA580C]">
        🚀 Simpan & Deploy Sekarang
      </button>
      <button onclick="openTambahGuruModal()" class="neu-btn bg-[#3B82F6] text-white px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm">
        + Tambah Guru Baru
      </button>
    </div>
  </header>

  <!-- Main Content Grid -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <!-- Kolom Kiri: Daftar Guru -->
    <div class="neu-box bg-white p-5 h-fit">
      <div class="flex items-center justify-between border-b-2 border-black pb-3 mb-4">
        <h2 class="font-black text-lg">Daftar Guru</h2>
        <span id="badgeGuruCount" class="bg-gray-100 border border-black text-xs font-bold px-2 py-0.5 rounded">0</span>
      </div>
      <div id="guruList" class="space-y-3">
        <p class="text-sm text-gray-500 font-bold">Memuat data guru...</p>
      </div>
    </div>

    <!-- Kolom Kanan: Detail Guru Aktif -->
    <div class="md:col-span-2 space-y-6">
      <div id="emptyState" class="neu-box bg-white p-8 text-center">
        <h3 class="font-black text-lg mb-1">Pilih Guru</h3>
        <p class="text-sm text-gray-600">Klik salah satu guru di sebelah kiri untuk mengedit informasi & materinya.</p>
      </div>

      <div id="detailPanel" class="hidden space-y-6">
        <!-- Tab Navigation -->
        <div class="flex gap-2">
          <button id="tabSettingsBtn" onclick="switchTab('gui')" class="neu-btn bg-[#FFE500] px-4 py-2 rounded-lg text-xs">Pengaturan Visual (GUI)</button>
          <button id="tabMdBtn" onclick="switchTab('md')" class="neu-btn bg-white px-4 py-2 rounded-lg text-xs">File Markdown (.md)</button>
          <button id="tabJsonBtn" onclick="switchTab('raw_json')" class="neu-btn bg-white px-4 py-2 rounded-lg text-xs">Raw JSON</button>
        </div>

        <!-- Panel 1: GUI Settings Editor -->
        <div id="panelGui" class="neu-box bg-white p-6 space-y-6">
          <div class="flex items-center justify-between border-b-2 border-black pb-3">
            <div>
              <h3 class="font-black text-lg">Profil Guru & Pelajaran (<span id="activeGuruTitle"></span>)</h3>
              <p class="text-xs text-gray-500 font-semibold">Ubah info guru, tambah/hapus pelajaran, dan kelola materi siswa.</p>
            </div>
            <div class="flex items-center gap-2">
              <button onclick="saveGuiSettings()" class="neu-btn bg-[#4ADE80] px-4 py-2 rounded-md text-xs flex items-center gap-1.5 font-black">
                💾 Simpan
              </button>
              <button onclick="saveAndDeploy()" class="neu-btn bg-[#F97316] text-white px-4 py-2 rounded-md text-xs flex items-center gap-1.5 font-black">
                🚀 Simpan & Deploy
              </button>
            </div>
          </div>

          <!-- Bagian 1: Identitas Guru (Accordion Expand/Collapse - Default Collapse) -->
          <div class="rounded-xl border-2 border-black overflow-hidden bg-gray-50">
            <button type="button" onclick="toggleSection('bodyProfilGuru', 'arrowProfilGuru')" class="w-full flex items-center justify-between p-4 bg-gray-100 hover:bg-gray-200 text-left font-black text-sm transition-colors">
              <span class="flex items-center gap-2">
                <span>👤</span>
                <span>Informasi Profil Guru & Subdomain</span>
              </span>
              <span id="arrowProfilGuru" class="transform transition-transform text-xs">▶</span>
            </button>
            <div id="bodyProfilGuru" class="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t-2 border-black hidden">
              <div>
                <label class="block text-xs font-black uppercase mb-1">Nama Guru</label>
                <input id="guiNamaGuru" class="w-full p-2 border-2 border-black rounded-md text-sm font-bold bg-white" placeholder="Contoh: Boy">
              </div>
              <div>
                <label class="block text-xs font-black uppercase mb-1">Judul Situs</label>
                <input id="guiJudulSitus" class="w-full p-2 border-2 border-black rounded-md text-sm bg-white">
              </div>
              <div>
                <label class="block text-xs font-black uppercase mb-1">Foto Profil</label>
                <input id="guiFotoProfil" class="w-full p-2 border-2 border-black rounded-md text-sm bg-white" placeholder="profile.jpg">
              </div>
              <div class="sm:col-span-2">
                <label class="block text-xs font-black uppercase mb-1">Deskripsi Halaman</label>
                <input id="guiDeskripsi" class="w-full p-2 border-2 border-black rounded-md text-sm bg-white">
              </div>
              <div class="sm:col-span-2">
                <label class="block text-xs font-black uppercase mb-1">Pemberitahuan Guru (Pengumuman)</label>
                <textarea id="guiPemberitahuan" rows="2" class="w-full p-2 border-2 border-black rounded-md text-sm bg-white"></textarea>
              </div>
            </div>
          </div>

          <!-- Bagian 2: Daftar Pelajaran & Materi Bertingkat (Accordion Expand/Collapse) -->
          <div class="rounded-xl border-2 border-black overflow-hidden bg-white">
            <div class="flex items-center justify-between p-4 bg-gray-100">
              <button type="button" onclick="toggleSection('bodyDaftarPelajaran', 'arrowDaftarPelajaran')" class="flex items-center gap-2 font-black text-sm text-left hover:text-blue-600">
                <span>📚</span>
                <span>Daftar Pelajaran & Modul Materi</span>
                <span id="arrowDaftarPelajaran" class="transform transition-transform text-xs">▼</span>
              </button>
              <button onclick="openModalTambahPelajaran()" class="neu-btn bg-[#3B82F6] text-white px-3 py-1.5 rounded-md text-xs">
                + Tambah Pelajaran
              </button>
            </div>

            <!-- Kontainer Kartu Pelajaran -->
            <div id="bodyDaftarPelajaran" class="p-4 space-y-4 border-t-2 border-black">
              <div id="guiPelajaranContainer" class="space-y-4"></div>
            </div>
          </div>
        </div>

        <!-- Panel 2: File MD Editor -->
        <div id="panelMd" class="hidden space-y-4">
          <div class="neu-box bg-white p-5">
            <div class="flex items-center justify-between mb-3 border-b-2 border-black pb-2">
              <h3 class="font-black text-md">Berkas Markdown (.md) di folder</h3>
              <button onclick="openModalNewMd()" class="neu-btn bg-[#3B82F6] text-white px-3 py-1 rounded text-xs">+ File MD Baru</button>
            </div>
            <div id="mdList" class="flex flex-wrap gap-2"></div>
          </div>

          <div id="mdEditorWrapper" class="neu-box bg-white p-5 space-y-3 hidden">
            <div class="flex items-center justify-between">
              <h4 class="font-black text-sm" id="activeMdFileName">Edit File</h4>
              <div class="flex gap-2">
                <button onclick="konfirmasiHapusActiveMd()" class="neu-btn bg-[#FF5252] text-white px-3 py-1 rounded text-xs">Hapus File</button>
                <button onclick="saveActiveMd()" class="neu-btn bg-[#4ADE80] px-4 py-1 rounded text-xs">Simpan Materi</button>
              </div>
            </div>
            <textarea id="mdContentEditor" rows="16" class="w-full font-mono text-xs p-4 bg-gray-50 border-2 border-black rounded-lg focus:outline-none"></textarea>
          </div>
        </div>

        <!-- Panel 3: Raw JSON Fallback -->
        <div id="panelJson" class="hidden neu-box bg-white p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-black text-lg">Raw settings.json</h3>
            <button onclick="saveRawJson()" class="neu-btn bg-[#4ADE80] px-4 py-1.5 rounded-md text-xs">Simpan JSON</button>
          </div>
          <textarea id="rawJsonEditor" rows="18" class="w-full font-mono text-xs p-4 bg-gray-50 border-2 border-black rounded-lg focus:outline-none"></textarea>
        </div>
      </div>
    </div>
  </div>

  <!-- ================= POPUP CARDS / MODALS ================= -->

  <!-- 1. Modal Tambah Guru -->
  <div id="modalTambahGuru" class="fixed inset-0 bg-black/60 flex items-center justify-center p-4 hidden z-50">
    <div class="neu-box bg-white p-6 max-w-md w-full space-y-4 animate-in fade-in zoom-in duration-150">
      <div class="flex items-center justify-between border-b-2 border-black pb-2">
        <h3 class="font-black text-xl">Tambah Guru Baru</h3>
        <button onclick="closeModal('modalTambahGuru')" class="text-xl font-black">✕</button>
      </div>
      <div>
        <label class="block text-xs font-black uppercase mb-1">Subdomain (Folder Guru)</label>
        <input id="inputSubdomain" class="w-full p-2.5 border-2 border-black rounded-md text-sm font-bold" placeholder="contoh: budi">
        <p class="text-[11px] text-gray-500 mt-1">Akan jadi http://<span class="font-bold">budi</span>.manurhidma.my.id</p>
      </div>
      <div>
        <label class="block text-xs font-black uppercase mb-1">Nama Lengkap Guru</label>
        <input id="inputNamaGuru" class="w-full p-2.5 border-2 border-black rounded-md text-sm" placeholder="contoh: Budi Santoso">
      </div>
      <div class="flex justify-end gap-2 pt-2 border-t-2 border-black/10">
        <button onclick="closeModal('modalTambahGuru')" class="neu-btn bg-gray-200 px-4 py-2 rounded-md text-xs">Batal</button>
        <button onclick="submitTambahGuru()" class="neu-btn bg-[#3B82F6] text-white px-5 py-2 rounded-md text-xs">Buat Guru</button>
      </div>
    </div>
  </div>

  <!-- 2. Modal Tambah Pelajaran / Rombel -->
  <div id="modalTambahPelajaran" class="fixed inset-0 bg-black/60 flex items-center justify-center p-4 hidden z-50">
    <div class="neu-box bg-white p-6 max-w-md w-full space-y-4 animate-in fade-in zoom-in duration-150">
      <div class="flex items-center justify-between border-b-2 border-black pb-2">
        <h3 class="font-black text-xl">Tambah Pelajaran / Rombel</h3>
        <button onclick="closeModal('modalTambahPelajaran')" class="text-xl font-black">✕</button>
      </div>
      <div>
        <label class="block text-xs font-black uppercase mb-1">Nama Pelajaran / Rombel</label>
        <input id="inputNamaPelajaran" class="w-full p-2.5 border-2 border-black rounded-md text-sm font-bold" placeholder="contoh: Seni X Semester 1">
        <p class="text-[11px] text-gray-500 mt-1">Akan menjadi rute /pelajaran/seni-x-semester-1</p>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-black uppercase mb-1">Kelas</label>
          <select id="inputKelasPelajaran" class="w-full p-2.5 border-2 border-black rounded-md text-sm font-bold bg-white">
            <option value="X">Kelas X</option>
            <option value="XI">Kelas XI</option>
            <option value="XII">Kelas XII</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-black uppercase mb-1">Status Visibilitas</label>
          <select id="inputVisiblePelajaran" class="w-full p-2.5 border-2 border-black rounded-md text-sm font-bold bg-white">
            <option value="active">Active (Tampil)</option>
            <option value="hidden">Hidden (Sembunyi)</option>
          </select>
        </div>
      </div>
      <div class="flex justify-end gap-2 pt-2 border-t-2 border-black/10">
        <button onclick="closeModal('modalTambahPelajaran')" class="neu-btn bg-gray-200 px-4 py-2 rounded-md text-xs">Batal</button>
        <button onclick="submitTambahPelajaran()" class="neu-btn bg-[#3B82F6] text-white px-5 py-2 rounded-md text-xs">Simpan Pelajaran</button>
      </div>
    </div>
  </div>

  <!-- 3. Modal Tambah Materi Baru ke Rombel -->
  <div id="modalTambahMateri" class="fixed inset-0 bg-black/60 flex items-center justify-center p-4 hidden z-50">
    <div class="neu-box bg-white p-6 max-w-md w-full space-y-4 animate-in fade-in zoom-in duration-150">
      <div class="flex items-center justify-between border-b-2 border-black pb-2">
        <h3 class="font-black text-xl">Tambah Modul Materi</h3>
        <button onclick="closeModal('modalTambahMateri')" class="text-xl font-black">✕</button>
      </div>
      <input type="hidden" id="targetPelajaranIndex">
      <div>
        <label class="block text-xs font-black uppercase mb-1">Judul Materi</label>
        <input id="inputJudulMateri" class="w-full p-2.5 border-2 border-black rounded-md text-sm font-bold" placeholder="contoh: Harmoni Musik Barat" oninput="autoGenerateFileName(this.value)">
      </div>
      <div>
        <label class="block text-xs font-black uppercase mb-1">Nama File .md</label>
        <input id="inputNamaFileMd" class="w-full p-2.5 border-2 border-black rounded-md text-sm font-mono text-gray-700" placeholder="contoh: harmoni_musik_barat.md">
      </div>
      <div class="flex justify-end gap-2 pt-2 border-t-2 border-black/10">
        <button onclick="closeModal('modalTambahMateri')" class="neu-btn bg-gray-200 px-4 py-2 rounded-md text-xs">Batal</button>
        <button onclick="submitTambahMateri()" class="neu-btn bg-[#4ADE80] px-5 py-2 rounded-md text-xs font-black">Tambah Materi</button>
      </div>
    </div>
  </div>

  <!-- 4. Modal File MD Baru (di Tab MD) -->
  <div id="modalNewMd" class="fixed inset-0 bg-black/60 flex items-center justify-center p-4 hidden z-50">
    <div class="neu-box bg-white p-6 max-w-md w-full space-y-4 animate-in fade-in zoom-in duration-150">
      <div class="flex items-center justify-between border-b-2 border-black pb-2">
        <h3 class="font-black text-xl">Buat Berkas Markdown (.md)</h3>
        <button onclick="closeModal('modalNewMd')" class="text-xl font-black">✕</button>
      </div>
      <div>
        <label class="block text-xs font-black uppercase mb-1">Nama File</label>
        <input id="inputNewMdName" class="w-full p-2.5 border-2 border-black rounded-md text-sm font-mono" placeholder="contoh: bab_1_pengantar.md">
      </div>
      <div class="flex justify-end gap-2 pt-2 border-t-2 border-black/10">
        <button onclick="closeModal('modalNewMd')" class="neu-btn bg-gray-200 px-4 py-2 rounded-md text-xs">Batal</button>
        <button onclick="submitNewMd()" class="neu-btn bg-[#3B82F6] text-white px-5 py-2 rounded-md text-xs">Buat File</button>
      </div>
    </div>
  </div>

  <!-- 5. Modal Konfirmasi Dialog Universal (Pengganti alert/confirm browser) -->
  <div id="modalConfirm" class="fixed inset-0 bg-black/60 flex items-center justify-center p-4 hidden z-50">
    <div class="neu-box bg-white p-6 max-w-sm w-full space-y-4 animate-in fade-in zoom-in duration-150">
      <div class="flex items-center gap-2">
        <span id="confirmIcon" class="text-2xl">⚠️</span>
        <h3 id="confirmTitle" class="font-black text-lg">Konfirmasi</h3>
      </div>
      <p id="confirmMessage" class="text-sm font-semibold text-gray-700 leading-relaxed">Apakah Anda yakin?</p>
      <div class="flex justify-end gap-2 pt-2 border-t-2 border-black/10">
        <button id="confirmCancelBtn" onclick="closeModal('modalConfirm')" class="neu-btn bg-gray-200 px-4 py-2 rounded-md text-xs">Batal</button>
        <button id="confirmOkBtn" class="neu-btn bg-[#FF5252] text-white px-5 py-2 rounded-md text-xs font-black">Ya, Lanjutkan</button>
      </div>
    </div>
  </div>

  <script>
    let activeGuruId = null;
    let activeMdFile = null;
    let currentSettings = null;

    // Toast UI
    function showToast(msg, icon = '✅') {
      const toast = document.getElementById('toast');
      document.getElementById('toastMsg').innerText = msg;
      document.getElementById('toastIcon').innerText = icon;
      toast.classList.remove('translate-y-[-100px]', 'opacity-0', 'pointer-events-none');
      setTimeout(() => {
        toast.classList.add('translate-y-[-100px]', 'opacity-0', 'pointer-events-none');
      }, 3000);
    }

    // Modal helpers
    function openModal(id) {
      document.getElementById(id).classList.remove('hidden');
    }
    function closeModal(id) {
      document.getElementById(id).classList.add('hidden');
    }

    // Custom Confirmation Modal
    function showConfirmModal({ title, message, icon = '⚠️', okText = 'Ya, Hapus', okClass = 'bg-[#FF5252] text-white', onConfirm }) {
      document.getElementById('confirmTitle').innerText = title;
      document.getElementById('confirmMessage').innerText = message;
      document.getElementById('confirmIcon').innerText = icon;
      const okBtn = document.getElementById('confirmOkBtn');
      okBtn.className = 'neu-btn px-5 py-2 rounded-md text-xs font-black ' + okClass;
      okBtn.innerText = okText;
      okBtn.onclick = () => {
        closeModal('modalConfirm');
        if (onConfirm) onConfirm();
      };
      openModal('modalConfirm');
    }

    async function loadGurus() {
      const res = await fetch('/api/guru');
      const data = await res.json();
      const container = document.getElementById('guruList');
      const badge = document.getElementById('badgeGuruCount');
      if (!data.success || !data.gurus.length) {
        container.innerHTML = '<p class="text-xs text-gray-500 font-bold p-3">Belum ada guru terdaftar.</p>';
        badge.innerText = '0';
        return;
      }
      badge.innerText = data.gurus.length;
      container.innerHTML = data.gurus.map(g => {
        const isSelected = g.id === activeGuruId;
        const nama = g.settings?.namaGuru || g.id;
        return \`
          <div class="neu-box-sm \${isSelected ? 'bg-[#FFE500]' : 'bg-gray-50'} p-3 cursor-pointer flex justify-between items-center transition-all hover:bg-yellow-100" onclick="selectGuru('\${g.id}')">
            <div>
              <div class="font-black text-sm">\${nama}</div>
              <div class="text-[11px] font-bold text-gray-600">\${g.id}.manurhidma.my.id</div>
              <div class="text-[11px] text-gray-500">\${g.mdCount} file md</div>
            </div>
            <button onclick="event.stopPropagation(); konfirmasiHapusGuru('\${g.id}')" class="neu-btn bg-[#FF5252] text-white text-xs px-2 py-1 rounded">✕</button>
          </div>
        \`;
      }).join('');
    }

    async function selectGuru(id) {
      activeGuruId = id;
      document.getElementById('emptyState').classList.add('hidden');
      document.getElementById('detailPanel').classList.remove('hidden');
      document.getElementById('activeGuruTitle').innerText = id;
      loadGurus();
      await loadSettings(id);
      loadMdList(id);
    }

    async function loadSettings(id) {
      const res = await fetch(\`/api/guru/\${id}/settings\`);
      const data = await res.json();
      if (data.success) {
        currentSettings = data.settings;
        renderGuiForm(currentSettings);
        document.getElementById('rawJsonEditor').value = JSON.stringify(currentSettings, null, 2);
      }
    }

    function renderGuiForm(s) {
      document.getElementById('guiNamaGuru').value = s.namaGuru || '';
      document.getElementById('guiJudulSitus').value = s.judulSitus || '';
      document.getElementById('guiFotoProfil').value = s.fotoProfil || 'profile.jpg';
      document.getElementById('guiDeskripsi').value = s.deskripsi || '';
      document.getElementById('guiPemberitahuan').value = s.pemberitahuan || '';

      renderPelajaranList();
    }

    function renderPelajaranList() {
      const container = document.getElementById('guiPelajaranContainer');
      const pelajaranList = currentSettings.pelajaran || [];

      if (!pelajaranList.length) {
        container.innerHTML = '<div class="p-6 border-2 border-dashed border-black rounded-lg text-center text-xs font-bold text-gray-500">Belum ada pelajaran. Klik tombol "+ Tambah Pelajaran" di atas.</div>';
        return;
      }

      container.innerHTML = pelajaranList.map((pel, pIdx) => {
        const materiHtml = (pel.materi || []).map((m, mIdx) => \`
          <div class="flex items-center gap-2 bg-white p-2.5 rounded-md border-2 border-black">
            <span class="text-xs font-mono font-bold text-gray-400">#\${mIdx + 1}</span>
            <input type="text" class="flex-1 text-xs font-bold p-1.5 border border-gray-300 rounded" value="\${m.judulMateri || ''}" placeholder="Judul Materi" onchange="updateMateriJudul(\${pIdx}, \${mIdx}, this.value)">
            <input type="text" class="w-40 text-xs font-mono p-1.5 border border-gray-300 rounded text-gray-600" value="\${m.file || ''}" placeholder="nama_file.md" onchange="updateMateriFile(\${pIdx}, \${mIdx}, this.value)">
            <button onclick="hapusMateri(\${pIdx}, \${mIdx})" class="neu-btn bg-[#FF5252] text-white px-2 py-0.5 rounded text-[11px]" title="Hapus materi">✕</button>
          </div>
        \`).join('');

        const isHidden = pel.visible === "hidden";
        const kelasVal = pel.kelas || "";
        return \`
          <div class="neu-box-sm \${isHidden ? "bg-gray-100/80 opacity-75 border-dashed" : "bg-yellow-50/70"} p-4 space-y-3">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div class="flex-1 min-w-[280px] flex items-center gap-2">
                <button type="button" onclick="togglePelajaranAccordion(\${pIdx})" class="text-xs font-black px-1.5 py-0.5 rounded border border-black bg-white hover:bg-yellow-200" title="Expand/Collapse Materi">
                  <span id="arrowPelajaran_\${pIdx}">▶</span>
                </button>
                <span class="bg-[#FFE500] border-2 border-black font-black text-xs px-2 py-0.5 rounded">Rombel</span>
                <input type="text" class="flex-1 font-black text-sm p-1.5 bg-white border-2 border-black rounded-md" value="\${pel.judul || ''}" placeholder="Nama Pelajaran (misal: Seni X Semester 1)" onchange="updatePelajaranJudul(\${pIdx}, this.value)">
              </div>

              <!-- Kontrol Kelas & Visible -->
              <div class="flex items-center gap-2">
                <div class="flex items-center gap-1 bg-white border-2 border-black px-2 py-1 rounded-md text-xs font-black">
                  <span>Kelas:</span>
                  <select onchange="updatePelajaranKelas(\${pIdx}, this.value)" class="bg-transparent font-black cursor-pointer focus:outline-none">
                    <option value="" \${!kelasVal ? "selected" : ""}>-</option>
                    <option value="X" \${kelasVal === "X" ? "selected" : ""}>X</option>
                    <option value="XI" \${kelasVal === "XI" ? "selected" : ""}>XI</option>
                    <option value="XII" \${kelasVal === "XII" ? "selected" : ""}>XII</option>
                  </select>
                </div>

                <button type="button" onclick="togglePelajaranVisible(\${pIdx})" class="neu-btn text-xs px-2.5 py-1 rounded flex items-center gap-1 \${isHidden ? "bg-gray-300 text-gray-700" : "bg-[#4ADE80] text-black"}" title="Klik untuk ubah Active / Hidden">
                  <span>\${isHidden ? "👁️‍🗨️ Hidden" : "✅ Active"}</span>
                </button>

                <button onclick="konfirmasiHapusPelajaran(\${pIdx})" class="neu-btn bg-[#FF5252] text-white px-2.5 py-1 rounded text-xs">Hapus</button>
              </div>
            </div>

            <!-- List Materi dalam Pelajaran (Collapsible - Default Collapse) -->
            <div id="materiContainer_\${pIdx}" class="space-y-2 pt-2 border-t border-black/20 hidden">
              <div class="flex items-center justify-between">
                <span class="text-xs font-black uppercase text-gray-600">Modul Materi Siswa (\${(pel.materi || []).length})</span>
                <button onclick="openModalTambahMateri(\${pIdx})" class="neu-btn bg-[#4ADE80] px-2.5 py-0.5 rounded text-[11px] font-black">+ Tambah Materi</button>
              </div>
              <div class="space-y-1.5">
                \${materiHtml || '<div class="text-[11px] text-gray-400 font-semibold italic p-2">Belum ada materi. Klik + Tambah Materi.</div>'}
              </div>
            </div>
          </div>
        \`;
      }).join('');
    }

    // Toggle Expand/Collapse Section
    function toggleSection(bodyId, arrowId) {
      const el = document.getElementById(bodyId);
      const arrow = document.getElementById(arrowId);
      if (el.classList.contains('hidden')) {
        el.classList.remove('hidden');
        if (arrow) arrow.innerText = '▼';
      } else {
        el.classList.add('hidden');
        if (arrow) arrow.innerText = '▶';
      }
    }

    function togglePelajaranAccordion(pIdx) {
      const el = document.getElementById('materiContainer_' + pIdx);
      const arrow = document.getElementById('arrowPelajaran_' + pIdx);
      if (el.classList.contains('hidden')) {
        el.classList.remove('hidden');
        if (arrow) arrow.innerText = '▼';
      } else {
        el.classList.add('hidden');
        if (arrow) arrow.innerText = '▶';
      }
    }

    // Modal Pelajaran Handlers
    function openModalTambahPelajaran() {
      document.getElementById('inputNamaPelajaran').value = '';
      document.getElementById('inputKelasPelajaran').value = 'X';
      document.getElementById('inputVisiblePelajaran').value = 'active';
      openModal('modalTambahPelajaran');
    }
    function submitTambahPelajaran() {
      const nama = document.getElementById('inputNamaPelajaran').value.trim();
      const kelas = document.getElementById('inputKelasPelajaran').value;
      const visible = document.getElementById('inputVisiblePelajaran').value;
      if (!nama) return showToast('Nama pelajaran wajib diisi', '⚠️');
      if (!currentSettings.pelajaran) currentSettings.pelajaran = [];
      currentSettings.pelajaran.push({
        judul: nama,
        kelas: kelas,
        visible: visible,
        materi: []
      });
      closeModal('modalTambahPelajaran');
      renderPelajaranList();
      showToast('Pelajaran berhasil ditambahkan!');
    }
    function updatePelajaranJudul(pIdx, val) {
      currentSettings.pelajaran[pIdx].judul = val;
    }
    function updatePelajaranKelas(pIdx, val) {
      currentSettings.pelajaran[pIdx].kelas = val;
    }
    function togglePelajaranVisible(pIdx) {
      const cur = currentSettings.pelajaran[pIdx].visible;
      const next = cur === 'hidden' ? 'active' : 'hidden';
      currentSettings.pelajaran[pIdx].visible = next;
      renderPelajaranList();
      showToast(\"Status diubah menjadi \" + (next === 'hidden' ? 'Hidden (Sembunyi)' : 'Active (Tampil)'));
    }
    function konfirmasiHapusPelajaran(pIdx) {
      showConfirmModal({
        title: 'Hapus Rombel Pelajaran',
        message: \`Yakin ingin menghapus rombel '\${currentSettings.pelajaran[pIdx].judul}' beserta seluruh materinya?\`,
        onConfirm: () => {
          currentSettings.pelajaran.splice(pIdx, 1);
          renderPelajaranList();
          showToast('Rombel pelajaran dihapus');
        }
      });
    }

    // Modal Materi Handlers
    function openModalTambahMateri(pIdx) {
      document.getElementById('targetPelajaranIndex').value = pIdx;
      document.getElementById('inputJudulMateri').value = '';
      document.getElementById('inputNamaFileMd').value = '';
      openModal('modalTambahMateri');
    }
    function autoGenerateFileName(judul) {
      const slug = judul.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');
      document.getElementById('inputNamaFileMd').value = slug ? slug + '.md' : '';
    }
    function submitTambahMateri() {
      const pIdx = parseInt(document.getElementById('targetPelajaranIndex').value, 10);
      const judul = document.getElementById('inputJudulMateri').value.trim();
      let file = document.getElementById('inputNamaFileMd').value.trim();
      if (!judul) return showToast('Judul materi wajib diisi', '⚠️');
      if (!file) {
        file = judul.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_') + '.md';
      }
      if (!file.endsWith('.md')) file += '.md';

      if (!currentSettings.pelajaran[pIdx].materi) currentSettings.pelajaran[pIdx].materi = [];
      currentSettings.pelajaran[pIdx].materi.push({
        judulMateri: judul,
        file: file
      });
      closeModal('modalTambahMateri');
      renderPelajaranList();
      showToast('Modul materi ditambahkan!');
    }
    function updateMateriJudul(pIdx, mIdx, val) {
      currentSettings.pelajaran[pIdx].materi[mIdx].judulMateri = val;
    }
    function updateMateriFile(pIdx, mIdx, val) {
      let f = val.trim();
      if (f && !f.endsWith('.md')) f += '.md';
      currentSettings.pelajaran[pIdx].materi[mIdx].file = f;
    }
    function hapusMateri(pIdx, mIdx) {
      currentSettings.pelajaran[pIdx].materi.splice(mIdx, 1);
      renderPelajaranList();
      showToast('Materi dihapus dari daftar');
    }

        async function triggerDeploy() {
      const btn = document.getElementById("btnGlobalDeploy");
      const origText = btn ? btn.innerText : "";
      if (btn) {
        btn.disabled = true;
        btn.innerText = "⏳ Sedang Deploy...";
        btn.classList.add("opacity-60", "cursor-not-allowed");
      }
      showToast("Memulai proses build & deploy...", "🚀");

      try {
        const res = await fetch("/api/deploy", { method: "POST" });
        const data = await res.json();
        if (data.success) {
          showToast("Deploy berhasil ke Cloudflare Pages!", "🎉");
        } else {
          showToast("Deploy gagal: " + (data.error || "Cek terminal"), "❌");
        }
      } catch (e) {
        showToast("Gagal memanggil proses deploy", "❌");
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.innerText = origText;
          btn.classList.remove("opacity-60", "cursor-not-allowed");
        }
      }
    }

    async function saveAndDeploy() {
      await saveGuiSettings();
      await triggerDeploy();
    }

    async function saveGuiSettings() {
      if (!activeGuruId || !currentSettings) return;

      currentSettings.namaGuru = document.getElementById('guiNamaGuru').value.trim();
      currentSettings.judulSitus = document.getElementById('guiJudulSitus').value.trim();
      currentSettings.fotoProfil = document.getElementById('guiFotoProfil').value.trim() || 'profile.jpg';
      currentSettings.deskripsi = document.getElementById('guiDeskripsi').value.trim();
      currentSettings.pemberitahuan = document.getElementById('guiPemberitahuan').value.trim();

      try {
        const res = await fetch(\`/api/guru/\${activeGuruId}/settings\`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentSettings)
        });
        const data = await res.json();
        showToast(data.message || 'Perubahan tersimpan!');
        document.getElementById('rawJsonEditor').value = JSON.stringify(currentSettings, null, 2);
        loadGurus();
        loadMdList(activeGuruId);
      } catch (e) {
        showToast('Gagal menyimpan pengaturan', '❌');
      }
    }

    async function saveRawJson() {
      if (!activeGuruId) return;
      try {
        const content = JSON.parse(document.getElementById('rawJsonEditor').value);
        const res = await fetch(\`/api/guru/\${activeGuruId}/settings\`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(content)
        });
        const data = await res.json();
        showToast(data.message || 'Settings tersimpan!');
        currentSettings = content;
        renderGuiForm(currentSettings);
        loadGurus();
      } catch (e) {
        showToast('Format JSON tidak valid!', '❌');
      }
    }

    async function loadMdList(id) {
      const res = await fetch(\`/api/guru/\${id}/md\`);
      const data = await res.json();
      const container = document.getElementById('mdList');
      if (!data.success || !data.files.length) {
        container.innerHTML = '<span class="text-xs text-gray-500 font-semibold">Belum ada file .md</span>';
        document.getElementById('mdEditorWrapper').classList.add('hidden');
        return;
      }
      container.innerHTML = data.files.map(f => \`
        <button onclick="openMd('\${f}')" class="neu-btn text-xs px-3 py-1.5 rounded \${activeMdFile === f ? 'bg-[#FFE500]' : 'bg-gray-100'}">
          📄 \${f}
        </button>
      \`).join('');
    }

    async function openMd(file) {
      activeMdFile = file;
      document.getElementById('activeMdFileName').innerText = 'Edit: ' + file;
      const res = await fetch(\`/api/guru/\${activeGuruId}/md/\${file}\`);
      const data = await res.json();
      if (data.success) {
        document.getElementById('mdContentEditor').value = data.content;
        document.getElementById('mdEditorWrapper').classList.remove('hidden');
        loadMdList(activeGuruId);
      }
    }

    async function saveActiveMd() {
      if (!activeGuruId || !activeMdFile) return;
      const content = document.getElementById('mdContentEditor').value;
      const res = await fetch(\`/api/guru/\${activeGuruId}/md/\${activeMdFile}\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      const data = await res.json();
      showToast(data.message || 'Materi berhasil disimpan!');
    }

    function konfirmasiHapusActiveMd() {
      showConfirmModal({
        title: 'Hapus Berkas Markdown',
        message: \`Yakin ingin menghapus file '\${activeMdFile}' secara permanen?\`,
        onConfirm: async () => {
          await fetch(\`/api/guru/\${activeGuruId}/md/\${activeMdFile}\`, { method: 'DELETE' });
          activeMdFile = null;
          document.getElementById('mdEditorWrapper').classList.add('hidden');
          loadMdList(activeGuruId);
          loadGurus();
          showToast('Berkas markdown dihapus');
        }
      });
    }

    function openModalNewMd() {
      document.getElementById('inputNewMdName').value = '';
      openModal('modalNewMd');
    }
    async function submitNewMd() {
      const name = document.getElementById('inputNewMdName').value.trim();
      if (!name) return showToast('Nama file wajib diisi', '⚠️');
      let clean = name.endsWith('.md') ? name : name + '.md';
      const initialContent = \`# \${clean.replace('.md', '')}\\n\\nIsi materi pembelajaran di sini.\\n\`;
      await fetch(\`/api/guru/\${activeGuruId}/md/\${clean}\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: initialContent })
      });
      closeModal('modalNewMd');
      loadMdList(activeGuruId);
      openMd(clean);
      loadGurus();
      showToast('File markdown baru dibuat!');
    }

    function switchTab(tab) {
      document.getElementById('panelGui').classList.add('hidden');
      document.getElementById('panelMd').classList.add('hidden');
      document.getElementById('panelJson').classList.add('hidden');

      document.getElementById('tabSettingsBtn').className = 'neu-btn bg-white px-4 py-2 rounded-lg text-xs';
      document.getElementById('tabMdBtn').className = 'neu-btn bg-white px-4 py-2 rounded-lg text-xs';
      document.getElementById('tabJsonBtn').className = 'neu-btn bg-white px-4 py-2 rounded-lg text-xs';

      if (tab === 'gui') {
        document.getElementById('panelGui').classList.remove('hidden');
        document.getElementById('tabSettingsBtn').className = 'neu-btn bg-[#FFE500] px-4 py-2 rounded-lg text-xs';
      } else if (tab === 'md') {
        document.getElementById('panelMd').classList.remove('hidden');
        document.getElementById('tabMdBtn').className = 'neu-btn bg-[#FFE500] px-4 py-2 rounded-lg text-xs';
      } else {
        document.getElementById('panelJson').classList.remove('hidden');
        document.getElementById('tabJsonBtn').className = 'neu-btn bg-[#FFE500] px-4 py-2 rounded-lg text-xs';
      }
    }

    function openTambahGuruModal() {
      document.getElementById('inputSubdomain').value = '';
      document.getElementById('inputNamaGuru').value = '';
      openModal('modalTambahGuru');
    }
    async function submitTambahGuru() {
      const subdomain = document.getElementById('inputSubdomain').value.trim();
      const namaGuru = document.getElementById('inputNamaGuru').value.trim();
      if (!subdomain) return showToast('Subdomain wajib diisi!', '⚠️');
      const res = await fetch('/api/guru', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subdomain, namaGuru })
      });
      const data = await res.json();
      if (data.success) {
        closeModal('modalTambahGuru');
        loadGurus();
        selectGuru(data.id);
        showToast('Guru baru berhasil dibuat!');
      } else {
        showToast(data.error, '❌');
      }
    }

    function konfirmasiHapusGuru(id) {
      showConfirmModal({
        title: 'Hapus Guru / Subdomain',
        message: \`Yakin ingin menghapus seluruh folder guru '\${id}' beserta semua file materi dan pengaturannya?\`,
        onConfirm: async () => {
          await fetch(\`/api/guru/\${id}\`, { method: 'DELETE' });
          if (activeGuruId === id) {
            activeGuruId = null;
            document.getElementById('emptyState').classList.remove('hidden');
            document.getElementById('detailPanel').classList.add('hidden');
          }
          loadGurus();
          showToast(\`Guru \${id} berhasil dihapus\`);
        }
      });
    }

    loadGurus();
  </script>
</body>
</html>`;
}

server.listen(PORT, () => {
  console.log(`[OK] Backend & Dashboard Admin berjalan di http://localhost:${PORT}`);
  exec(`start http://localhost:${PORT}`, () => {});
});
