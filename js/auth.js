const KUNCI_AUTH = "STORY_CO_ADMIN_SESSION";
const LOGIN_PAGE = "sign-up.html";      // sesuaikan dengan nama file halaman Sign In kamu
const DASHBOARD_PAGE = "dashboard.html";

// Daftar akun admin yang diizinkan
const ADMIN_ACCOUNTS = [
  { email: "kharim@story.co", password: "123", name: "Kharim" },
  { email: "admin@story.co",  password: "123", name: "Admin" },
];

function getAdminSession() {
  try {
    return JSON.parse(sessionStorage.getItem(KUNCI_AUTH));
  } catch {
    return null;
  }
}

// SIGN IN
const signInForm = document.querySelector(".panel .form");

if (signInForm) {
  // Kalau sudah login, langsung lempar ke dashboard
  if (getAdminSession()) {
    window.location.replace(DASHBOARD_PAGE);
  }

  const nameInput  = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const passInput  = document.getElementById("password");
  const errorEl    = document.getElementById("auth-error");

  signInForm.addEventListener("input", () => {
    if (errorEl) errorEl.textContent = "";
  });

  signInForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const nameVal  = nameInput.value.trim();
    const emailVal = emailInput.value.trim().toLowerCase();
    const passVal  = passInput.value;

    const cocok = ADMIN_ACCOUNTS.find(
      (acc) => acc.email.toLowerCase() === emailVal && acc.password === passVal
    );

    if (!cocok) {
      if (errorEl) {
        errorEl.textContent = "Email atau password salah.";
        errorEl.style.color = "#b34d45";
      }
      return;
    }

    // Simpan sesi (pakai nama yang diketik di form, atau nama default akun)
    sessionStorage.setItem(
      KUNCI_AUTH,
      JSON.stringify({ name: nameVal || cocok.name, email: cocok.email })
    );

    window.location.href = DASHBOARD_PAGE;
  });
}

// Proteksi n LogOut
const adminContainer = document.querySelector(".admin");

if (adminContainer) {
  const sesi = getAdminSession();

  // Jika belum login, tendang kembali ke halaman Sign In
  if (!sesi) {
    window.location.replace(LOGIN_PAGE);
  } else {
    // Tampilkan sapaan sesuai nama admin yang login
    const titleEl = document.getElementById("title");
    if (titleEl) titleEl.textContent = `Greetings, ${sesi.name}.`;
  }

  // Tombol Log Out di sidebar
  const logoutBtn = document.querySelector(".logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      if (!confirm("Log out from Admin Panel?")) return;
      sessionStorage.removeItem(KUNCI_AUTH);
      window.location.replace(LOGIN_PAGE);
    });
  }
}