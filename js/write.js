// Scribble button effect
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


// Buku menu membuka kartu (writing sect)
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


// 3. STEP 1 -> STEP 2 -> PANEL SUKSES
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

  // Elemen perpindahan step & panel sukses
  const writeStep = document.getElementById("write-step");
  const sendBtn = document.getElementById("send-btn");
  const menuStep = document.getElementById("menu-step");
  const orderBtn = document.getElementById("order-btn");
  const menuHint = document.getElementById("menu-hint");
  const successPanel = document.getElementById("success-panel");
  const storyCodeEl = document.getElementById("story-code");
  const codeChipBtn = document.getElementById("code-chip");
  const copyHintEl = document.getElementById("copy-hint");
  const writeAgainBtn = document.getElementById("write-again");

  let draftPayload = null;
  let mode = "write";
  let color = document.querySelector('.swatch[aria-pressed="true"]').dataset.color;
  const brushSize = 5;
  const strokes = [];
  let redoStack = [];
  let current = null;

  // error message
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

  // ganti mode
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

  // color picker
  swatches.forEach((s) => {
    s.style.background = s.dataset.color;
    s.addEventListener("click", () => {
      color = s.dataset.color;
      swatches.forEach((x) => x.setAttribute("aria-pressed", String(x === s)));
    });
  });

  // canvas
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

  // SUBMIT CERITA
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

      draftPayload = { type: "text", story: text, mood: moodValue };
    } else {
      if (!strokes.length) {
        showError("Draw something first.");
        return;
      }

      draftPayload = { type: "drawing", story: exportPNG(), mood: null };
    }

    writeStep.hidden = true;
    sendBtn.hidden = true;
    menuStep.hidden = false;
    orderBtn.hidden = false;
    writingForm.classList.add("is-choosing-menu");
  });

  // SUBMIT MENU DAN SIMPAN KE JS
  menuForm.addEventListener("input", () => {
    if (menuHint) {
      menuHint.textContent = "";
      menuHint.classList.remove("is-error");
    }
  });

  menuForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const checkedMenu = menuForm.querySelector('input[name="menu"]:checked');
    if (!checkedMenu) {
      if (menuHint) {
        menuHint.textContent = "Choose a drink first.";
        menuHint.classList.add("is-error");
      }
      return;
    }

    if (!draftPayload) return;

    // Panggil tambahCerita() dari data.js agar format cocok dengan dashboard & board
    const hasil = tambahCerita({
      type: draftPayload.type,
      story: draftPayload.story,
      mood: draftPayload.mood,
      drink: checkedMenu.value,
    });

    if (!hasil.ok) {
      if (menuHint) {
        menuHint.textContent = hasil.error;
        menuHint.classList.add("is-error");
      }
      return;
    }

    tampilkanSukses(hasil.story.code);
  });

  // SUCSESS N RESET
  function tampilkanSukses(kode) {
    menuStep.hidden = true;
    orderBtn.hidden = true;
    if (storyCodeEl) storyCodeEl.textContent = kode;
    if (copyHintEl) copyHintEl.textContent = "Tap the code to copy it. We can't recover it.";
    if (successPanel) successPanel.hidden = false;
  }

  function resetSemua() {
    draftPayload = null;
    storyForm.reset();
    menuForm.reset();

    strokes.length = 0;
    redoStack = [];
    redraw();
    updateTools();
    clearError();

    if (menuHint) {
      menuHint.textContent = "";
      menuHint.classList.remove("is-error");
    }

    setMode("write");
    if (successPanel) successPanel.hidden = true;
    menuStep.hidden = true;
    orderBtn.hidden = true;
    writeStep.hidden = false;
    sendBtn.hidden = false;
    writingForm.classList.remove("is-choosing-menu");
  }

  // Listener 1: Salin kode saat code-chip diklik
  codeChipBtn?.addEventListener("click", async () => {
    const kode = storyCodeEl?.textContent?.trim();
    if (!kode) return;

    try {
      await navigator.clipboard.writeText(kode);
      if (copyHintEl) copyHintEl.textContent = "Copied! Save it somewhere safe.";
    } catch {
      if (copyHintEl) copyHintEl.textContent = `Code: ${kode} (copy manually)`;
    }
  });

  // Listener 2: Tulis cerita lagi
  writeAgainBtn?.addEventListener("click", resetSemua);

  // Listener 3: Reset jika tombol back diklik saat form sedang terbuka
  document.querySelector(".back-btn")?.addEventListener("click", () => {
    draftPayload = null;
  });
}