
document.addEventListener('DOMContentLoaded', () => {
  
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('loginBtn');
    const btnText = document.getElementById('btnText');
    const loadingIndicator = document.getElementById('loading');
    const errorMessage = document.getElementById('errorMessage');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); 

        errorMessage.style.display = 'none';
        errorMessage.textContent = '';
        loginBtn.disabled = true;
        btnText.textContent = 'Memverifikasi...';
        loadingIndicator.style.display = 'inline-block';

        const inputUsername = usernameInput.value.trim();
        const inputPassword = passwordInput.value.trim();

        try {
            const response = await fetch('https://dummyjson.com/users');

            if (!response.ok) {
                throw new Error('Gagal terhubung ke API Users.');
            }

            const data = await response.json();
            const users = data.users;

            const validUser = users.find(
                (u) => u.username === inputUsername && u.password === inputPassword
            );

            if (validUser) {
                localStorage.setItem('firstName', validUser.firstName);
                window.location.href = 'index.html'; 
            } else {
                throw new Error('Username atau password yang Anda masukkan salah.');
            }

        } catch (error) {
            
            errorMessage.textContent = error.message;
            errorMessage.style.display = 'block';
        } finally {
           
            loginBtn.disabled = false;
            btnText.textContent = 'Masuk';
            loadingIndicator.style.display = 'none';
        }
    });
});