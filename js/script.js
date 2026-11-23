const KUNCI_STORAGE = "STORY_CO_DATA";

// ==========================================
// 1. BTN SCRIBBLE
// ==========================================
const scribbles = [
  "../assets/oret-ijo2.png",
  "../assets/oret-kuning2.png",
  "../assets/oret-oren.png",
  "../assets/oret-merah.png"
].map(src => new URL(src, document.currentScript.src).href);

scribbles.forEach((src) => {
  const img = new Image();
  img.src = src;
});

document.querySelectorAll(".btn").forEach((btn) => {
  let last = -1;

  const pickScribble = () => {
    let i;
    do {
      i = Math.floor(Math.random() * scribbles.length);
    } while (i === last && scribbles.length > 1);   
    last = i;

    btn.style.setProperty("--scribble", `url("${scribbles[i]}")`);
    btn.style.setProperty("--tilt", `${(Math.random() * 4 - 2).toFixed(1)}deg`);
    btn.style.setProperty("--flip", Math.random() < 0.5 ? 1 : -1);
  };

  btn.addEventListener("pointerenter", pickScribble);
  btn.addEventListener("focus", pickScribble);
});


// ==========================================
// 2. BUKU MENU MEMBUKA KARTU
// ==========================================
const bookBtn = document.getElementById("book-btn");
const writingForm = document.querySelector(".writing-form");

if (bookBtn && writingForm) {
  bookBtn.addEventListener("click", () => {
    bookBtn.classList.add("fade-out");
    writingForm.classList.add("is-open");
    setTimeout(() => {
      document.getElementById("write-story")?.focus({ preventScroll: true });
    }, 700);
  });
}


// ==========================================
// 3. STEP 1 (TULIS/GAMBAR) -> STEP 2 (CHOOSE MENU) -> SAVE LOCALSTORAGE
// ==========================================
const storyForm = document.getElementById("story-form");
const menuForm = document.getElementById("menu-form");

if (storyForm && menuForm) {
  const story = document.getElementById("write-story");
  const hint = document.getElementById("form-hint");
  const label = document.getElementById("story-label");
  const modeBtns = document.querySelectorAll(".mode-btn");
  const drawArea = document.getElementById("draw-area");
  const canvas = document.getElementById("draw-canvas");
  const ctx = canvas.getContext("2d");
  const undoBtn = document.getElementById("undo");
  const redoBtn = document.getElementById("redo");
  const swatches = document.querySelectorAll(".swatch");

  // Elemen perpindahan step
  const writeStep = document.getElementById("write-step");
  const sendBtn = document.getElementById("send-btn");
  const menuStep = document.getElementById("menu-step");
  const orderBtn = document.getElementById("order-btn");
  const menuHint = document.getElementById("menu-hint");

  // Variabel penampung sementara sebelum pilih minuman
  let draftPayload = null;

  let mode = "write";
  let color = document.querySelector('.swatch[aria-pressed="true"]').dataset.color;
  const brushSize = 5;
  const strokes = [];
  let redoStack = [];
  let current = null;

  /* ---------- pesan error ---------- */
  const showError = (msg) => {
    hint.textContent = msg;
    hint.classList.add("is-error");
  };

  const clearError = () => {
    hint.textContent = "";
    hint.classList.remove("is-error");
    story.removeAttribute("aria-invalid");
  };

  storyForm.addEventListener("input", clearError);

  /* ---------- ganti mode: tulis / gambar ---------- */
  function setMode(next) {
    mode = next;
    storyForm.classList.toggle("is-drawing", next === "draw");
    modeBtns.forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.mode === next)),
    );
    story.hidden = next !== "write";
    drawArea.hidden = next !== "draw";
    label.textContent = next === "write" ? "My story..." : "Draw everything...";

    if (next === "write") {
      label.setAttribute("for", "write-story");
      story.focus();
    } else {
      label.removeAttribute("for");
    }
    clearError();
  }

  modeBtns.forEach((b) =>
    b.addEventListener("click", () => setMode(b.dataset.mode)),
  );

  /* ---------- color picker ---------- */
  swatches.forEach((s) => {
    s.style.background = s.dataset.color;
    s.addEventListener("click", () => {
      color = s.dataset.color;
      swatches.forEach((x) => x.setAttribute("aria-pressed", String(x === s)));
    });
  });

  /* ---------- canvas ---------- */
  function setStyle(s) {
    ctx.strokeStyle = s.color;
    ctx.fillStyle = s.color;
    ctx.lineWidth = s.size;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }

  function drawStroke(s, w, h) {
    setStyle(s);
    const [first, ...rest] = s.points;
    if (!rest.length) {
      ctx.beginPath();
      ctx.arc(first.x * w, first.y * h, s.size / 2, 0, Math.PI * 2);
      ctx.fill();
      return;
    }
    ctx.beginPath();
    ctx.moveTo(first.x * w, first.y * h);
    rest.forEach((p) => ctx.lineTo(p.x * w, p.y * h));
    ctx.stroke();
  }

  function redraw() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);
    strokes.forEach((s) => drawStroke(s, w, h));
  }

  function resizeCanvas() {
    const r = canvas.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(r.width * dpr);
    canvas.height = Math.round(r.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    redraw();
  }

  new ResizeObserver(resizeCanvas).observe(canvas);

  const toPoint = (e) => {
    const r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
  };

  function updateTools() {
    undoBtn.disabled = strokes.length === 0;
    redoBtn.disabled = redoStack.length === 0;
  }

  canvas.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    canvas.setPointerCapture(e.pointerId);
    current = { color, size: brushSize, points: [toPoint(e)] };
    strokes.push(current);
    redoStack = [];
    drawStroke(current, canvas.clientWidth, canvas.clientHeight);
    updateTools();
    clearError();
  });

  canvas.addEventListener("pointermove", (e) => {
    if (!current) return;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const prev = current.points.at(-1);
    const p = toPoint(e);
    current.points.push(p);
    setStyle(current);
    ctx.beginPath();
    ctx.moveTo(prev.x * w, prev.y * h);
    ctx.lineTo(p.x * w, p.y * h);
    ctx.stroke();
  });

  ["pointerup", "pointercancel"].forEach((type) =>
    canvas.addEventListener(type, () => {
      current = null;
    }),
  );

  undoBtn.addEventListener("click", () => {
    if (strokes.length) redoStack.push(strokes.pop());
    redraw();
    updateTools();
  });

  redoBtn.addEventListener("click", () => {
    if (redoStack.length) strokes.push(redoStack.pop());
    redraw();
    updateTools();
  });

  function exportPNG() {
    const out = document.createElement("canvas");
    out.width = canvas.width;
    out.height = canvas.height;
    const c = out.getContext("2d");
    c.fillStyle = "#faf3e8";                   
    c.fillRect(0, 0, out.width, out.height);
    c.drawImage(canvas, 0, 0);
    return out.toDataURL("image/png");
  }

  /* ---------- SUBMIT STEP 1: VALIDASI & PINDAH KE CHOOSE MENU ---------- */
  storyForm.addEventListener("submit", (e) => {
    e.preventDefault();

    if (mode === "write") {
      const text = story.value.trim();
      const moodValue = storyForm.elements.mood.value;

      if (!text) {
        story.setAttribute("aria-invalid", "true");
        showError("Write a few words first.");
        story.focus();
        return;
      }

      if (!moodValue) {
        showError("Pick a mood first.");
        return;
      }

      draftPayload = { type: "text", text, mood: moodValue };
    } else {
      if (!strokes.length) {
        showError("Draw something first.");
        return;
      }

      draftPayload = { type: "drawing", image: exportPNG(), mood: null };
    }

    // Ganti tampilan ke Step 2 (Choose the menu)
    writeStep.hidden = true;
    sendBtn.hidden = true;
    menuStep.hidden = false;
    orderBtn.hidden = false;
    writingForm.classList.add("is-choosing-menu");
  });

  /* ---------- SUBMIT STEP 2: PILIH MENU & SAVE KE LOCALSTORAGE ---------- */
  menuForm.addEventListener("input", () => {
    if (menuHint) {
      menuHint.textContent = "";
      menuHint.classList.remove("is-error");
    }
  });

  menuForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const selectedMenu = menuForm.elements.menu.value;
    if (!selectedMenu) {
      if (menuHint) {
        menuHint.textContent = "Choose a drink first.";
        menuHint.classList.add("is-error");
      }
      return;
    }

    if (!draftPayload) return;

    // Ambil data lama dari localStorage
    let daftarCerita = [];
    const tersimpan = localStorage.getItem(KUNCI_STORAGE);
    if (tersimpan) {
      try {
        daftarCerita = JSON.parse(tersimpan);
      } catch {
        daftarCerita = [];
      }
    } else if (typeof dataAwalCerita !== "undefined") {
      daftarCerita = [...dataAwalCerita];
    }

    const sekarang = new Date();
    const formatMood = draftPayload.mood
      ? draftPayload.mood.charAt(0).toUpperCase() + draftPayload.mood.slice(1)
      : null;

    // Objek struk sesuai struktur yang diminta
    const struk = {
      story: draftPayload.type === "text" ? draftPayload.text : draftPayload.image,
      date: sekarang.toLocaleDateString("en-CA"),
      day: sekarang.toLocaleDateString("en-US", { weekday: "long" }),
      time: sekarang.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      mood: formatMood,
      code: selectedMenu,
      status: "pending",
    };

    daftarCerita.unshift(struk);
    localStorage.setItem(KUNCI_STORAGE, JSON.stringify(daftarCerita));

    console.log("Struk tersimpan:", struk);
  });
}