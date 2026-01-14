const API_URL = '/api';

let selectedTimeSlot = null;
let services = [];
let barbers = [];
let currentCustomer = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  checkCustomerAuth();
});

async function checkCustomerAuth() {
  try {
    const response = await fetch(`${API_URL}/customer-auth/check`);
    const result = await response.json();
    
    if (result.success && result.authenticated) {
      currentCustomer = result.data;
      displayCustomerInfo();
      initializeBookingForm();
    }
  } catch (error) {
    console.error('Error checking auth:', error);
  }
}

function initializeBookingForm() {
  // Load data dan setup
  loadServices();
  loadBarbers();
  setupEventListeners();
  setMinDate();
  prefillCustomerData();
}

function displayCustomerInfo() {
  const header = document.querySelector('header');
  const customerInfo = document.createElement('div');
  customerInfo.className = 'customer-info';
  customerInfo.innerHTML = `
    <span>Halo, ${currentCustomer.name}</span>
    <div class="customer-actions">
      <a href="/my-bookings" class="btn btn-secondary btn-sm">Booking Saya</a>
      <button class="btn btn-secondary btn-sm" onclick="handleCustomerLogout()">Logout</button>
    </div>
  `;
  header.appendChild(customerInfo);
}



function prefillCustomerData() {
  if (currentCustomer) {
    const nameInput = document.getElementById('customerName');
    const phoneInput = document.getElementById('customerPhone');
    
    nameInput.value = currentCustomer.name;
    phoneInput.value = currentCustomer.phone;
    nameInput.readOnly = true;
    phoneInput.readOnly = true;
    
    // Tambahkan styling untuk readonly
    nameInput.style.backgroundColor = '#f5f5f5';
    phoneInput.style.backgroundColor = '#f5f5f5';
  }
}

async function handleCustomerLogout() {
  if (!confirm('Yakin ingin logout?')) return;
  
  try {
    const response = await fetch(`${API_URL}/customer-auth/logout`, {
      method: 'POST'
    });
    
    const result = await response.json();
    
    if (result.success) {
      window.location.reload();
    }
  } catch (error) {
    console.error('Error during logout:', error);
    alert('Gagal logout. Silakan coba lagi.');
  }
}

function setMinDate() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('bookingDate').min = today;
}

function setupEventListeners() {
  document.getElementById('bookingDate').addEventListener('change', loadTimeSlots);
  document.getElementById('barber').addEventListener('change', loadTimeSlots);
  document.getElementById('bookingForm').addEventListener('submit', handleSubmit);
}

async function loadServices() {
  try {
    const response = await fetch(`${API_URL}/reviews/services`);
    const result = await response.json();
    
    if (result.success) {
      services = result.data;
      const select = document.getElementById('service');
      result.data.forEach(service => {
        const rating = service.average_rating ? `⭐ ${service.average_rating}` : 'Belum ada rating';
        const reviews = service.total_reviews ? `(${service.total_reviews} review)` : '';
        const option = document.createElement('option');
        option.value = service.id;
        option.textContent = `${service.name} - Rp ${formatPrice(service.price)} (${service.duration} menit) ${rating} ${reviews}`;
        select.appendChild(option);
      });
    }
  } catch (error) {
    console.error('Error loading services:', error);
    showMessage('Gagal memuat layanan', 'error');
  }
}

async function loadBarbers() {
  try {
    const response = await fetch(`${API_URL}/reviews/barbers`);
    const result = await response.json();
    
    if (result.success) {
      barbers = result.data;
      const select = document.getElementById('barber');
      result.data.forEach(barber => {
        const rating = barber.average_rating ? `⭐ ${barber.average_rating}` : 'Belum ada rating';
        const reviews = barber.total_reviews ? `(${barber.total_reviews} review)` : '';
        const option = document.createElement('option');
        option.value = barber.id;
        option.textContent = `${barber.name} ${rating} ${reviews}`;
        select.appendChild(option);
      });
    }
  } catch (error) {
    console.error('Error loading barbers:', error);
  }
}

async function loadTimeSlots() {
  const date = document.getElementById('bookingDate').value;
  const barberId = document.getElementById('barber').value;
  const container = document.getElementById('timeSlots');
  
  if (!date) {
    container.innerHTML = '<p class="text-muted">Pilih tanggal terlebih dahulu</p>';
    return;
  }
  
  container.innerHTML = '<div class="loader"></div>';
  selectedTimeSlot = null;
  
  try {
    const url = `${API_URL}/bookings/available-slots?date=${date}${barberId ? '&barber_id=' + barberId : ''}`;
    const response = await fetch(url);
    const result = await response.json();
    
    if (result.success) {
      container.innerHTML = '';
      result.data.forEach(slot => {
        const slotDiv = document.createElement('div');
        slotDiv.className = `time-slot ${slot.available ? '' : 'disabled'}`;
        slotDiv.textContent = slot.display;
        slotDiv.dataset.time = slot.time;
        
        if (slot.available) {
          slotDiv.addEventListener('click', () => selectTimeSlot(slotDiv, slot.time));
        }
        
        container.appendChild(slotDiv);
      });
    }
  } catch (error) {
    console.error('Error loading time slots:', error);
    container.innerHTML = '<p class="text-muted">Gagal memuat slot waktu</p>';
  }
}

function selectTimeSlot(element, time) {
  document.querySelectorAll('.time-slot').forEach(slot => {
    slot.classList.remove('selected');
  });
  element.classList.add('selected');
  selectedTimeSlot = time;
}

async function handleSubmit(e) {
  e.preventDefault();
  
  if (!selectedTimeSlot) {
    showMessage('Pilih waktu booking terlebih dahulu', 'error');
    return;
  }
  
  const submitBtn = document.getElementById('submitBtn');
  const btnText = document.getElementById('btnText');
  const btnLoader = document.getElementById('btnLoader');
  
  submitBtn.disabled = true;
  btnText.style.display = 'none';
  btnLoader.style.display = 'block';
  
  const formData = {
    customer_name: document.getElementById('customerName').value.trim(),
    customer_phone: document.getElementById('customerPhone').value.trim(),
    service_id: parseInt(document.getElementById('service').value),
    barber_id: document.getElementById('barber').value || null,
    booking_date: document.getElementById('bookingDate').value,
    booking_time: selectedTimeSlot,
    notes: document.getElementById('notes').value.trim()
  };
  
  try {
    const response = await fetch(`${API_URL}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    const result = await response.json();
    
    if (result.requireAuth) {
      showMessage('Sesi Anda telah berakhir. Silakan login kembali.', 'error');
      setTimeout(() => {
        window.location.href = '/customer-login?redirect=booking';
      }, 2000);
      return;
    }
    
    if (result.success) {
      showMessage('Booking berhasil dibuat! Terima kasih.', 'success');
      setTimeout(() => {
        window.location.href = '/my-bookings';
      }, 1500);
    } else {
      showMessage(result.message || 'Gagal membuat booking', 'error');
      submitBtn.disabled = false;
      btnText.style.display = 'inline';
      btnLoader.style.display = 'none';
    }
  } catch (error) {
    console.error('Error creating booking:', error);
    showMessage('Terjadi kesalahan. Silakan coba lagi.', 'error');
    submitBtn.disabled = false;
    btnText.style.display = 'inline';
    btnLoader.style.display = 'none';
  }
}

function showMessage(text, type) {
  const messageDiv = document.getElementById('message');
  messageDiv.textContent = text;
  messageDiv.className = `message ${type}`;
  messageDiv.style.display = 'block';
  
  setTimeout(() => {
    messageDiv.style.display = 'none';
  }, 5000);
}

function formatPrice(price) {
  return new Intl.NumberFormat('id-ID').format(price);
}
