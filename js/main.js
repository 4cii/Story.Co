  document.querySelectorAll(".anonimus-col").forEach((col) => {
    const track = col.querySelector(".anonimus-track");
    if (!track) return;

    const dir = col.dataset.dir || "up";
    const duration = Number(col.dataset.speed) || 20;

    // Gandakan isi kartu di dalam track agar loop vertikal tidak pernah terputus
    const items = Array.from(track.children);
    items.forEach((item) => {
      const clone = item.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      track.appendChild(clone);
    });

    // Hitung setengah tinggi total track (1 set asli + 1 gap)
    const getLoopDistance = () => track.scrollHeight / 2;

    const tween =
      dir === "down"
        ? gsap.fromTo(
            track,
            { y: () => -getLoopDistance() },
            {
              y: 0,
              duration,
              ease: "none",
              repeat: -1,
              invalidateOnRefresh: true,
            }
          )
        : gsap.fromTo(
            track,
            { y: 0 },
            {
              y: () => -getLoopDistance(),
              duration,
              ease: "none",
              repeat: -1,
              invalidateOnRefresh: true,
            }
          );

    // Opsional: melambat halus saat user mengarahkan kursor untuk membaca cerita
    col.addEventListener("mouseenter", () => {
      gsap.to(tween, { timeScale: 0.25, duration: 0.5 });
    });
    col.addEventListener("mouseleave", () => {
      gsap.to(tween, { timeScale: 1, duration: 0.5 });
    });
  });

// DRAGABLE ELEMENT
const { Engine, Runner, Bodies, Body, Composite, Mouse, MouseConstraint, Events } = Matter;

const area = document.getElementById('area');
const S = area.clientWidth;
const R = S / 2;
const engine = Engine.create({ positionIterations: 10 });


// dinding lingkaran: disusun dari banyak balok kecil
const N = 64, T = 60;
for (let i = 0; i < N; i++) {
  const a = (i / N) * Math.PI * 2;
  Composite.add(engine.world, Bodies.rectangle(
    R + Math.cos(a) * (R + T / 2),
    R + Math.sin(a) * (R + T / 2),
    T, (2 * Math.PI * (R + T / 2)) / N + 4,
    { isStatic: true, angle: a }
  ));
}

// posisi awal tiap item (0 - 1 dari ukuran lingkaran)
const start = [[.45,.30], [.70,.28], [.28,.34], [.60,.45], [.35,.22], [.65,.18], [.50,.14]];

const items = [...area.querySelectorAll('.item')].map((el, i) => {
  const w = el.offsetWidth, h = el.offsetHeight;
  const [px, py] = start[i % start.length];
  const opsi = { restitution: 0.3, friction: 0.4 };
  const body = el.classList.contains('face')
    ? Bodies.circle(px * S, py * S, w / 2, opsi)
    : Bodies.rectangle(px * S, py * S, w, h, { ...opsi, chamfer: { radius: h / 2 - 1 } });
  Body.setAngle(body, (Math.random() - 0.5) * 0.8);
  const item = { el, body, w, h };
  // jatuh satu per satu
  setTimeout(() => {
    Composite.add(engine.world, body);
    el.style.visibility = 'visible';
  }, i * 250);
  return item;
});

// drag pakai mouse / jari
const mouse = Mouse.create(area);
Composite.add(engine.world, MouseConstraint.create(engine, { mouse, constraint: { stiffness: 0.2 } }));
window.addEventListener('mouseup', () => { mouse.button = -1; });

Events.on(engine, 'afterUpdate', () => {
  items.forEach(({ el, body, w, h }) => {
    // kalau lolos dari lingkaran, balikin ke tengah
    if (Math.hypot(body.position.x - R, body.position.y - R) > R) {
      Body.setPosition(body, { x: R, y: R * 0.6 });
      Body.setVelocity(body, { x: 0, y: 0 });
    }
    el.style.transform =
      `translate(${body.position.x - w / 2}px, ${body.position.y - h / 2}px) rotate(${body.angle}rad)`;
  });
});

// ukuran layar berubah (mis. HP diputar): muat ulang
window.addEventListener('resize', () => {
  if (area.clientWidth !== S) location.reload();
});

Runner.run(Runner.create(), engine);

  

  