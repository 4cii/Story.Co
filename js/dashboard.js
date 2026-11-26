<<<<<<< HEAD
const ADMIN_NAME = "Kharim";
const OPEN_CLASS = "open";  // class yang membuka .action-menu; samakan dengan CSS-mu

const VIEWS = {
  "#overview":          { statuses: [STATUS.WAITING, STATUS.ATTENTION], subtitle: "Today's view" },
  "#urgent-cases":      { statuses: [STATUS.ATTENTION],                 subtitle: "Stories that need a closer look" },
  "#published-stories": { statuses: [STATUS.PUBLISHED],                 subtitle: "Stories on the board" },
  "#delete-stories":    { statuses: [STATUS.DELETED],                   subtitle: "Deleted stories" },
};
=======
       // Tiap halaman: judul, subjudul, dan status cerita yang ditampilkan
        const pages = {
            'overview':          { title: 'Greetings, Kharim.', subtitle: "Today's view",                  show: ['waiting', 'attention'] },
            'delete-stories':    { title: 'Delete Stories',     subtitle: 'Stories removed from the board', show: ['deleted'] },
            'published-stories': { title: 'Published Stories',  subtitle: 'Stories live on the board',      show: ['published'] },
            'urgent-cases':      { title: 'Urgent Cases',       subtitle: 'Stories that need attention',    show: ['attention'] }
        };
>>>>>>> 6191b18ab89a5fd19fae72fd595be390675e69de

const LABEL = {
  waiting: "Waiting",
  attention: "Needs attention",
  published: "Published",
  deleted: "Deleted",
};

const list = document.getElementById("story-list");
const tpl = document.getElementById("story-template");

if (list && tpl) {
  const moodSelect = document.querySelector(".category");
  const searchInput = document.querySelector(".search input");

  const currentView = () => VIEWS[location.hash] || VIEWS["#overview"];
  const hitung = (status) => daftarCerita.filter((c) => c.status === status).length;
  const isToday = (ts) => !!ts && new Date(ts).toDateString() === new Date().toDateString();

  function timeAgo(ts) {
    const m = Math.floor((Date.now() - ts) / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m} min ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} hour${h > 1 ? "s" : ""} ago`;
    const d = Math.floor(h / 24);
    return `${d} day${d > 1 ? "s" : ""} ago`;
  }

  function updateStats() {
    const isi = (id, n) => {
      const el = document.getElementById(id);
      if (el) el.textContent = n;
    };
    isi("count-waiting", hitung(STATUS.WAITING));
    isi("count-attention", hitung(STATUS.ATTENTION));
    isi(
      "count-published",
      daftarCerita.filter((c) => c.status === STATUS.PUBLISHED && isToday(c.publishedAt)).length,
    );
  }

  // satu cerita jadi satu kartu; semua teks pengguna lewat textContent
  function buatKartu(c) {
    const el = tpl.content.firstElementChild.cloneNode(true);
    const f = (nama) => el.querySelector(`[data-f="${nama}"]`);
    const mood = (c.mood || "").toLowerCase();

    el.dataset.id = c.id;
    el.dataset.status = c.status;
    el.dataset.mood = mood;
    el.classList.toggle("story-attention", c.status === STATUS.ATTENTION);

    f("status").textContent = LABEL[c.status] || c.status;
    f("status").classList.add(`badge-${c.status}`);

    if (mood) {
      f("mood").textContent = c.mood;
      f("mood").classList.add(`badge-mood-${mood}`);
    } else {
      f("mood").remove();               // gambar tidak punya mood
    }

    if (c.status === STATUS.ATTENTION) {
      const note = f("note");
      note.textContent =
        "This story was flagged for a closer look. Consider publishing it with a supportive note, or holding it for now.";
      note.hidden = false;
    }

    if (c.type === "drawing" && String(c.story || "").startsWith("data:image/")) {
      f("text").remove();
      f("image").src = c.story;
      f("image").hidden = false;
    } else {
      f("text").textContent = c.story || "";
    }

    f("code").textContent = c.code;
    f("ago").textContent = timeAgo(c.createdAt);

    el.querySelectorAll(".option").forEach((o) => {
      const restore = o.classList.contains("option-restore");
      const bisaRestore = c.status === STATUS.DELETED || c.status === STATUS.PUBLISHED;
      o.hidden = o.dataset.status === c.status || (restore && !bisaRestore);
    });

    return el;
  }

  function render() {
    const view = currentView();
    const mood = (moodSelect?.value || "all").toLowerCase();
    const q = (searchInput?.value || "").trim().toLowerCase();

    const tampil = daftarCerita
      .filter((c) => view.statuses.includes(c.status))
      .filter((c) => mood === "all" || (c.mood || "").toLowerCase() === mood)
      .filter((c) => {
        if (!q) return true;
        const teks = c.type === "text" ? String(c.story || "").toLowerCase() : "";   // gambar tidak ikut dicari
        return teks.includes(q) || String(c.code).toLowerCase().includes(q);
      })
      .sort((a, b) => b.createdAt - a.createdAt);                                    // terbaru di atas

    list.replaceChildren(...tampil.map(buatKartu));

    if (!tampil.length) {
      const kosong = document.createElement("p");
      kosong.className = "empty";
      kosong.textContent = "No stories here yet.";
      list.append(kosong);
    }

    document.getElementById("title").textContent = `Greetings, ${ADMIN_NAME}.`;
    document.getElementById("subtitle").textContent = view.subtitle;
    document.querySelectorAll(".menu a").forEach((a) => {
      const aktif = (a.getAttribute("href") || "#overview") === (location.hash || "#overview");
      a.classList.toggle("active", aktif);
      if (aktif) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
    updateStats();
  }

  function tutupSemuaMenu() {
    list.querySelectorAll(`.story.${OPEN_CLASS}`).forEach((s) => {
      s.classList.remove(OPEN_CLASS);
      s.querySelector(".action-btn")?.setAttribute("aria-expanded", "false");
    });
  }

  list.addEventListener("click", (e) => {
    const card = e.target.closest(".story");
    if (!card) return;

    const opt = e.target.closest(".option");
    if (opt) {
      const status = opt.dataset.status;
      if (status === STATUS.DELETED && !confirm("Move this story to Delete Stories?")) return;
      if (ubahStatus(card.dataset.id, status)) render();
      return;
    }

    const btn = e.target.closest(".action-btn");
    if (btn) {
      const buka = !card.classList.contains(OPEN_CLASS);
      tutupSemuaMenu();
      if (buka) {
        card.classList.add(OPEN_CLASS);
        btn.setAttribute("aria-expanded", "true");
      }
    }
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".story")) tutupSemuaMenu();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") tutupSemuaMenu();
  });

  moodSelect?.addEventListener("change", render);
  searchInput?.addEventListener("input", render);
  window.addEventListener("hashchange", render);

  // cerita baru dari tab Write langsung muncul
  window.addEventListener("storage", (e) => {
    if (e.key === KUNCI_STORAGE) {
      muatData();
      render();
    }
  });

  muatData();
  render();
}