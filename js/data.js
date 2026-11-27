const KUNCI_STORAGE = "STORY_CO_DATA";
const STATUS = {
  WAITING: "waiting",
  ATTENTION: "attention",
  PUBLISHED: "published",
  DELETED: "deleted",
};

let daftarCerita = [];

function muatData() {
  try {
    const tersimpan = JSON.parse(localStorage.getItem(KUNCI_STORAGE));
    daftarCerita = Array.isArray(tersimpan) ? tersimpan : [];
  } catch {
    daftarCerita = [];
  }
}

function simpanData() {
  try {
    localStorage.setItem(KUNCI_STORAGE, JSON.stringify(daftarCerita));
    return true;
  } catch {
    return false;                       // penuh atau diblokir
  }
}

// kode unik: nama minuman dan 4 kode angka
function buatKode(drink) {
  const nama = String(drink).toUpperCase().replace(/[^A-Z0-9]/g, "");
  let kode;
  do {
    const angka = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
    kode = `${nama}-${angka}`;
  } while (daftarCerita.some((c) => c.code === kode));
  return kode;
}

// dipanggil saat Order ditekan
function tambahCerita({ type, story, mood = null, drink }) {
  muatData();                           // ambil versi terbaru, bisa saja diubah tab lain

  const sekarang = new Date();
  const cerita = {
    id: `${sekarang.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
    type,                               // "text" | "drawing"
    story,                              // teks, atau dataURL kalau gambar
    date: sekarang.toLocaleDateString("en-CA"),
    day: sekarang.toLocaleDateString("en-US", { weekday: "long" }),
    time: sekarang.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",                 
    }),
    mood: mood ? mood.charAt(0).toUpperCase() + mood.slice(1) : null,
    drink,                              // untuk struk: "01 x Latte"
    code: buatKode(drink),
    status: STATUS.WAITING,
    publishedAt: null,
    likes: 0,
    createdAt: sekarang.getTime(),
  };

  daftarCerita.unshift(cerita);

  if (!simpanData()) {
    daftarCerita.shift();               // batalkan, jangan sisakan data setengah jadi
    return { ok: false, error: "Storage is full. Try a shorter story or a smaller drawing." };
  }
  return { ok: true, story: cerita };
}

function ubahStatus(id, status) {
  muatData();
  const cerita = daftarCerita.find((c) => c.id === id);
  if (!cerita) return false;

  cerita.status = status;
  cerita.publishedAt = status === STATUS.PUBLISHED ? Date.now() : null;
  return simpanData();
}

function ubahLike(id, delta) {
  muatData();
  const cerita = daftarCerita.find((c) => c.id === id);
  if (!cerita) return null;

  cerita.likes = Math.max(0, (cerita.likes || 0) + delta);
  return simpanData() ? cerita.likes : null;
}

muatData();