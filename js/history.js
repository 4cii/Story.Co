const codeBox      = document.getElementById("code-box");
const codeForm     = document.getElementById("code-form");
const codeInput    = document.getElementById("code-input");
const codeError    = document.getElementById("code-error");
const resultBox    = document.getElementById("history-result");
const statusBanner = document.getElementById("status-banner");
const searchAgain  = document.getElementById("search-again");
const goBoardLink  = document.getElementById("go-board");

const STATUS_INFO = {
  waiting:   { text: "⏳ Your story is waiting for admin review.", class: "is-waiting" },
  attention: { text: "🔍 Your story is currently under closer review.", class: "is-attention" },
  published: { text: "✨ Your story is live on the Story Board!", class: "is-published" },
  deleted:   { text: "🗑️ This story was removed from the board.", class: "is-deleted" },
};

function tampilkanStrukHistory(c) {
  const d = new Date(c.createdAt);
  const info = STATUS_INFO[c.status] || STATUS_INFO.waiting;

  // Banner status
  statusBanner.textContent = info.text;
  statusBanner.className = `status-banner ${info.class}`;

  // Isi cerita (teks atau gambar)
  const resStory = document.getElementById("res-story");
  const resImage = document.getElementById("res-image");

  if (c.type === "drawing" && String(c.story || "").startsWith("data:image/")) {
    resStory.hidden = true;
    resImage.src = c.story;
    resImage.hidden = false;
  } else {
    resImage.hidden = true;
    resStory.hidden = false;
    resStory.textContent = `“${c.story || ""}”`;
  }

  // Detail struk
  document.getElementById("res-code").textContent  = c.code;
  document.getElementById("res-date").textContent  = d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  document.getElementById("res-day").textContent   = d.toLocaleDateString("en-US", { weekday: "long" });
  document.getElementById("res-time").textContent  = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  document.getElementById("res-mood").textContent  = c.mood || "-";
  document.getElementById("res-order").textContent = `01 x ${c.drink || "Coffee"}`;
  document.getElementById("res-likes").textContent = c.likes || 0;

  // Tombol menuju board hanya muncul jika sudah di-publish
  if (goBoardLink) {
    goBoardLink.hidden = c.status !== STATUS.PUBLISHED;
  }

  codeBox.hidden = true;
  resultBox.hidden = false;
}

if (codeForm) {
  codeInput.addEventListener("input", () => {
    codeError.textContent = "";
  });

  codeForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const query = codeInput.value.trim().toUpperCase();

    if (!query) {
      codeError.textContent = "Please enter your receipt code first.";
      codeInput.focus();
      return;
    }

    // Pastikan mengambil data terbaru dari localStorage
    muatData();
    const ditemukan = daftarCerita.find(
      (c) => String(c.code || "").toUpperCase() === query
    );

    if (!ditemukan) {
      codeError.textContent = "Code not found. Check your receipt code and try again.";
      codeInput.focus();
      return;
    }

    tampilkanStrukHistory(ditemukan);
  });
}

if (searchAgain) {
  searchAgain.addEventListener("click", () => {
    resultBox.hidden = true;
    codeBox.hidden = false;
    codeForm.reset();
    codeError.textContent = "";
    codeInput.focus();
  });
}