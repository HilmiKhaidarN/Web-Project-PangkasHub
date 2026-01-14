const API_URL = '/api';

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  setupEventListeners();
});

function setupEventListeners() {
  document.getElementById('loginForm').addEventListener('submit', handleLogin);
}

async function checkAuth() {
  try {
    const response = await fetch(`${API_URL}/auth/check`);
    const result = await response.json();
    
    if (result.success && result.authenticated) {
      window.location.href = '/admin';
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
    username: document.getElementById('username').value.trim(),
    password: document.getElementById('password').value
  };
  
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      showMessage('Login berhasil! Mengalihkan...', 'success');
      setTimeout(() => {
        window.location.href = '/admin';
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
