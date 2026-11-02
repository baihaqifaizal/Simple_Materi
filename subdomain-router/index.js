/**
 * Cloudflare Worker: subdomain-materi-router
 *
 * Route otomatis: *.manurhidma.my.id → simple-materi.pages.dev/<nama-folder-guru>/...
 *
 * Cara kerja:
 *   - boy.manurhidma.my.id/materi/xyz → simple-materi.pages.dev/boy/materi/xyz
 *   - siti.manurhidma.my.id/           → simple-materi.pages.dev/siti/
 *   - budi.manurhidma.my.id/pelajaran/ → simple-materi.pages.dev/budi/pelajaran/
 *
 * Tambah guru baru = tambah folder guru/ di repo → deploy sekali → langsung aktif.
 */

const PAGES_HOST = "simple-materi.pages.dev";

// Subdomain yang dikecualikan (bukan materi guru)
const EXCLUDED = new Set(["www", "app", "api", "materi"]);

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const host = url.hostname.toLowerCase();

    // Ekstrak subdomain dari *.manurhidma.my.id
    let subdomain = "";
    if (host.endsWith(".manurhidma.my.id")) {
      subdomain = host.slice(0, -(`.manurhidma.my.id`.length));
    }

    // Jika subdomain kosong, bukan guru, atau dikecualikan → pass through / 404
    if (!subdomain || EXCLUDED.has(subdomain)) {
      return new Response("Not found", { status: 404 });
    }

    // Bangun URL target: https://simple-materi.pages.dev/<subdomain><path>
    const targetPath = `/${subdomain}${url.pathname}${url.search}`;
    const targetUrl = `https://${PAGES_HOST}${targetPath}`;

    // Forward request ke Pages, ganti Host header agar Pages menerimanya
    const newRequest = new Request(targetUrl, {
      method: request.method,
      headers: (() => {
        const h = new Headers(request.headers);
        h.set("Host", PAGES_HOST);
        return h;
      })(),
      body: ["GET", "HEAD"].includes(request.method) ? null : request.body,
      redirect: "follow",
    });

    const response = await fetch(newRequest);

    // Kembalikan response, pastikan header CORS & cache ikut
    const newHeaders = new Headers(response.headers);
    newHeaders.set("X-Served-By", "subdomain-materi-router");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  },
};

