const firstName = localStorage.getItem('firstName');
if (!firstName) {
    window.location.replace('login.html');
}


document.addEventListener('DOMContentLoaded', () => {

    const greetingEl = document.getElementById('userGreeting');
    const logoutBtn = document.getElementById('logoutBtn');

    greetingEl.textContent = `Welcome, ${firstName}`;

 
    logoutBtn.addEventListener('click', () => {
        // menghapus data sesi
        localStorage.removeItem('firstName'); 
        //mengarahkan kembali ke login page
        window.location.href = 'login.html';
    } 
    );

    fetchProducts(); 
    document.getElementById('searchInput').addEventListener('input', debouncedSearch);
});

const CATEGORIES = ['fragrances', 'beauty', 'furniture', 'groceries'];
let allProducts = [];

async function fetchProducts() {
    try{
        // fetch ke 4 alamay katerogi sekaligus
        const responses = await Promise.all(
            CATEGORIES.map(cat => fetch(`https://dummyjson.com/products/category/${cat}`))
        );

        // ubah response jadi data JSON
        const dataPerKategori = await Promise.all(
            responses.map(res => res.json())
        );

        // gabungkan  array produk dari 4 kategori jadi satu array besar
        allProducts = dataPerKategori.flatMap(data => data.products);

        // Tampilkan ke halaman
        renderProducts(allProducts);
        renderFlashSale(allProducts);  

        document.getElementById('loadingState').style.display = 'none';

    } 
    
    catch (error) {
        console.error('Gagal memuat produk:', error);
    }
}
    
function renderProducts(products) {
    const grid = document.getElementById('productGrid');

     grid.innerHTML = products.map(product => `
        <div class="product-card">
            <img src="${product.thumbnail}" alt="${product.title}">
            <h3>${product.title}</h3>
            <p>Kategori: ${product.category}</p>
            <p>Harga: $${product.price}</p>
            <p>Rating: ⭐ ${product.rating}</p>
            <p>Diskon: ${product.discountPercentage}%</p>
        </div>
    `).join('');
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
    const query = document.getElementById('searchInput').value.toLowerCase().trim();

    const filtered = allProducts.filter(product =>
        product.title.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
    );

    renderProducts(filtered);
}

// Bungkus handleSearch pakai debounce, tunda 400ms
const debouncedSearch = debounce(handleSearch, 400);

function renderFlashSale(products) {
    // ambil produk dengan diskon 15% ke atas
    const flashProducts = products.filter(product => product.discountPercentage >= 15);

    const flashContainer = document.getElementById('flashScroll');

    flashContainer.innerHTML = flashProducts.map(product => `
        <div class="product-card">
            <img src="${product.thumbnail}" alt="${product.title}">
            <h3>${product.title}</h3>
            <p>Kategori: ${product.category}</p>
            <p>Harga: $${product.price}</p>
            <p>Diskon: ${product.discountPercentage}%</p>
        </div>
    `).join('');
}