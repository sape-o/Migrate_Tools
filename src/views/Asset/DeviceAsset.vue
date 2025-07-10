<template>
  <div class="full-card">
    <button class="import-btn" @click="openAddModal">Add Asset</button>

    <table class="policy-table">
      <thead>
        <tr>
          <th>No</th>
          <th>Asset Tag</th>
          <th>Name</th>
          <th>Type</th>
          <th>Brand</th>
          <th>Model</th>
          <th>Serial Number</th>
          <th>Purchase Date</th>
          <th>Warranty Expiry</th>
          <th>Disposal Date</th>
          <th>Status</th>
          <th>Location</th>
          <th>PO ID</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(asset, index) in assets" :key="asset.id">
          <td>{{ index + 1 }}</td>
          <td>{{ asset.asset_tag }}</td>
          <td>{{ asset.name }}</td>
          <td>{{ asset.type || '-' }}</td>
          <td>{{ asset.brand || '-' }}</td>
          <td>{{ asset.model || '-' }}</td>
          <td>{{ asset.serial_number || '-' }}</td>
          <td>{{ formatDate(asset.purchase_date) }}</td>
          <td>{{ formatDate(asset.warranty_expiry) }}</td>
          <td>{{ formatDate(asset.disposal_date) }}</td>
          <td>{{ asset.status }}</td>
          <td>{{ asset.location || '-' }}</td>
          <td>{{ asset.po_id || '-' }}</td>
          <td>
            <button class="action-btn edit" @click="openEditModal(asset)">Edit</button>
            <button class="action-btn qr" @click="showQrCode(asset.id)">QR</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal Add/Edit -->
    <div v-if="showAddModal" class="modal-overlay">
      <div class="modal-content">
        <h3>{{ editAsset ? 'Edit Asset' : 'Add Asset' }}</h3>
        <form @submit.prevent="editAsset ? updateAsset() : addAsset()">
          <div class="form-grid">
            <div class="form-group" :class="{full: false}">
              <label>Asset Tag</label>
              <input v-model="form.asset_tag" :readonly="editAsset" required />
            </div>
            <div class="form-group" :class="{full: false}">
              <label>Name</label>
              <input v-model="form.name" required />
            </div>
            <div class="form-group" :class="{full: false}">
              <label>Type</label>
              <input v-model="form.type" />
            </div>
            <div class="form-group" :class="{full: false}">
              <label>Brand</label>
              <input v-model="form.brand" />
            </div>
            <div class="form-group" :class="{full: false}">
              <label>Model</label>
              <input v-model="form.model" />
            </div>
            <div class="form-group" :class="{full: false}">
              <label>Serial Number</label>
              <input v-model="form.serial_number" />
            </div>
            <div class="form-group" :class="{full: false}">
              <label>Purchase Date</label>
              <input type="date" v-model="form.purchase_date" />
            </div>
            <div class="form-group" :class="{full: false}">
              <label>Warranty Expiry</label>
              <input type="date" v-model="form.warranty_expiry" />
            </div>
            <div class="form-group" :class="{full: false}">
              <label>Disposal Date</label>
              <input type="date" v-model="form.disposal_date" />
            </div>
            <div class="form-group" :class="{full: false}">
              <label>Status</label>
              <select v-model="form.status" required>
                <option value="active">Active</option>
                <option value="disposed">Disposed</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
            <div class="form-group" :class="{full: false}">
              <label>Location</label>
              <input v-model="form.location" />
            </div>
            <div class="form-group" :class="{full: false}">
              <label>PO ID</label>
              <input type="number" v-model.number="form.po_id" />
            </div>
            <div class="form-group full">
              <label>Note</label>
              <textarea v-model="form.note"></textarea>
            </div>
            <div class="form-group full">
              <label>Image</label>
              <input type="file" @change="handleImageUpload" />
              <img v-if="imagePreview" :src="imagePreview" class="image-preview" />
            </div>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn green">{{ editAsset ? 'Update' : 'Add' }}</button>
            <button type="button" @click="closeModal" class="btn gray">Cancel</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal QR -->
    <div v-if="showQrModal" class="modal-overlay">
      <div class="modal-content" style="text-align:center;">
        <h3>QR Code</h3>
        <img :src="qrImageUrl" alt="QR Code" style="max-width:300px;" />
        <div class="form-actions" style="justify-content:center; margin-top:20px;">
          <button class="btn gray" @click="closeQrModal">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const assets = ref([])
const showAddModal = ref(false)
const editAsset = ref(null)
const imageFile = ref(null)
const imagePreview = ref(null)
const showQrModal = ref(false)
const qrImageUrl = ref(null)

const form = ref({
  asset_tag: '', name: '', type: '', brand: '', model: '',
  serial_number: '',
  status: 'active',
  purchase_date: '',
  warranty_expiry: '',
  disposal_date: '',
  location: '',
  po_id: null,
  note: ''
})

// ฟังก์ชันดึง token จาก localStorage หรือที่เก็บ token
const getToken = () => {
  return localStorage.getItem('token') || ''
}

onMounted(() => fetchAssets())

async function fetchAssets() {
  const token = getToken()
  const res = await fetch('http://127.0.0.1:3000/assets', {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  })
  const data = await res.json()
  assets.value = data
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString()
}

function openAddModal() {
  editAsset.value = null
  resetForm()
  showAddModal.value = true
}

function openEditModal(asset) {
  editAsset.value = asset
  form.value = { ...asset }
  imageFile.value = null
  imagePreview.value = null
  showAddModal.value = true
}

function closeModal() {
  editAsset.value = null
  resetForm()
  showAddModal.value = false
}

function resetForm() {
  form.value = {
    asset_tag: '', name: '', type: '', brand: '', model: '',
    serial_number: '',
    status: 'active',
    purchase_date: '',
    warranty_expiry: '',
    disposal_date: '',
    location: '',
    po_id: null,
    note: ''
  }
  imageFile.value = null
  imagePreview.value = null
}

function handleImageUpload(e) {
  const file = e.target.files[0]
  if (!file) return
  imageFile.value = file
  const reader = new FileReader()
  reader.onload = e => imagePreview.value = e.target.result
  reader.readAsDataURL(file)
}

async function addAsset() {
  const token = getToken()
  const formData = new FormData()
  for (const key in form.value) {
    if (form.value[key] !== null && form.value[key] !== undefined) {
      formData.append(key, form.value[key])
    }
  }
  if (imageFile.value) formData.append('image', imageFile.value)
  await fetch('http://127.0.0.1:3000/assets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData
  })
  await fetchAssets()
  closeModal()
}

async function updateAsset() {
  const token = getToken()
  const formData = new FormData()
  for (const key in form.value) {
    if (form.value[key] !== null && form.value[key] !== undefined) {
      formData.append(key, form.value[key])
    }
  }
  if (imageFile.value) formData.append('image', imageFile.value)
  await fetch(`http://127.0.0.1:3000/assets/${editAsset.value.id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData
  })
  await fetchAssets()
  closeModal()
}

async function showQrCode(id) {
  const token = getToken()
  const res = await fetch(`http://127.0.0.1:3000/assets/${id}/qrcode`, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  })
  const blob = await res.blob()
  qrImageUrl.value = URL.createObjectURL(blob)
  showQrModal.value = true
}

function closeQrModal() {
  showQrModal.value = false
  qrImageUrl.value = null
}
</script>


<style scoped>
.full-card {
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.05);
  width: 100%;
  height: calc(100vh - 40px);
  overflow-y: auto;
}
.import-btn {
  background: #1abc9c;
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 600;
  margin-bottom: 20px;
  cursor: pointer;
  border: none;
}
.policy-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
.policy-table th, .policy-table td {
  padding: 10px 12px;
  border-bottom: 1px solid #ddd;
  text-align: left;
}
.policy-table tr:hover {
  background-color: #f9f9f9;
}
.action-btn {
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  margin-right: 6px;
  font-size: 13px;
  border: none;
  color: white;
}
.action-btn.edit { background-color: #f39c12; }
.action-btn.qr { background-color: #3498db; }

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background: white;
  padding: 24px;
  border-radius: 12px;
  width: 720px;
  max-width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
.form-group.full {
  grid-column: span 2;
}
.form-group {
  display: flex;
  flex-direction: column;
}
.form-group label {
  font-weight: 600;
  margin-bottom: 6px;
}
.form-group input,
.form-group select,
.form-group textarea {
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  gap: 12px;
}
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}
.btn.green { background: #2ecc71; color: white; }
.btn.gray { background: #bdc3c7; color: black; }
.image-preview {
  max-width: 200px;
  margin-top: 8px;
}
</style>
