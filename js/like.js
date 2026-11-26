const semuaTombolLike = document.querySelectorAll(".likeBtn");

semuaTombolLike.forEach((likeBtn, index) => {
  // Cari ikon dan angka khusus di dalam tombol struk yang ini saja
  const heartIcon = likeBtn.querySelector(".heartIcon");
  const likeCount = likeBtn.querySelector(".likeCount");

  // Membedakan kunci local storage
  let count = parseInt(localStorage.getItem(`storyLikes_${index}`)) || 0;
  let isLiked = localStorage.getItem(`isStoryLiked_${index}`) === "true";

  // Tampilan awal tiap struk saat dibuka
  likeCount.textContent = count;
  if (isLiked) {
    heartIcon.classList.replace("ri-heart-line", "ri-heart-fill");
    heartIcon.style.color = "red";
  } else {
    heartIcon.style.color = "black";
  }

  // Fungsi tambah & kurang khusus struk ini
  function tambahLike() {
    count++;
    heartIcon.classList.replace("ri-heart-line", "ri-heart-fill");
    heartIcon.style.color = "red";
    likeCount.textContent = count;
  }

  function kurangLike() {
    count--;
    heartIcon.classList.replace("ri-heart-fill", "ri-heart-line");
    heartIcon.style.color = "black";
    likeCount.textContent = count;
  }

  // Event klik untuk masing-masing struk
  likeBtn.addEventListener("click", () => {
    isLiked = !isLiked;

    if (isLiked) {
      tambahLike();
    } else {
      kurangLike();
    }

    localStorage.setItem(`storyLikes_${index}`, count);
    localStorage.setItem(`isStoryLiked_${index}`, isLiked);
  });
});
