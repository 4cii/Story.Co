const KUNCI_LIKED = "STORY_CO_LIKED";
const KUNCI_LAST = "STORY_CO_LAST_SHOWN";

const MAKS_KARAKTER = 50;
const GESER = 1.2;
const MIRING = 7;

const listEl = document.getElementById("struk-list");
const tpl = document.getElementById("struk-template");
const emptyEl = document.getElementById("empty-board");

if (listEl && tpl) {
  /* ---------- ukuran grid responsif ---------- */
  function getUkuranGrid() {
    const w = window.innerWidth;
    if (w <= 600) return { kolom: 2, baris: 1 };   // HP: 2 kartu
    if (w <= 1024) return { kolom: 2, baris: 2 };  // Tablet: 4 kartu
    return { kolom: 3, baris: 2 };                 // Desktop: 6 kartu
  }

  /* ---------- utilitas ---------- */
  const bacaJSON = (key) => {
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
      return [];
    }
  };

  const tulisJSON = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* tidak fatal */
    }
  };

  const rand = (max) => ((Math.random() * 2 - 1) * max).toFixed(1);

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function potong(teks, maks = MAKS_KARAKTER) {
    const huruf = [...String(teks).trim().replace(/\s+/g, " ")];
    return huruf.length > maks ? huruf.slice(0, maks).join("").trimEnd() + "…" : huruf.join("");
  }

  /* ---------- memilih cerita ---------- */
  function pilihCerita(published, n) {
    const last = bacaJSON(KUNCI_LAST);
    const baru = shuffle(published.filter((c) => !last.includes(c.id)));
    const lama = shuffle(published.filter((c) => last.includes(c.id)));
    const hasil = [...baru, ...lama].slice(0, n);

    tulisJSON(KUNCI_LAST, hasil.map((c) => c.id));
    return hasil;
  }

  /* ---------- membuat satu struk ---------- */
  function tampilLike(btn, aktif, jumlah) {
    btn.setAttribute("aria-pressed", String(aktif));
    btn.querySelector(".heartIcon").className = `heartIcon ${aktif ? "ri-heart-fill" : "ri-heart-line"}`;
    btn.querySelector(".likeCount").textContent = jumlah;
  }

  function buatStruk(c, liked) {
    const el = tpl.content.firstElementChild.cloneNode(true);
    const f = (nama) => el.querySelector(`[data-f="${nama}"]`);
    const d = new Date(c.createdAt);

    el.dataset.id = c.id;

    if (c.type === "drawing" && String(c.story || "").startsWith("data:image/")) {
      f("story").remove();
      f("image").src = c.story;
      f("image").hidden = false;
    } else {
      f("story").textContent = `“${potong(c.story || "")}”`;
    }

    f("date").textContent = d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    f("day").textContent = d.toLocaleDateString("en-US", { weekday: "long" });
    f("time").textContent = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
    f("mood").textContent = c.mood || "-";
    f("order").textContent = `01 x ${c.drink || "Coffee"}`;

    tampilLike(el.querySelector(".likeBtn"), liked.includes(c.id), c.likes || 0);
    return el;
  }

  /* ---------- posisi acak ---------- */
  function letakkanAcak(cards, kolom, baris) {
    const sel = [];
    for (let r = 1; r <= baris; r++) {
      for (let c = 1; c <= kolom; c++) sel.push({ c, r });
    }

    shuffle(sel)
      .slice(0, cards.length)
      .forEach((s, i) => {
        const card = cards[i];
        card.style.gridColumn = s.c;
        card.style.gridRow = s.r;
        card.style.setProperty("--dx", `${rand(GESER)}cqw`);
        card.style.setProperty("--dy", `${rand(GESER)}cqw`);
        card.style.setProperty("--rot", `${rand(MIRING)}deg`);
      });
  }

  /* ---------- tampilkan ---------- */
  let modeAktif = "";

  function render() {
    const { kolom, baris } = getUkuranGrid();
    const maksStruk = kolom * baris;
    modeAktif = `${kolom}x${baris}`;

    const liked = bacaJSON(KUNCI_LIKED);
    const published = daftarCerita.filter((c) => c.status === STATUS.PUBLISHED);

    listEl.replaceChildren();
    if (emptyEl) emptyEl.hidden = published.length > 0;
    if (!published.length) return;

    const cards = pilihCerita(published, maksStruk).map((c) => buatStruk(c, liked));
    letakkanAcak(cards, kolom, baris);
    listEl.append(...cards);
  }

  /* ---------- like ---------- */
  listEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".likeBtn");
    if (!btn) return;

    const id = btn.closest(".struk").dataset.id;
    const liked = bacaJSON(KUNCI_LIKED);
    const sudah = liked.includes(id);

    const jumlah = ubahLike(id, sudah ? -1 : 1);
    if (jumlah === null) return;

    tulisJSON(KUNCI_LIKED, sudah ? liked.filter((x) => x !== id) : [...liked, id]);
    tampilLike(btn, !sudah, jumlah);
  });

  /* Re-render otomatis jika layar diubah dari desktop <-> tablet <-> HP */
  window.addEventListener("resize", () => {
    const { kolom, baris } = getUkuranGrid();
    if (`${kolom}x${baris}` !== modeAktif) {
      render();
    }
  });

  muatData();
  render();
}