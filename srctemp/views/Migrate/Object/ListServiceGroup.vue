<template>
  <div class="container">
    <!-- Card Header: ช่องค้นหา + จำนวนแถว + ปุ่ม Export -->
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

    <!-- Card ตารางข้อมูล -->
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
              <td>
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
        Authorization: `Bearer ${token}`  // เพิ่ม token ใน header
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

function exportFilteredData() {
  const filtered = filteredRows.value
  if (filtered.length === 0) {
    alert('ไม่มีข้อมูลให้ Export')
    return
  }

  const lines = filtered.map(row => {
    let end = row.length
    while (end > 0 && row[end - 1].trim() === '') {
      end--
    }
    const trimmedRow = row.slice(0, end)
    return trimmedRow.join(',')
  })

  const csvText = lines.join('\n')

  const blob = new Blob([csvText], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  const now = new Date()
  const pad = (n) => n.toString().padStart(2, '0')
  const dateStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
  const filename = `Export-Service_${dateStr}.txt`
  link.href = url
  link.download = filename
  link.click()

  URL.revokeObjectURL(url)
}

async function exportCSVFile() {
  try {
    const id = route.params.id
    const token = getToken()  // ดึง token จาก localStorage
    const res = await fetch(`http://localhost:3000/object/${id}`, {
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${token}`  // เพิ่ม token ใน header
      }
    })
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)

    const blob = await res.blob()

    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    const now = new Date()
    const pad = (n) => n.toString().padStart(2, '0')
    const dateStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
    const filename = `Export-CSV-Service-Group_${dateStr}.csv`

    link.href = url
    link.download = filename
    link.click()

    URL.revokeObjectURL(url)
  } catch (error) {
    alert('ไม่สามารถดาวน์โหลดไฟล์ CSV ได้: ' + error.message)
    console.error(error)
  }
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

  let message = ''
  if (ports.length > 1) {
    for (let i = 0; i < ports.length; i++) {
      message += `add name ${name} Protocol ${protocol} port ${ports[i]}\n`
    }
  } else {
    message = `add name ${name} Protocol ${protocol} port ${ports[0]}`
  }

  alert(message)
}

function exportCLI() {
  const filtered = filteredRows.value
  if (filtered.length === 0) {
    alert('ไม่มีข้อมูลให้ Export CLI')
    return
  }

  const headers = rows.value[0]
  const nameIdx = headers.findIndex(h => h === 'Name')
  const protocolIdx = headers.findIndex(h => h === 'Protocol')
  const portIdx = headers.findIndex(h => h === 'Destination Port')

  if (nameIdx === -1 || protocolIdx === -1 || portIdx === -1) {
    alert('ไม่มีคอลัมน์ Name, Protocol หรือ Destination Port ในข้อมูล')
    return
  }

  let lines = ''
  filtered.forEach(row => {
    const name = row[nameIdx] || ''
    const protocol = row[protocolIdx] || ''
    const portsRaw = row[portIdx] || ''
    const ports = portsRaw.split(',').map(p => p.trim()).filter(p => p)
    if (name && protocol && ports.length) {
      if (ports.length > 1) {
        ports.forEach(port => {
          lines += `add name ${name} Protocol ${protocol} port ${port}\n`
        })
      } else {
        lines += `add name ${name} Protocol ${protocol} port ${ports[0]}\n`
      }
    }
  })

  if (!lines) {
    alert('ไม่มีข้อมูลสำหรับ export CLI')
    return
  }

  const blob = new Blob([lines], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  const now = new Date()
  const pad = (n) => n.toString().padStart(2, '0')
  const dateStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
  const filename = `Export-CLI-Service-Group_${dateStr}.txt`
  link.href = url
  link.download = filename
  link.click()

  URL.revokeObjectURL(url)
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
  height: 100vh;
  box-sizing: border-box;
}

/* Card Style */
.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  padding: 16px 20px;
}

/* Control Card: Search + Export + Count */
.control-card {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.search-box {
  padding: 8px;
  width: 300px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
}

.row-count {
  font-size: 14px;
  color: #555;
}

.export-btn {
  background-color: #2ecc71;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.export-btn:hover {
  background-color: #27ae60;
}

.export-cli-btn {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.export-cli-btn:hover {
  background-color: #2980b9;
}

/* Table Card */
.table-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.table-wrapper {
  overflow-y: auto;
  flex: 1;
}

/* ตาราง */
.csv-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.csv-table th,
.csv-table td {
  padding: 8px 12px;
  border: 1px solid #ddd;
  text-align: left;
  white-space: normal;
  word-break: break-word;
  max-width: 180px;
  background: white;
}

/* sticky header */
.csv-table thead th {
  position: sticky;
  top: 0;
  background-color: #f4f4f4;
  font-weight: 600;
  z-index: 5;
}

.cli-btn {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  margin-right: 6px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.cli-btn:hover {
  background-color: #2980b9;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
}

.push-btn {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: not-allowed;
  opacity: 0.6;
}
.export-csv-btn {
  background-color: #9b59b6;
  color: white;
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
</style>
