// DATA JS
const KUNCI_STORAGE = "STORY_CO_DATA";
let daftarCerita = [];

function esc(teks) {
  const d = document.createElement("div");
  d.textContent = teks;
  return d.innerHTML;
}

// eksekusi 1 data
document.addEventListener("DOMContentLoaded", () => {
  
  document
  .getElementById("")
  .addEventListener("click",);

  document
  .getElementById("")
  .addEventListener("submit", handleFormSubmit);
});

// mengambil data dari data.js
function muatData() {
  const tersimpan = localStorage.getItem(KUNCI_STORAGE);

  if (tersimpan) {
    try {
      daftarCerita = JSON.parse(tersimpan);
    } catch {
      daftarCerita = [];
    }
  } else {
    daftarCerita =
    typeof dataAwalCerita !== "undefined" ? [...dataAwalCerita] : [];
    simpanData();
  }
  tampilkanCeritaPilihan();
}

// menampilkan ke halaman web "DGN FITUR SELEKSI -BLM FIKS"
function tampilkanCeritaPilihan() {
  const strukCerita = document.getElementById("");

  // makesure struk kosong
  strukCerita.innerHTML = "";

  // menampilkan baris
  daftarCerita.forEach((cerita) => {
    strukCerita.appendChild(buatListStruk(cerita));
  });
  updateKartuStatistik();
}

function updateKartuStatistik() {
  const waitingData = document.getElementById("waiting-data");
  const publishData = document.getElementById("publish-data");
  const urgentData = document.getElementById("urgent-data");

  const jumlahPublish = daftarCerita.filter(
  (cerita) => String(cerita.status).toLowerCase() === "approved",
  ).length;

  if (waitingData) waitingData.textContent = daftarCerita.length;
  if (publishData) publishData.textContent = jumlahPublish;
  if (urgentData) urgentData.textContent = jumlahUrgent;
}