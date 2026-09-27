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
});

const CATEGORIES = ['fragrances', 'beauty', 'furniture', 'groceries'];

