const firstName = localStorage.getItem("firstName");
if (!firstName) {
  window.location.replace("login.html");
}

document.addEventListener("DOMContentLoaded", () => {
  const greetingEl = document.getElementById("userGreeting");
  const logoutBtn = document.getElementById("logoutBtn");

  greetingEl.textContent = `Welcome, ${firstName}`;

  logoutBtn.addEventListener("click", () => {
    // menghapus data sesi
    localStorage.removeItem("firstName");
    //mengarahkan kembali ke login page
    window.location.href = "login.html";
  });

  fetchProducts();
  tampilkanKeranjang();
  document
    .getElementById("searchInput")
    .addEventListener("input", debouncedSearch);
});

const CATEGORIES = ["fragrances", "beauty", "furniture", "groceries"];
let allProducts = [];

// KERANJANG
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// LOAD MORE
let jumlahTampil = 10;
let produkSaatIni = [];

async function fetchProducts() {
  try {
    const loadingState = document.getElementById("loadingState");
    const errorState = document.getElementById("errorState");

    loadingState.style.display = "block";
    errorState.hidden = true;

    // Cukup 1 fetch, ke SEMUA produk (limit=0 = tanpa batas)
    const response = await fetch("https://dummyjson.com/products?limit=0");

    if (!response.ok) {
      throw new Error("Gagal mengambil data produk");
    }

    const data = await response.json();
    allProducts = data.products; // langsung 194 produk, semua kategori

    renderProducts(allProducts);
    renderFlashSale(allProducts);

    loadingState.style.display = "none";
  } catch (error) {
    console.error("Gagal memuat produk:", error);
    document.getElementById("loadingState").style.display = "none";
    document.getElementById("errorState").hidden = false;
  }
}

function renderProducts(products) {
  const grid = document.getElementById("productGrid");
  const loadMoreBtn = document.getElementById("loadMoreBtn");

  // Simpan produk yang sedang ditampilkan
  produkSaatIni = products;

  // Ambil produk sesuai jumlah yang ingin ditampilkan
  const produkTampil = products.slice(0, jumlahTampil);

  grid.innerHTML = produkTampil
    .map(
      (product) => `
        <div class="product-card" data-id="${product.id}">
          <img src="${product.thumbnail}" alt="${product.title}">
          <h3>${product.title}</h3>
          <p>Kategori: ${product.category}</p>
          <p>Harga: $${product.price}</p>
          <p>Rating: ⭐ ${product.rating}</p>
          <p>Diskon: ${product.discountPercentage}%</p>

          <button class="add-cart-btn" onclick="tambahKeKeranjang(${product.id})">
            Tambah ke Keranjang
          </button>
        </div>
      `,
    )
    .join("");

  // Kalau semua produk sudah tampil, sembunyikan tombol
  if (jumlahTampil >= products.length) {
    loadMoreBtn.style.display = "none";
  } else {
    loadMoreBtn.style.display = "block";
  }
}

function debounce(func, delay) {
  let timerId;
  return function (...args) {
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

function handleSearch() {
  const query = document
    .getElementById("searchInput")
    .value.toLowerCase()
    .trim();

  const filtered = allProducts.filter(
    (product) =>
      product.title.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query),
  );

  renderProducts(filtered);
}

// Bungkus handleSearch pakai debounce, tunda 400ms
const debouncedSearch = debounce(handleSearch, 400);

function renderFlashSale(products) {
  // ambil produk dengan diskon 90% ke atas
  const flashProducts = products.filter(
    (product) => product.discountPercentage >= 90,
  );

  const flashContainer = document.getElementById("flashScroll");

  flashContainer.innerHTML = flashProducts
    .map(
      (product) => `
        <div class="product-card">
            <img src="${product.thumbnail}" alt="${product.title}">
            <h3>${product.title}</h3>
            <p>Kategori: ${product.category}</p>
            <p>Harga: $${product.price}</p>
            <p>Diskon: ${product.discountPercentage}%</p>
        </div>
    `,
    )
    .join("");
}

// ================
// FILTER KATEGORI
// ================
const categoryFilter = document.getElementById("categoryFilter");

categoryFilter.addEventListener("change", function () {
  const selectedCategory = categoryFilter.value;

  if (selectedCategory === "all") {
    renderProducts(allProducts);
    return;
  }

  const filteredProducts = allProducts.filter(function (product) {
    return product.category === selectedCategory;
  });

  renderProducts(filteredProducts);
});

// ================
// SORTING PRODUK
// ================
const sortFilter = document.getElementById("sortFilter");

sortFilter.addEventListener("change", function () {
  const pilihanSort = sortFilter.value;

  // Salin semua produk
  let hasilSort = allProducts.slice();

  // Harga termurah
  if (pilihanSort === "price-asc") {
    hasilSort.sort(function (a, b) {
      return a.price - b.price;
    });
  }

  // Harga termahal
  if (pilihanSort === "price-desc") {
    hasilSort.sort(function (a, b) {
      return b.price - a.price;
    });
  }

  // Rating tertinggi
  if (pilihanSort === "rating-desc") {
    hasilSort.sort(function (a, b) {
      return b.rating - a.rating;
    });
  }

  renderProducts(hasilSort);
});

// ==========================
// FUNGSI TAMBAH KE KERANJANG
// ==========================

function tambahKeKeranjang(idProduk) {
  const produk = allProducts.find(function (product) {
    return product.id === idProduk;
  });

  cart.push(produk);

  simpanKeranjang();
  tampilkanKeranjang();
}

// ==========================
// SIMPAN KERANJANG
// ==========================

function simpanKeranjang() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// ==========================
// TAMPILKAN KERANJANG
// ==========================

function tampilkanKeranjang() {
  const cartItems = document.getElementById("cartItems");
  const cartBadge = document.getElementById("cartBadge");
  const cartTotal = document.getElementById("cartTotal");

  cartItems.innerHTML = "";

  let total = 0;

  cart.forEach(function (product, index) {
    cartItems.innerHTML += `
      <div class="cart-item">

        <img src="${product.thumbnail}" alt="${product.title}">

        <div>
          <p>${product.title}</p>
          <p>$${product.price}</p>
        </div>

        <button onclick="hapusDariKeranjang(${index})">
          Hapus
        </button>

      </div>
    `;

    total = total + product.price;
  });

  cartBadge.textContent = cart.length;
  cartTotal.textContent = "$" + total.toFixed(2);
}

// ==========================
// HAPUS DARI KERANJANG
// ==========================

function hapusDariKeranjang(index) {
  cart.splice(index, 1);

  if (cart.length === 0) {
    localStorage.removeItem("cart");
  } else {
    simpanKeranjang();
  }

  tampilkanKeranjang();
}

// ========================
// BUKA DAN TUTUP KERANJANG
// ========================

const cartBtn = document.getElementById("cartBtn");
const cartPanel = document.getElementById("cartPanel");
const cartClose = document.getElementById("cartClose");
const cartOverlay = document.getElementById("cartOverlay");

cartBtn.addEventListener("click", function () {
  cartPanel.classList.add("is-open");
  cartOverlay.classList.add("is-open");
});

cartClose.addEventListener("click", function () {
  cartPanel.classList.remove("is-open");
  cartOverlay.classList.remove("is-open");
});

cartOverlay.addEventListener("click", function () {
  cartPanel.classList.remove("is-open");
  cartOverlay.classList.remove("is-open");
});

// =========
// LOAD MORE
// =========

const loadMoreBtn = document.getElementById("loadMoreBtn");

loadMoreBtn.addEventListener("click", function () {
  jumlahTampil = jumlahTampil + 10;

  renderProducts(produkSaatIni);
});

// ==========================
// DETAIL PRODUK
// ==========================

const productGrid = document.getElementById("productGrid");
const modalOverlay = document.getElementById("modalOverlay");
const productModal = document.getElementById("productModal");

// EVENT DELEGATION
productGrid.addEventListener("click", function (event) {
  // Kalau klik tombol keranjang,
  // jangan buka modal
  if (event.target.tagName === "BUTTON") {
    return;
  }

  const card = event.target.closest(".product-card");

  if (!card) {
    return;
  }

  const idProduk = Number(card.dataset.id);

  const produk = allProducts.find(function (product) {
    return product.id === idProduk;
  });

  tampilkanDetailProduk(produk);
});

// MENAMPILKAN DETAIL PRODUK
function tampilkanDetailProduk(produk) {
  productModal.innerHTML = `
    <button class="pm-close" id="closeModal">
      X
    </button>

    <img src="${produk.thumbnail}" alt="${produk.title}">

    <div>
      <p>${produk.category}</p>

      <h3>${produk.title}</h3>

      <p>Brand: ${produk.brand}</p>

      <p>Harga: $${produk.price}</p>

      <p>Stok: ${produk.stock}</p>

      <p>${produk.description}</p>
    </div>
  `;

  modalOverlay.classList.add("is-open");

  const closeModal = document.getElementById("closeModal");

  closeModal.addEventListener("click", function () {
    modalOverlay.classList.remove("is-open");
  });
}

// KLIK AREA LUAR UNTUK MENUTUP MODAL
modalOverlay.addEventListener("click", function (event) {
  if (event.target === modalOverlay) {
    modalOverlay.classList.remove("is-open");
  }
});

// ============
// RETRY FETCH
// ============

const retryBtn = document.getElementById("retryBtn");

retryBtn.addEventListener("click", function () {
  fetchProducts();
});
