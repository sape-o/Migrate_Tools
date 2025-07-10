<template>
  <div class="container">
    <!-- Control Panel -->
    <div class="card control-card">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="ค้นหา...ดิค้าบบบบ"
        class="search-box"
      />
      <span class="row-count">กรองได้: {{ filteredRows.length }} แถว</span>
      <button class="export-csv-btn" @click="exportCSVFile">Export CSV File</button>
      <button class="export-btn" @click="exportFilteredData">Export Filter</button>
      <button class="export-cli-btn" @click="exportCLI">Export Filter CLI</button>
      <button class="push-btn" @click="PushFilterCLI">Push Filter CLI</button>
    </div>

    <!-- Data Table -->
    <div class="card table-card">
      <div class="table-wrapper">
        <table class="csv-table" v-if="rows.length > 0">
          <thead>
            <tr>
              <th v-for="(header, i) in rows[0]" :key="i">{{ header }}</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, r) in filteredRows" :key="r">
              <td v-for="(cell, c) in row" :key="c">{{ cell }}</td>
              <td class="action-cell">
                <button class="cli-btn" @click="handleCLI(row)">CLI</button>
                <button class="push-btn" @click="Push">Push</button>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else>Loading CSV...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const rows = ref([])
const searchQuery = ref('')
const route = useRoute()

// ฟังก์ชันช่วยดึง token จาก localStorage
function getToken() {
  return localStorage.getItem('token')  // ดึง token จาก localStorage
}

// ฟังก์ชันเรียกข้อมูลไฟล์จาก backend
onMounted(async () => {
  const id = route.params.id
  try {
    const token = getToken()  // ดึง token จาก localStorage
    const res = await fetch(`http://localhost:3000/object/${id}`, {
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${token}`  // ใส่ token ใน header
      }
    })
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
    const csvText = await res.text()
    rows.value = parseCSV(csvText)
  } catch (err) {
    console.error('Error loading CSV:', err)
    alert('Error loading CSV: ' + err.message)
  }
})

function parseCSV(text) {
  const lines = text.trim().split('\n')
  return lines.map(line =>
    line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(cell =>
      cell.replace(/^"|"$/g, '').trim()
    )
  )
}

const filteredRows = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return rows.value.slice(1)
  return rows.value.slice(1).filter(row =>
    row.some(cell => cell.toLowerCase().includes(q))
  )
})

function getDateString() {
  const now = new Date()
  const pad = n => n.toString().padStart(2, '0')
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
}

function triggerDownload(url, filename) {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function downloadText(text, prefix) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const filename = `${prefix}_${getDateString()}.txt`
  triggerDownload(url, filename)
}

function exportFilteredData() {
  const filtered = filteredRows.value
  if (filtered.length === 0) {
    alert('ไม่มีข้อมูลให้ Export')
    return
  }

  const lines = filtered.map(row => {
    let end = row.length
    while (end > 0 && row[end - 1].trim() === '') end--
    return row.slice(0, end).join(',')
  })

  downloadText(lines.join('\n'), 'Export-Service')
}

async function exportCSVFile() {
  try {
    const id = route.params.id
    const token = getToken()  // ดึง token จาก localStorage
    const res = await fetch(`http://localhost:3000/object/${id}`, {
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${token}`  // ใส่ token ใน header
      }
    })
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const filename = `Export-CSV-Address_${getDateString()}.csv`
    triggerDownload(url, filename)
  } catch (error) {
    alert('ไม่สามารถดาวน์โหลดไฟล์ CSV ได้: ' + error.message)
    console.error(error)
  }
}

function exportCLI() {
  const filtered = filteredRows.value
  if (filtered.length === 0) {
    alert('ไม่มีข้อมูลให้ Export CLI')
    return
  }

  const headers = rows.value[0]
  const nameIdx = headers.indexOf('Name')
  const protocolIdx = headers.indexOf('Protocol')
  const portIdx = headers.indexOf('Destination Port')

  if (nameIdx === -1 || protocolIdx === -1 || portIdx === -1) {
    alert('ไม่มีคอลัมน์ Name, Protocol หรือ Destination Port ในข้อมูล')
    return
  }

  let lines = ''
  filtered.forEach(row => {
    const name = row[nameIdx]
    const protocol = row[protocolIdx]
    const ports = (row[portIdx] || '').split(',').map(p => p.trim()).filter(p => p)
    ports.forEach(port => {
      lines += `add name ${name} Protocol ${protocol} port ${port}\n`
    })
  })

  downloadText(lines, 'Export-CLI')
}

function handleCLI(row) {
  const headers = rows.value[0]
  const rowData = {}
  headers.forEach((header, index) => {
    rowData[header] = row[index]
  })

  const name = rowData['Name']
  const protocol = rowData['Protocol']
  const destPortsRaw = rowData['Destination Port']
  if (!name || !protocol || !destPortsRaw) {
    alert('Missing required fields: Name / Protocol / Destination Port')
    return
  }

  const ports = destPortsRaw.split(',').map(p => p.trim()).filter(p => p)
  const message = ports.map(p => `add name ${name} Protocol ${protocol} port ${p}`).join('\n')
  alert(message)
}

function PushFilterCLI() {
  alert("This Function Not Available")
}
function Push() {
  alert("This Function Not Available")
}
</script>


<style scoped>
.container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  background: #fefefe;
  min-height: 100vh;
  box-sizing: border-box;
}

.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
  padding: 16px 20px;
}

.control-card {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.search-box {
  padding: 8px;
  width: 250px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
}

.row-count {
  font-size: 14px;
  color: #555;
}

.export-csv-btn {
  background-color: #9b59b6;
  color: white;
}
.export-btn {
  background-color: #2ecc71;
  color: white;
}
.export-cli-btn,
.cli-btn {
  background-color: #3498db;
  color: white;
}
.push-btn {
  background-color: #ff796b;
  color: white;
  opacity: 0.6;           
  cursor: not-allowed;  
}
.export-csv-btn,
.export-btn,
.export-cli-btn,
.push-btn,
.cli-btn {
  border: none;
  padding: 8px 14px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
.export-csv-btn:hover {
  background-color: #8e44ad;
}
.export-btn:hover {
  background-color: #27ae60;
}
.export-cli-btn:hover,
.cli-btn:hover {
  background-color: #2980b9;
}
.push-btn:hover {
  background-color: #ffbdb6;
}

.table-card {
  flex: 1;
  overflow: hidden;
}
.table-wrapper {
  overflow-x: auto;
  overflow-y: auto;
  max-height: 70vh;
}
.csv-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: 14px;
}
.csv-table th,
.csv-table td {
  padding: 10px 14px;
  text-align: left;
  white-space: normal;
  word-break: break-word;
  max-width: 180px;
  border: none;
}
.csv-table tbody tr:nth-child(odd) {
  background-color: #ffffff;
}
.csv-table tbody tr:nth-child(even) {
  background-color: #f9f9f9;
}
.csv-table tbody tr:hover {
  background-color: #e8f6ff;
  transition: background-color 0.2s ease-in-out;
}
.csv-table thead th {
  position: sticky;
  top: 0;
  background-color: #f0f0f0;
  font-weight: 600;
  z-index: 5;
}
.action-cell {
  display: flex;
  gap: 8px;
}
</style>
