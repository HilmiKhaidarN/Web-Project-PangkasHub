const API_URL = '/api';

let currentCustomer = null;

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
});

async function checkAuth() {
  try {
    const response = await fetch(`${API_URL}/customer-auth/check`);
    const result = await response.json();
    
    if (result.success && result.authenticated) {
      currentCustomer = result.data;
      initializeDashboard();
    }
  } catch (error) {
    console.error('Error checking auth:', error);
  }
}

function initializeDashboard() {
  displayCustomerInfo();
  loadMyBookings();
  
  // Auto refresh setiap 30 detik
  setInterval(() => {
    loadMyBookings();
  }, 30000);
}

function displayCustomerInfo() {
  const header = document.querySelector('header');
  const customerInfo = document.createElement('div');
  customerInfo.className = 'customer-info';
  customerInfo.innerHTML = `
    <span>Halo, ${currentCustomer.name}</span>
    <button class="btn btn-secondary btn-sm" onclick="handleLogout()">Logout</button>
  `;
  header.appendChild(customerInfo);
}

async function loadMyBookings() {
  showLoading(true);
  
  try {
    const response = await fetch(`${API_URL}/bookings/my-bookings`);
    const result = await response.json();
    
    if (result.requireAuth) {
      window.location.href = '/customer-login';
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
    container.innerHTML = '<p class="text-muted">Anda belum memiliki booking</p>';
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
    pending: 'Menunggu Konfirmasi',
    confirmed: 'Dikonfirmasi',
    completed: 'Selesai',
    cancelled: 'Dibatalkan'
  }[booking.status] || 'Tidak Diketahui';
  
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
        <strong>Layanan:</strong>
        <span>${booking.service_name}</span>
      </div>
      <div class="booking-detail">
        <strong>Harga:</strong>
        <span>Rp ${formatPrice(booking.price)}</span>
      </div>
      <div class="booking-detail">
        <strong>Durasi:</strong>
        <span>${booking.duration} menit</span>
      </div>
      <div class="booking-detail">
        <strong>Barber:</strong>
        <span>${booking.barber_name || 'Acak'}</span>
      </div>
      ${booking.notes ? `
      <div class="booking-detail">
        <strong>Catatan:</strong>
        <span>${booking.notes}</span>
      </div>
      ` : ''}
    </div>
    ${booking.status === 'completed' ? `
    <div class="booking-actions">
      <button class="btn btn-warning" onclick="openReviewModal(${booking.id}, '${booking.service_name}', '${booking.barber_name || 'Acak'}')">
        <i class="fas fa-star"></i> Beri Review
      </button>
    </div>
    ` : ''}
  `;
  
  return card;
}

// Review Modal Functions
function openReviewModal(bookingId, serviceName, barberName) {
  // Check if review already exists
  checkExistingReview(bookingId).then(exists => {
    if (exists) {
      alert('Anda sudah memberikan review untuk booking ini');
      return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'review-modal';
    modal.innerHTML = `
      <div class="review-modal-content">
        <div class="review-modal-header">
          <h3><i class="fas fa-star"></i> Beri Review</h3>
          <button class="close-modal" onclick="closeReviewModal()">&times;</button>
        </div>
        <div class="review-modal-body">
          <p><strong>Layanan:</strong> ${serviceName}</p>
          <p><strong>Barber:</strong> ${barberName}</p>
          
          <div class="form-group">
            <label>Rating *</label>
            <div class="star-rating">
              <i class="far fa-star" data-rating="1"></i>
              <i class="far fa-star" data-rating="2"></i>
              <i class="far fa-star" data-rating="3"></i>
              <i class="far fa-star" data-rating="4"></i>
              <i class="far fa-star" data-rating="5"></i>
            </div>
            <input type="hidden" id="reviewRating" value="0">
          </div>
          
          <div class="form-group">
            <label for="reviewText">Review (Opsional)</label>
            <textarea id="reviewText" rows="4" placeholder="Bagikan pengalaman Anda..."></textarea>
          </div>
          
          <button class="btn btn-primary" onclick="submitReview(${bookingId})">
            <i class="fas fa-paper-plane"></i> Kirim Review
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Setup star rating
    const stars = modal.querySelectorAll('.star-rating i');
    stars.forEach(star => {
      star.addEventListener('click', function() {
        const rating = this.dataset.rating;
        document.getElementById('reviewRating').value = rating;
        
        stars.forEach((s, index) => {
          if (index < rating) {
            s.className = 'fas fa-star';
          } else {
            s.className = 'far fa-star';
          }
        });
      });
      
      star.addEventListener('mouseenter', function() {
        const rating = this.dataset.rating;
        stars.forEach((s, index) => {
          if (index < rating) {
            s.className = 'fas fa-star';
          } else {
            s.className = 'far fa-star';
          }
        });
      });
    });
    
    modal.querySelector('.star-rating').addEventListener('mouseleave', function() {
      const currentRating = document.getElementById('reviewRating').value;
      stars.forEach((s, index) => {
        if (index < currentRating) {
          s.className = 'fas fa-star';
        } else {
          s.className = 'far fa-star';
        }
      });
    });
  });
}

function closeReviewModal() {
  const modal = document.querySelector('.review-modal');
  if (modal) {
    modal.remove();
  }
}

async function checkExistingReview(bookingId) {
  try {
    const response = await fetch(`${API_URL}/reviews/booking/${bookingId}`);
    const result = await response.json();
    return result.success;
  } catch (error) {
    return false;
  }
}

async function submitReview(bookingId) {
  const rating = parseInt(document.getElementById('reviewRating').value);
  const reviewText = document.getElementById('reviewText').value.trim();
  
  if (rating === 0) {
    alert('Pilih rating terlebih dahulu');
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        booking_id: bookingId,
        rating: rating,
        review_text: reviewText || null
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert('Review berhasil dikirim! Terima kasih atas feedback Anda.');
      closeReviewModal();
      loadMyBookings(); // Reload bookings
    } else {
      alert(result.message || 'Gagal mengirim review');
    }
  } catch (error) {
    console.error('Error submitting review:', error);
    alert('Terjadi kesalahan. Silakan coba lagi.');
  }
}

async function handleLogout() {
  if (!confirm('Yakin ingin logout?')) return;
  
  try {
    const response = await fetch(`${API_URL}/customer-auth/logout`, {
      method: 'POST'
    });
    
    const result = await response.json();
    
    if (result.success) {
      window.location.href = '/customer-login';
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
