const API_URL = '/api';
let editMode = false;

document.addEventListener('DOMContentLoaded', () => {
  loadServices();
  document.getElementById('serviceForm').addEventListener('submit', handleSubmit);
});

async function loadServices() {
  try {
    const response = await fetch(`${API_URL}/manage-services`);
    const result = await response.json();
    
    if (result.success) {
      displayServices(result.data);
    }
  } catch (error) {
    console.error('Error loading services:', error);
  }
}

function displayServices(services) {
  const container = document.getElementById('serviceList');
  
  if (services.length === 0) {
    container.innerHTML = '<p class="text-muted">Belum ada layanan</p>';
    return;
  }
  
  container.innerHTML = services.map(service => `
    <div class="service-item">
      <div class="service-header">
        <div>
          <strong>${service.name}</strong><br>
          <small>${service.description || '-'}</small>
        </div>
        <div class="service-actions">
          <button class="btn btn-sm btn-secondary" onclick='editService(${JSON.stringify(service)})'>Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteService(${service.id}, '${service.name}')">Hapus</button>
        </div>
      </div>
      <div style="margin-top:10px;">
        <span style="background:#667eea;color:white;padding:4px 8px;border-radius:4px;font-size:12px;margin-right:5px;">
          ${service.duration} menit
        </span>
        <span style="background:#28a745;color:white;padding:4px 8px;border-radius:4px;font-size:12px;">
          Rp ${formatPrice(service.price)}
        </span>
      </div>
    </div>
  `).join('');
}

async function handleSubmit(e) {
  e.preventDefault();
  
  const id = document.getElementById('serviceId').value;
  const name = document.getElementById('serviceName').value.trim();
  const description = document.getElementById('serviceDescription').value.trim();
  const duration = parseInt(document.getElementById('serviceDuration').value);
  const price = parseFloat(document.getElementById('servicePrice').value);
  
  const url = editMode ? `${API_URL}/manage-services/${id}` : `${API_URL}/manage-services`;
  const method = editMode ? 'PUT' : 'POST';
  
  try {
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, duration, price })
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert(result.message);
      resetForm();
      loadServices();
    } else {
      alert(result.message);
    }
  } catch (error) {
    console.error('Error saving service:', error);
    alert('Terjadi kesalahan');
  }
}

function editService(service) {
  editMode = true;
  document.getElementById('formTitle').textContent = 'Edit Layanan';
  document.getElementById('serviceId').value = service.id;
  document.getElementById('serviceName').value = service.name;
  document.getElementById('serviceDescription').value = service.description || '';
  document.getElementById('serviceDuration').value = service.duration;
  document.getElementById('servicePrice').value = service.price;
  document.getElementById('submitBtn').textContent = 'Update';
  document.getElementById('cancelBtn').style.display = 'inline-block';
}

async function deleteService(id, name) {
  if (!confirm(`Hapus layanan ${name}?`)) return;
  
  try {
    const response = await fetch(`${API_URL}/manage-services/${id}`, {
      method: 'DELETE'
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert(result.message);
      loadServices();
    } else {
      alert(result.message);
    }
  } catch (error) {
    console.error('Error deleting service:', error);
    alert('Terjadi kesalahan');
  }
}

function resetForm() {
  editMode = false;
  document.getElementById('formTitle').textContent = 'Tambah Layanan Baru';
  document.getElementById('serviceForm').reset();
  document.getElementById('serviceId').value = '';
  document.getElementById('submitBtn').textContent = 'Simpan';
  document.getElementById('cancelBtn').style.display = 'none';
}

function formatPrice(price) {
  return new Intl.NumberFormat('id-ID').format(price);
}
