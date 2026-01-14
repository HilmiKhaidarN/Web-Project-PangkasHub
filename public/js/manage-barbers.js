const API_URL = '/api';
let editMode = false;

document.addEventListener('DOMContentLoaded', () => {
  loadBarbers();
  document.getElementById('barberForm').addEventListener('submit', handleSubmit);
});

async function loadBarbers() {
  try {
    const response = await fetch(`${API_URL}/manage-barbers`);
    const result = await response.json();
    
    if (result.success) {
      displayBarbers(result.data);
    }
  } catch (error) {
    console.error('Error loading barbers:', error);
  }
}

function displayBarbers(barbers) {
  const container = document.getElementById('barberList');
  
  if (barbers.length === 0) {
    container.innerHTML = '<p class="text-muted">Belum ada barber</p>';
    return;
  }
  
  container.innerHTML = barbers.map(barber => `
    <div class="barber-item">
      <div>
        <strong>${barber.name}</strong><br>
        <small>${barber.phone}</small>
      </div>
      <div class="barber-actions">
        <button class="btn btn-sm btn-secondary" onclick="editBarber(${barber.id}, '${barber.name}', '${barber.phone}')">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteBarber(${barber.id}, '${barber.name}')">Hapus</button>
      </div>
    </div>
  `).join('');
}

async function handleSubmit(e) {
  e.preventDefault();
  
  const id = document.getElementById('barberId').value;
  const name = document.getElementById('barberName').value.trim();
  const phone = document.getElementById('barberPhone').value.trim();
  
  const url = editMode ? `${API_URL}/manage-barbers/${id}` : `${API_URL}/manage-barbers`;
  const method = editMode ? 'PUT' : 'POST';
  
  try {
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone })
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert(result.message);
      resetForm();
      loadBarbers();
    } else {
      alert(result.message);
    }
  } catch (error) {
    console.error('Error saving barber:', error);
    alert('Terjadi kesalahan');
  }
}

function editBarber(id, name, phone) {
  editMode = true;
  document.getElementById('formTitle').textContent = 'Edit Barber';
  document.getElementById('barberId').value = id;
  document.getElementById('barberName').value = name;
  document.getElementById('barberPhone').value = phone;
  document.getElementById('submitBtn').textContent = 'Update';
  document.getElementById('cancelBtn').style.display = 'inline-block';
}

async function deleteBarber(id, name) {
  if (!confirm(`Hapus barber ${name}?`)) return;
  
  try {
    const response = await fetch(`${API_URL}/manage-barbers/${id}`, {
      method: 'DELETE'
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert(result.message);
      loadBarbers();
    } else {
      alert(result.message);
    }
  } catch (error) {
    console.error('Error deleting barber:', error);
    alert('Terjadi kesalahan');
  }
}

function resetForm() {
  editMode = false;
  document.getElementById('formTitle').textContent = 'Tambah Barber Baru';
  document.getElementById('barberForm').reset();
  document.getElementById('barberId').value = '';
  document.getElementById('submitBtn').textContent = 'Simpan';
  document.getElementById('cancelBtn').style.display = 'none';
}
