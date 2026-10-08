// biaya tambahan (ubah sesuai kebutuhan)
var BIAYA_DESAIN = 25000;
var BIAYA_ONGKIR = 15000;
var KUNCI = "keranjangDapurSablon";

function ambilKeranjang() {
  try {
    return JSON.parse(localStorage.getItem(KUNCI)) || [];
  } catch (e) {
    return [];
  }
}

function simpanKeranjang(data) {
  localStorage.setItem(KUNCI, JSON.stringify(data));
}

var KUNCI_RIWAYAT = "riwayatDapurSablon";

function ambilRiwayat() {
  try {
    return JSON.parse(localStorage.getItem(KUNCI_RIWAYAT)) || [];
  } catch (e) {
    return [];
  }
}

function simpanRiwayat(data) {
  localStorage.setItem(KUNCI_RIWAYAT, JSON.stringify(data));
}

function dua(n) {
  return n < 10 ? "0" + n : "" + n;
}

function formatTanggal(iso) {
  var t = new Date(iso);
  return dua(t.getDate()) + "/" + dua(t.getMonth() + 1) + "/" + t.getFullYear();
}

function rupiah(angka) {
  return "Rp." + angka.toLocaleString("id-ID");
}

// jumlah barang di pilihan keranjang (navbar)
function perbaruiPilihanKeranjang() {
  var pilih = document.getElementById("pilih-keranjang");
  if (!pilih) return;
  var data = ambilKeranjang();
  var total = 0;
  for (var i = 0; i < data.length; i++) total += data[i].jumlah;
  pilih.options[0].text = total > 0 ? "Keranjang (" + total + ")" : "Keranjang";
}

perbaruiPilihanKeranjang();

// kembalikan pilihan ke awal kalau pengguna menekan tombol back
window.addEventListener("pageshow", function () {
  var pilih = document.getElementById("pilih-keranjang");
  if (pilih) pilih.selectedIndex = 0;
});


/* ===== akun & sesi ===== */
var KUNCI_AKUN = "akunDapurSablon";
var KUNCI_SESI = "sesiDapurSablon";

function ambilAkun() {
  try {
    return JSON.parse(localStorage.getItem(KUNCI_AKUN)) || [];
  } catch (e) {
    return [];
  }
}

function ambilSesi() {
  try {
    return JSON.parse(localStorage.getItem(KUNCI_SESI));
  } catch (e) {
    return null;
  }
}

function tampilPesan(el, teks, jenis) {
  el.textContent = teks;
  el.className = "pesan-auth " + jenis;
}

var sesi = ambilSesi();

// halaman yang wajib login
if (document.body.dataset.login === "wajib" && !sesi) {
  window.location.replace("login.html");
}

// nama akun di navbar
if (sesi) {
  var daftarNama = document.querySelectorAll(".nama-user");
  for (var x = 0; x < daftarNama.length; x++) {
    daftarNama[x].textContent = sesi.nama;
  }
}

// logout
var daftarLogout = document.querySelectorAll(".logout");
for (var y = 0; y < daftarLogout.length; y++) {
  daftarLogout[y].onclick = function () {
    localStorage.removeItem(KUNCI_SESI);
  };
}

// form daftar
var formDaftar = document.getElementById("form-daftar");

if (formDaftar) {
  var pesanDaftar = document.getElementById("pesan");

  formDaftar.onsubmit = function (e) {
    e.preventDefault();

    var nama = formDaftar.elements["nama"].value.trim();
    var email = formDaftar.elements["email"].value.trim().toLowerCase();
    var pass = formDaftar.elements["password"].value;
    var ulang = formDaftar.elements["ulang"].value;

    if (pass.length < 8) {
      tampilPesan(pesanDaftar, "Password minimal 8 karakter.", "error");
      return;
    }

    if (pass !== ulang) {
      tampilPesan(pesanDaftar, "Konfirmasi password tidak sama.", "error");
      return;
    }

    var akun = ambilAkun();

    for (var k = 0; k < akun.length; k++) {
      if (akun[k].email === email) {
        tampilPesan(pesanDaftar, "Email ini sudah terdaftar, silakan masuk.", "error");
        return;
      }
    }

    akun.push({ nama: nama, email: email, password: pass });
    localStorage.setItem(KUNCI_AKUN, JSON.stringify(akun));

    sessionStorage.setItem("pesanLogin", "Pendaftaran berhasil, silakan masuk.");
    sessionStorage.setItem("emailBaru", email);
    window.location.href = "login.html";
  };
}

// form login
var formLogin = document.getElementById("form-login");

if (formLogin) {
  var pesanLogin = document.getElementById("pesan");

  var pesanAwal = sessionStorage.getItem("pesanLogin");
  if (pesanAwal) {
    tampilPesan(pesanLogin, pesanAwal, "sukses");
    formLogin.elements["email"].value = sessionStorage.getItem("emailBaru") || "";
    sessionStorage.removeItem("pesanLogin");
    sessionStorage.removeItem("emailBaru");
  }

  formLogin.onsubmit = function (e) {
    e.preventDefault();

    var email = formLogin.elements["email"].value.trim().toLowerCase();
    var pass = formLogin.elements["password"].value;
    var akun = ambilAkun();
    var cocok = null;

    for (var k = 0; k < akun.length; k++) {
      if (akun[k].email === email && akun[k].password === pass) {
        cocok = akun[k];
      }
    }

    if (!cocok) {
      tampilPesan(pesanLogin, "Email atau password salah.", "error");
      return;
    }

    localStorage.setItem(KUNCI_SESI, JSON.stringify({ nama: cocok.nama, email: cocok.email }));
    window.location.href = "beranda.html";
  };
}


/* ===== halaman detail produk ===== */
var formPesan = document.getElementById("form-pesan");

if (formPesan) {
  var hargaDasar = Number(formPesan.dataset.harga);
  var inputJumlah = document.getElementById("jumlah");
  var tampilTotal = document.getElementById("total");
  var tampilHarga = document.getElementById("harga-satuan");

  function bacaJumlah() {
    var n = parseInt(inputJumlah.value);
    if (!n || n < 1) n = 1;
    return n;
  }

  // baca semua pilihan (radio yang dipilih + dropdown)
  function bacaPilihan() {
    var teks = [];
    var tambah = 0;
    var semua = formPesan.querySelectorAll('input[type="radio"]:checked, select');

    for (var q = 0; q < semua.length; q++) {
      var el = semua[q];
      var opsi = el.tagName === "SELECT" ? el.options[el.selectedIndex] : el;
      tambah += Number(opsi.dataset.tambah || 0);
      teks.push((el.dataset.label ? el.dataset.label + " " : "") + el.value);
    }

    return { teks: teks.join(", "), tambah: tambah };
  }

  function hitungTotal() {
    var satuan = hargaDasar + bacaPilihan().tambah;
    tampilHarga.textContent = "Rp. " + satuan.toLocaleString("id-ID") + ",00";
    tampilTotal.textContent = "Rp " + (satuan * bacaJumlah()).toLocaleString("id-ID") + ",00";
  }

  formPesan.onchange = hitungTotal;

  document.getElementById("tambah").onclick = function () {
    inputJumlah.value = bacaJumlah() + 1;
    hitungTotal();
  };

  document.getElementById("kurang").onclick = function () {
    inputJumlah.value = Math.max(1, bacaJumlah() - 1);
    hitungTotal();
  };

  inputJumlah.oninput = hitungTotal;

  formPesan.onsubmit = function (e) {
    e.preventDefault();

    var file = formPesan.elements["desain"].files[0];
    if (file && file.size > 10 * 1024 * 1024) {
      alert("Ukuran file desain maksimal 10 MB.");
      return;
    }

    var pilihan = bacaPilihan();

    var barang = {
      id: formPesan.dataset.id + "|" + pilihan.teks,
      nama: formPesan.dataset.nama,
      ket: formPesan.dataset.ket,
      pilihan: pilihan.teks,
      harga: hargaDasar + pilihan.tambah,
      jumlah: bacaJumlah(),
      gambar: document.querySelector(".detail-foto img").getAttribute("src"),
      adaFile: !!file
    };

    var keranjang = ambilKeranjang();
    var sudahAda = false;

    for (var i = 0; i < keranjang.length; i++) {
      if (keranjang[i].id === barang.id) {
        keranjang[i].jumlah += barang.jumlah;
        if (barang.adaFile) keranjang[i].adaFile = true;
        sudahAda = true;
      }
    }

    if (!sudahAda) keranjang.push(barang);

    simpanKeranjang(keranjang);
    window.location.href = "keranjang.html";
  };
}


/* ===== halaman keranjang ===== */
var daftarKeranjang = document.getElementById("daftar-keranjang");

if (daftarKeranjang) {
  function tampilkanKeranjang() {
    var data = ambilKeranjang();
    var html = "";
    var subTotal = 0;
    var adaTanpaFile = false;

    if (data.length === 0) {
      html = '<p class="kosong">Keranjang kamu masih kosong. <a href="beranda.html">Cari produk dulu</a></p>';
    }

    for (var i = 0; i < data.length; i++) {
      var b = data[i];
      subTotal += b.harga * b.jumlah;
      if (!b.adaFile) adaTanpaFile = true;

      html += '<div class="item">' +
        '<img src="' + b.gambar + '" alt="' + b.nama + '">' +
        '<div class="item-info">' +
          '<h4>' + b.nama + '</h4>' +
          '<p>' + b.ket + '</p>' +
          '<p class="item-pilihan">' + b.pilihan + '</p>' +
          '<div class="jumlah">' +
            '<button type="button" data-aksi="kurang" data-no="' + i + '">−</button>' +
            '<span class="angka">' + b.jumlah + '</span>' +
            '<button type="button" data-aksi="tambah" data-no="' + i + '">+</button>' +
          '</div>' +
        '</div>' +
        '<div class="item-kanan">' +
          '<p class="item-harga">' + rupiah(b.harga * b.jumlah) + '</p>' +
          '<button type="button" class="btn-hapus" data-aksi="hapus" data-no="' + i + '">HAPUS</button>' +
        '</div>' +
      '</div>';
    }

    daftarKeranjang.innerHTML = html;

    var desain = (data.length > 0 && adaTanpaFile) ? BIAYA_DESAIN : 0;
    var ongkir = data.length > 0 ? BIAYA_ONGKIR : 0;

    document.getElementById("sub-total").textContent = rupiah(subTotal);
    document.getElementById("biaya-desain").textContent = rupiah(desain);
    document.getElementById("biaya-ongkir").textContent = rupiah(ongkir);
    document.getElementById("total-semua").textContent = rupiah(subTotal + desain + ongkir);
    perbaruiPilihanKeranjang();
  }

  daftarKeranjang.onclick = function (e) {
    var tombol = e.target.closest("button");
    if (!tombol) return;

    var no = Number(tombol.dataset.no);
    var aksi = tombol.dataset.aksi;
    var data = ambilKeranjang();

    if (aksi === "tambah") data[no].jumlah += 1;
    if (aksi === "kurang" && data[no].jumlah > 1) data[no].jumlah -= 1;
    if (aksi === "hapus") data.splice(no, 1);

    simpanKeranjang(data);
    tampilkanKeranjang();
  };

  document.getElementById("lanjut").onclick = function (e) {
    if (ambilKeranjang().length === 0) {
      e.preventDefault();
      alert("Keranjang kamu masih kosong.");
    }
  };

  tampilkanKeranjang();
}


/* ===== halaman pemesanan ===== */
var formBayar = document.getElementById("form-pembayaran");

if (formBayar) {
  var dataPesanan = ambilKeranjang();

  if (sesi) formBayar.elements["nama"].value = sesi.nama;
  var htmlPesanan = "";
  var jumlahSub = 0;
  var adaTanpaFileBayar = false;

  if (dataPesanan.length === 0) {
    htmlPesanan = '<p class="kosong">Keranjang masih kosong. <a href="beranda.html">Cari produk dulu</a></p>';
  }

  for (var n = 0; n < dataPesanan.length; n++) {
    var item = dataPesanan[n];
    jumlahSub += item.harga * item.jumlah;
    if (!item.adaFile) adaTanpaFileBayar = true;
    htmlPesanan += '<div class="ringkasan-baris"><span>' + item.nama + ' x ' + item.jumlah + '</span><b>' + rupiah(item.harga * item.jumlah) + '</b></div>';
  }

  var desainBayar = (dataPesanan.length > 0 && adaTanpaFileBayar) ? BIAYA_DESAIN : 0;
  var ongkirBayar = dataPesanan.length > 0 ? BIAYA_ONGKIR : 0;

  if (desainBayar > 0) {
    htmlPesanan += '<div class="ringkasan-baris"><span>BIAYA DESAIN</span><b>' + rupiah(desainBayar) + '</b></div>';
  }
  if (dataPesanan.length > 0) {
    htmlPesanan += '<div class="ringkasan-baris"><span>BIAYA ONGKIR</span><b>' + rupiah(ongkirBayar) + '</b></div>';
  }

  document.getElementById("daftar-pesanan").innerHTML = htmlPesanan;
  document.getElementById("total-bayar").textContent = rupiah(jumlahSub + desainBayar + ongkirBayar);

  formBayar.onsubmit = function (e) {
    e.preventDefault();

    if (dataPesanan.length === 0) {
      alert("Keranjang masih kosong, tambahkan produk dulu.");
      return;
    }

    var metode = formBayar.elements["metode"].value;

    var riwayat = ambilRiwayat();
    riwayat.unshift({
      kode: "#DS-" + dua(riwayat.length + 1),
      tanggal: new Date().toISOString(),
      status: "Proses",
      penerima: formBayar.elements["nama"].value,
      wa: formBayar.elements["wa"].value,
      alamat: formBayar.elements["alamat"].value,
      catatan: formBayar.elements["catatan"].value,
      metode: metode,
      total: jumlahSub + desainBayar + ongkirBayar,
      barang: dataPesanan
    });
    simpanRiwayat(riwayat);

    simpanKeranjang([]);
    window.location.href = "riwayat.html";
  };
}


/* ===== halaman riwayat ===== */
var daftarRiwayat = document.getElementById("riwayat-daftar");

if (daftarRiwayat) {
  var semuaRiwayat = ambilRiwayat();
  var htmlRiwayat = "";

  if (semuaRiwayat.length === 0) {
    htmlRiwayat = '<p class="kosong">Belum ada pesanan. <a href="beranda.html">Belanja dulu</a></p>';
  }

  for (var a = 0; a < semuaRiwayat.length; a++) {
    var pesanan = semuaRiwayat[a];

    for (var b = 0; b < pesanan.barang.length; b++) {
      var brg = pesanan.barang[b];
      var selesai = pesanan.status === "Selesai";
      var rincian = brg.pilihan.split(", ").join(" · ") + " · " + brg.jumlah + " pcs";

      htmlRiwayat += '<div class="riwayat-baris">' +
        '<p class="riwayat-kode">' + pesanan.kode + '</p>' +
        '<div class="riwayat-foto"><img src="' + brg.gambar + '" alt="' + brg.nama + '"></div>' +
        '<div class="riwayat-produk"><h4>' + brg.nama + '</h4><p>' + rincian + '</p></div>' +
        '<p class="riwayat-tanggal">' + formatTanggal(pesanan.tanggal) + '</p>' +
        '<span class="status ' + (selesai ? "selesai" : "proses") + '">' + (selesai ? "SELESAI" : "Proses") + '</span>' +
        (selesai
          ? '<a href="beranda.html" class="btn-riwayat">Pesan Lagi</a>'
          : '<button type="button" class="btn-riwayat" data-a="' + a + '">Lacak</button>') +
      '</div>';
    }
  }

  daftarRiwayat.innerHTML = htmlRiwayat;

  daftarRiwayat.onclick = function (e) {
    var tombol = e.target.closest("button");
    if (!tombol) return;
    var p = semuaRiwayat[Number(tombol.dataset.a)];
    alert("Pesanan " + p.kode + " sedang diproses.\nPenerima: " + p.penerima +
      "\nPembayaran: " + p.metode + "\nTotal: " + rupiah(p.total));
  };
}

/* ===== banner geser otomatis ===== */
var bannerSlide = document.querySelectorAll(".banner .slide");

if (bannerSlide.length > 1) {
  var bannerTitik = document.querySelectorAll(".banner .titik span");
  var bannerNo = 0;
  var bannerTimer;

  function tampilBanner(n) {
    bannerSlide[bannerNo].classList.remove("aktif");
    bannerTitik[bannerNo].classList.remove("aktif");

    bannerNo = n % bannerSlide.length;

    bannerSlide[bannerNo].classList.add("aktif");
    bannerTitik[bannerNo].classList.add("aktif");
  }

  function mulaiBanner() {
    bannerTimer = setInterval(function () {
      tampilBanner(bannerNo + 1);
    }, 1000);
  }

  for (var t = 0; t < bannerTitik.length; t++) {
    bannerTitik[t].onclick = (function (n) {
      return function () { tampilBanner(n); };
    })(t);
  }

  var kotakBanner = document.querySelector(".banner");
  kotakBanner.onmouseenter = function () { clearInterval(bannerTimer); };
  kotakBanner.onmouseleave = mulaiBanner;

  mulaiBanner();
}