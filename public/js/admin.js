const API_URL = '/api';

let barbers = [];
let currentAdmin = null;
let socket = null;

// Initialize Socket.IO
function initializeSocket() {
  socket = io();
  
  socket.on('connect', () => {
    console.log('Connected to real-time server');
  });
  
  socket.on('newBooking', (data) => {
    showNotification(data.message, data.booking);
    playNotificationSound();
    loadStatistics();
    loadTodayBookings();
  });
  
  socket.on('bookingUpdated', (data) => {
    loadStatistics();
    loadTodayBookings();
  });
  
  socket.on('disconnect', () => {
    console.log('Disconnected from real-time server');
  });
}

function showNotification(message, booking) {
  const notification = document.createElement('div');
  notification.className = 'notification-badge';
  notification.innerHTML = `
    <strong><i class="fas fa-bell"></i> ${message}</strong>
    <small>${booking.service_name} - ${booking.booking_date} ${booking.booking_time.substring(0,5)}</small>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.5s ease';
    setTimeout(() => {
      notification.remove();
    }, 500);
  }, 5000);
}

function playNotificationSound() {
  // Create audio context for notification sound
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = 800;
  oscillator.type = 'sine';
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.5);
  
  // Second beep
  setTimeout(() => {
    const oscillator2 = audioContext.createOscillator();
    const gainNode2 = audioContext.createGain();
    
    oscillator2.connect(gainNode2);
    gainNode2.connect(audioContext.destination);
    
    oscillator2.frequency.value = 1000;
    oscillator2.type = 'sine';
    
    gainNode2.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator2.start(audioContext.currentTime);
    oscillator2.stop(audioContext.currentTime + 0.5);
  }, 200);
}

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
});

async function checkAuth() {
  try {
    const response = await fetch(`${API_URL}/auth/check`);
    const result = await response.json();
    
    if (result.success && result.authenticated) {
      currentAdmin = result.data;
      initializeDashboard();
    }
  } catch (error) {
    console.error('Error checking auth:', error);
  }
}

function initializeDashboard() {
  displayAdminInfo();
  loadStatistics();
  loadBarbers();
  setupEventListeners();
  loadTodayBookings();
  initializeSocket();
}

async function loadStatistics() {
  try {
    const response = await fetch(`${API_URL}/statistics/dashboard`);
    const result = await response.json();
    
    if (result.success) {
      displayStatistics(result.data);
    }
  } catch (error) {
    console.error('Error loading statistics:', error);
  }
}

function displayStatistics(stats) {
  const statsHTML = `
    <div class="stats-container">
      <div class="stat-card">
        <h3>Hari Ini</h3>
        <div class="stat-value">${stats.today.bookings}</div>
        <div class="stat-label">Booking</div>
        <div class="stat-revenue">Rp ${formatPrice(stats.today.revenue)}</div>
      </div>
      <div class="stat-card">
        <h3>Minggu Ini</h3>
        <div class="stat-value">${stats.week.bookings}</div>
        <div class="stat-label">Booking</div>
        <div class="stat-revenue">Rp ${formatPrice(stats.week.revenue)}</div>
      </div>
      <div class="stat-card">
        <h3>Bulan Ini</h3>
        <div class="stat-value">${stats.month.bookings}</div>
        <div class="stat-label">Booking</div>
        <div class="stat-revenue">Rp ${formatPrice(stats.month.revenue)}</div>
      </div>
    </div>
    
    <div class="top-lists">
      <div class="top-list">
        <h3><i class="fas fa-trophy"></i> Barber Terpopuler</h3>
        <ul>
          ${stats.topBarbers.map((b, i) => `<li>${i+1}. ${b.name} (${b.total_bookings} booking)</li>`).join('')}
        </ul>
      </div>
      <div class="top-list">
        <h3><i class="fas fa-star"></i> Layanan Terlaris</h3>
        <ul>
          ${stats.topServices.map((s, i) => `<li>${i+1}. ${s.name} (${s.total_bookings} booking)</li>`).join('')}
        </ul>
      </div>
    </div>
  `;
  
  const filterSection = document.querySelector('.filter-section');
  filterSection.insertAdjacentHTML('beforebegin', statsHTML);
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
  document.getElementById('filterBtn').addEventListener('click', filterBookings);
  document.getElementById('resetBtn').addEventListener('click', resetFilter);
}

async function loadBarbers() {
  try {
    const response = await fetch(`${API_URL}/barbers`);
    const result = await response.json();
    
    if (result.success) {
      barbers = result.data;
      const select = document.getElementById('filterBarber');
      result.data.forEach(barber => {
        const option = document.createElement('option');
        option.value = barber.id;
        option.textContent = barber.name;
        select.appendChild(option);
      });
    }
  } catch (error) {
    console.error('Error loading barbers:', error);
  }
}

function loadTodayBookings() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('filterDate').value = today;
  filterBookings();
}

async function filterBookings() {
  const date = document.getElementById('filterDate').value;
  const barberId = document.getElementById('filterBarber').value;
  
  if (!date) {
    alert('Pilih tanggal terlebih dahulu');
    return;
  }
  
  showLoading(true);
  
  try {
    const url = `${API_URL}/bookings?start_date=${date}&end_date=${date}${barberId ? '&barber_id=' + barberId : ''}`;
    const response = await fetch(url);
    const result = await response.json();
    
    if (result.requireAuth) {
      window.location.href = '/login';
      return;
    }
    
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

function displayBookings(bookings) {
  const container = document.getElementById('bookingList');
  
  if (bookings.length === 0) {
    container.innerHTML = '<p class="text-muted">Tidak ada booking untuk filter ini</p>';
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
  
  card.innerHTML = `
    <div class="booking-header">
      <div class="booking-time">${formatTime(booking.booking_time)}</div>
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
    
    if (result.requireAuth) {
      window.location.href = '/login';
      return;
    }
    
    if (result.success) {
      filterBookings();
    } else {
      alert(result.message || 'Gagal mengupdate status');
    }
  } catch (error) {
    console.error('Error updating status:', error);
    alert('Terjadi kesalahan. Silakan coba lagi.');
  }
}

function resetFilter() {
  document.getElementById('filterDate').value = '';
  document.getElementById('filterBarber').value = '';
  document.getElementById('bookingList').innerHTML = '';
  loadTodayBookings();
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
