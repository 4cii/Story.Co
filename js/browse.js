const KUNCI_LIKED = "STORY_CO_LIKED";     // cerita yang sudah di-like oleh perangkat ini
const MAX_STRUK = 4;                      // jumlah struk di board; sesuaikan dengan CSS .struk-1 sampai .struk-4

const listEl = document.getElementById("struk-list");
const tpl = document.getElementById("struk-template");
const emptyEl = document.getElementById("empty-board");

if (listEl && tpl) {
  const bacaLiked = () => {
    try {
      return JSON.parse(localStorage.getItem(KUNCI_LIKED)) || [];
    } catch {
      return [];
    }
  };

  const simpanLiked = (arr) => {
    try {
      localStorage.setItem(KUNCI_LIKED, JSON.stringify(arr));
    } catch {
      /* tidak fatal */
    }
  };

  function tampilLike(btn, aktif, jumlah) {
    btn.setAttribute("aria-pressed", String(aktif));
    btn.querySelector(".heartIcon").className = `heartIcon ${aktif ? "ri-heart-fill" : "ri-heart-line"}`;
    btn.querySelector(".likeCount").textContent = jumlah;
  }

  function buatStruk(c, i, liked) {
    const el = tpl.content.firstElementChild.cloneNode(true);
    const f = (nama) => el.querySelector(`[data-f="${nama}"]`);
    const d = new Date(c.createdAt);

    el.classList.add(`struk-${(i % 4) + 1}`);
    el.dataset.id = c.id;

    if (c.type === "drawing" && String(c.story || "").startsWith("data:image/")) {
      f("story").remove();
      f("image").src = c.story;
      f("image").hidden = false;
    } else {
      f("story").textContent = `“${c.story || ""}”`;
    }

    f("date").textContent = d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    f("day").textContent = d.toLocaleDateString("en-US", { weekday: "long" });
    f("time").textContent = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
    f("mood").textContent = c.mood || "-";
    f("order").textContent = `01 x ${c.drink || "Coffee"}`;

    tampilLike(el.querySelector(".likeBtn"), liked.includes(c.id), c.likes || 0);
    return el;
  }

  function render() {
    const liked = bacaLiked();
    const tampil = daftarCerita
      .filter((c) => c.status === STATUS.PUBLISHED)
      .sort((a, b) => (b.publishedAt || b.createdAt) - (a.publishedAt || a.createdAt))
      .slice(0, MAX_STRUK);

    listEl.replaceChildren(...tampil.map((c, i) => buatStruk(c, i, liked)));
    if (emptyEl) emptyEl.hidden = tampil.length > 0;
  }

  listEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".likeBtn");
    if (!btn) return;

    const id = btn.closest(".struk").dataset.id;
    const liked = bacaLiked();
    const sudah = liked.includes(id);

    const jumlah = ubahLike(id, sudah ? -1 : 1);
    if (jumlah === null) return;

    simpanLiked(sudah ? liked.filter((x) => x !== id) : [...liked, id]);
    tampilLike(btn, !sudah, jumlah);
  });

  window.addEventListener("storage", (e) => {
    if (e.key === KUNCI_STORAGE) {
      muatData();
      render();
    }
  });

  muatData();
  render();
}