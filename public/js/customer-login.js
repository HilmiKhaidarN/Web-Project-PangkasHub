const API_URL = '/api';

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  setupEventListeners();
  checkRegistrationSuccess();
});

function checkRegistrationSuccess() {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('registered') === 'true') {
    showMessage('Registrasi berhasil! Silakan login dengan akun Anda.', 'success');
  }
}

function setupEventListeners() {
  document.getElementById('customerLoginForm').addEventListener('submit', handleLogin);
}

async function checkAuth() {
  try {
    const response = await fetch(`${API_URL}/customer-auth/check`);
    const result = await response.json();
    
    if (result.success && result.authenticated) {
      // Jika sudah login, redirect ke booking
      window.location.href = '/';
    }
  } catch (error) {
    console.error('Error checking auth:', error);
  }
}

async function handleLogin(e) {
  e.preventDefault();
  
  const loginBtn = document.getElementById('loginBtn');
  const btnText = document.getElementById('btnText');
  const btnLoader = document.getElementById('btnLoader');
  
  loginBtn.disabled = true;
  btnText.style.display = 'none';
  btnLoader.style.display = 'block';
  
  const formData = {
    phone: document.getElementById('phone').value.trim(),
    password: document.getElementById('password').value
  };
  
  try {
    const response = await fetch(`${API_URL}/customer-auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      showMessage('Login berhasil! Mengalihkan...', 'success');
      setTimeout(() => {
        // Redirect ke halaman yang diminta atau ke booking
        const urlParams = new URLSearchParams(window.location.search);
        const redirect = urlParams.get('redirect');
        window.location.href = redirect === 'booking' ? '/' : '/';
      }, 1000);
    } else {
      showMessage(result.message || 'Login gagal', 'error');
      loginBtn.disabled = false;
      btnText.style.display = 'inline';
      btnLoader.style.display = 'none';
    }
  } catch (error) {
    console.error('Error during login:', error);
    showMessage('Terjadi kesalahan. Silakan coba lagi.', 'error');
    loginBtn.disabled = false;
    btnText.style.display = 'inline';
    btnLoader.style.display = 'none';
  }
}

function showMessage(text, type) {
  const messageDiv = document.getElementById('message');
  messageDiv.textContent = text;
  messageDiv.className = `message ${type}`;
  messageDiv.style.display = 'block';
}
