const API_URL = '/api';

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  setupEventListeners();
});

function setupEventListeners() {
  document.getElementById('registerForm').addEventListener('submit', handleRegister);
}

async function checkAuth() {
  try {
    const response = await fetch(`${API_URL}/customer-auth/check`);
    const result = await response.json();
    
    if (result.success && result.authenticated) {
      window.location.href = '/';
    }
  } catch (error) {
    console.error('Error checking auth:', error);
  }
}

async function handleRegister(e) {
  e.preventDefault();
  
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  
  if (password !== confirmPassword) {
    showMessage('Password dan konfirmasi password tidak sama', 'error');
    return;
  }
  
  const registerBtn = document.getElementById('registerBtn');
  const btnText = document.getElementById('btnText');
  const btnLoader = document.getElementById('btnLoader');
  
  registerBtn.disabled = true;
  btnText.style.display = 'none';
  btnLoader.style.display = 'block';
  
  const formData = {
    name: document.getElementById('name').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    email: document.getElementById('email').value.trim() || null,
    password: password
  };
  
  try {
    const response = await fetch(`${API_URL}/customer-auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      showMessage('Registrasi berhasil! Mengalihkan ke halaman login...', 'success');
      setTimeout(() => {
        window.location.href = '/customer-login?registered=true';
      }, 1500);
    } else {
      showMessage(result.message || 'Registrasi gagal', 'error');
      registerBtn.disabled = false;
      btnText.style.display = 'inline';
      btnLoader.style.display = 'none';
    }
  } catch (error) {
    console.error('Error during registration:', error);
    showMessage('Terjadi kesalahan. Silakan coba lagi.', 'error');
    registerBtn.disabled = false;
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
