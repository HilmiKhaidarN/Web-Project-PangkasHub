const API_URL = '/api';

let currentAdmin = null;
let searchTimeout = null;

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
});

async function checkAuth() {
  try {
    const response = await fetch(`${API_URL}/auth/check`);
    const result = await response.json();
    
    if (result.success && result.authenticated) {
      currentAdmin = result.data;
      initializePage();
    }
  } catch (error) {
    console.error('Error checking auth:', error);
  }
}

function initializePage() {
  displayAdminInfo();
  setupEventListeners();
  loadAllBookings();
}

function displayAdminInfo() {
  const header = document.querySelector('header');
  const adminInfo = document.createElement('div');
  adminInfo.className = 'admin-info';
  adminInfo.innerHTML = `
    <span>Halo, ${currentAdmin.name}</span>
    <button class="btn btn-secondary btn-sm" onclick="handleLogout()">Logout</button>
  `;
  header.appendChild(adminInfo);
}

function setupEventListeners() {
  const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      const searchTerm = e.target.value.trim();
      if (searchTerm) {
        searchBookings(searchTerm);
      } else {
        loadAllBookings();
      }
    }, 500);
  });
}

async function loadAllBookings() {
  showLoading(true);
  
  try {
    const response = await fetch(`${API_URL}/bookings/all`);
    const result = await response.json();
    
    if (result.success) {
      displayBookings(result.data);
    }
  } catch (error) {
    console.error('Error loading bookings:', error);
    document.getElementById('bookingList').innerHTML = '<p>Gagal memuat data booking</p>';
  } finally {
    showLoading(false);
  }
}

async function searchBookings(searchTerm) {
  showLoading(true);
  
  try {
    const response = await fetch(`${API_URL}/bookings/all?search=${encodeURIComponent(searchTerm)}`);
    const result = await response.json();
    
    if (result.success) {
      displayBookings(result.data);
    }
  } catch (error) {
    console.error('Error searching bookings:', error);
    document.getElementById('bookingList').innerHTML = '<p>Gagal mencari data booking</p>';
  } finally {
    showLoading(false);
  }
}

function displayBookings(bookings) {
  const container = document.getElementById('bookingList');
  
  if (bookings.length === 0) {
    container.innerHTML = '<p class="text-muted">Tidak ada booking ditemukan</p>';
    return;
  }
  
  container.innerHTML = '';
  bookings.forEach(booking => {
    const card = createBookingCard(booking);
    container.appendChild(card);
  });
}

function createBookingCard(booking) {
  const card = document.createElement('div');
  card.className = 'booking-card';
  
  const statusClass = `status-${booking.status}`;
  const statusText = {
    pending: 'Menunggu',
    confirmed: 'Dikonfirmasi',
    completed: 'Selesai',
    cancelled: 'Dibatalkan'
  }[booking.status];
  
  const bookingDate = new Date(booking.booking_date);
  const formattedDate = bookingDate.toLocaleDateString('id-ID', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  card.innerHTML = `
    <div class="booking-header">
      <div>
        <div class="booking-date">${formattedDate}</div>
        <div class="booking-time">${formatTime(booking.booking_time)}</div>
      </div>
      <span class="status-badge ${statusClass}">${statusText}</span>
    </div>
    <div class="booking-details">
      <div class="booking-detail">
        <strong>Pelanggan:</strong>
        <span>${booking.customer_name} (${booking.customer_phone})</span>
      </div>
      <div class="booking-detail">
        <strong>Layanan:</strong>
        <span>${booking.service_name} - Rp ${formatPrice(booking.price)}</span>
      </div>
      <div class="booking-detail">
        <strong>Barber:</strong>
        <span>${booking.barber_name || 'Acak'}</span>
      </div>
      <div class="booking-detail">
        <strong>Durasi:</strong>
        <span>${booking.duration} menit</span>
      </div>
      ${booking.notes ? `
      <div class="booking-detail">
        <strong>Catatan:</strong>
        <span>${booking.notes}</span>
      </div>
      ` : ''}
    </div>
    <div class="booking-actions">
      ${booking.status === 'pending' ? `
        <button class="btn btn-success" onclick="updateStatus(${booking.id}, 'confirmed')">Konfirmasi</button>
      ` : ''}
      ${booking.status === 'confirmed' ? `
        <button class="btn btn-warning" onclick="updateStatus(${booking.id}, 'completed')">Selesai</button>
      ` : ''}
      ${booking.status !== 'cancelled' && booking.status !== 'completed' ? `
        <button class="btn btn-danger" onclick="updateStatus(${booking.id}, 'cancelled')">Batalkan</button>
      ` : ''}
    </div>
  `;
  
  return card;
}

async function updateStatus(bookingId, status) {
  const confirmText = {
    confirmed: 'Konfirmasi booking ini?',
    completed: 'Tandai booking ini sebagai selesai?',
    cancelled: 'Batalkan booking ini?'
  }[status];
  
  if (!confirm(confirmText)) return;
  
  try {
    const response = await fetch(`${API_URL}/bookings/${bookingId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    
    const result = await response.json();
    
    if (result.success) {
      loadAllBookings();
    } else {
      alert(result.message || 'Gagal mengupdate status');
    }
  } catch (error) {
    console.error('Error updating status:', error);
    alert('Terjadi kesalahan. Silakan coba lagi.');
  }
}

async function handleLogout() {
  if (!confirm('Yakin ingin logout?')) return;
  
  try {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST'
    });
    
    const result = await response.json();
    
    if (result.success) {
      window.location.href = '/login';
    }
  } catch (error) {
    console.error('Error during logout:', error);
    alert('Gagal logout. Silakan coba lagi.');
  }
}

function showLoading(show) {
  document.getElementById('loadingIndicator').style.display = show ? 'block' : 'none';
}

function formatTime(time) {
  return time.substring(0, 5);
}

function formatPrice(price) {
  return new Intl.NumberFormat('id-ID').format(price);
}
