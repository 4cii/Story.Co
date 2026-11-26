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