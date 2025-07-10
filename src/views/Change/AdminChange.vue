<template>
  <div class="full-card">
    <h2>คำขอเปลี่ยนแปลงที่รออนุมัติ</h2>

    <table class="policy-table">
      <thead>
        <tr>
          <th>No</th>
          <th>ประเภท</th>
          <th>อุปกรณ์</th>
          <th>ผู้ขอ</th>
          <th>วันที่</th>
          <th>เหตุผล</th>
          <th>สถานะ</th>
          <th>การจัดการ</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(req, index) in requests" :key="req.id">
          <td>{{ index + 1 }}</td>
          <td>{{ req.change_type }}</td>
          <td>{{ req.device_name }}</td>
          <td>{{ req.requester }}</td>
          <td>{{ formatDate(req.request_date) }}</td>
          <td>{{ req.reason }}</td>
          <td>
            <span :class="'status ' + req.status.toLowerCase()">{{ req.status }}</span>
          </td>
          <td>
            <div class="action-buttons">
              <button class="approve-btn" @click="handleAction(req.id, 'approve')">✔</button>
              <button class="reject-btn" @click="handleAction(req.id, 'reject')">✖</button>
              <button class="edit-btn" @click="editRequest(req)">✎</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const requests = ref([])

// ฟังก์ชันดึง token จาก localStorage
const getToken = () => {
  return localStorage.getItem('token') || ''
}

onMounted(() => {
  fetchRequests()
})

async function fetchRequests() {
  const token = getToken()
  const res = await fetch('http://127.0.0.1:3000/request', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  requests.value = await res.json()
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString()
}

async function handleAction(id, action) {
  const token = getToken()
  const res = await fetch(`http://127.0.0.1:3000/request/${id}/${action}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  if (res.ok) fetchRequests()
}

function editRequest(req) {
  alert(`Edit Request: ${req.id}`)
}
</script>


<style scoped>
.full-card {
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.05);
  width: 100%;
  box-sizing: border-box;
}

h2 {
  margin-bottom: 16px;
  font-size: 20px;
  font-weight: 600;
}

.policy-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.policy-table th,
.policy-table td {
  padding: 10px 12px;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

.policy-table tr:hover {
  background-color: #f9f9f9;
}

.status {
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: bold;
  color: white;
  text-transform: capitalize;
}

.status.pending {
  background-color: #f1c40f;
}

.status.approved {
  background-color: #2ecc71;
}

.status.rejected {
  background-color: #e74c3c;
}

.action-buttons {
  display: flex;
  gap: 6px;
}

.action-buttons button {
  padding: 6px 10px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  color: white;
  transition: background-color 0.2s ease;
}

.approve-btn {
  background-color: #2ecc71;
}

.reject-btn {
  background-color: #e74c3c;
}

.edit-btn {
  background-color: #3498db;
}
</style>
