<template>
  <div class="full-card">
    <h2>บันทึกการเปลี่ยน Config</h2>

    <form class="log-form" @submit.prevent="handleSubmit">
      <div class="form-group">
        <label>ประเภทการเปลี่ยน</label>
        <select v-model="form.type" required>
          <option disabled value="">-- เลือกประเภท --</option>
          <option>Firewall</option>
          <option>Switch</option>
          <option>Router</option>
          <option>Other</option>
        </select>
      </div>

      <div class="form-group">
        <label>ชื่อผู้ดำเนินการ</label>
        <input v-model="form.operator" type="text" required />
      </div>

      <div class="form-group">
        <label>วันที่</label>
        <input v-model="form.date" type="date" required />
      </div>

      <div class="form-group">
        <label>เวลาเริ่ม</label>
        <input v-model="form.time_start" type="time" required />
      </div>

      <div class="form-group">
        <label>เวลาสิ้นสุด</label>
        <input v-model="form.time_end" type="time" required />
      </div>

      <div class="form-group wide">
        <label>รายละเอียดเพิ่มเติม (Note)</label>
        <textarea
          v-model="form.note"
          rows="3"
          placeholder="รายละเอียดเพิ่มเติม เช่น เปลี่ยน config interface eth0 เป็นต้น"
        ></textarea>
      </div>

      <div class="form-group">
        <label>ไฟล์ก่อนทำ</label>
        <input
          type="file"
          @change="e => (form.file_before = e.target.files[0])"
          required
        />
      </div>

      <div class="form-group">
        <label>ไฟล์หลังทำ</label>
        <input
          type="file"
          @change="e => (form.file_after = e.target.files[0])"
          required
        />
      </div>

      <div class="form-actions">
        <button type="submit" class="import-btn">บันทึก</button>
      </div>
    </form>

    <table class="policy-table">
      <thead>
        <tr>
          <th>No</th>
          <th>ประเภท</th>
          <th>ชื่อผู้ดำเนินการ</th>
          <th>วันที่</th>
          <th>เวลา</th>
          <th>รายละเอียด</th>
          <th>ไฟล์ก่อน</th>
          <th>ไฟล์หลัง</th>
          <th>Compare</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(log, index) in logs" :key="log.id">
          <td>{{ index + 1 }}</td>
          <td>{{ log.type || '-' }}</td>
          <td>{{ log.operator }}</td>
          <td>{{ formatDate(log.date) }}</td>
          <td>{{ log.time_start }} - {{ log.time_end }}</td>
          <td>{{ log.note || '-' }}</td>
          <td>
            <button
              class="download-btn"
              @click="downloadFile(log.id, 'before')"
            >
              Download
            </button>
          </td>
          <td>
            <button
              class="download-btn"
              @click="downloadFile(log.id, 'after')"
            >
              Download
            </button>
          </td>
          <td>
            <router-link
              v-if="canCompare(log)"
              :to="`/compare-change-security-team/${log.id}`"
            >
              <button class="compare-btn">Compare</button>
            </router-link>
            <span v-else style="color: #888; font-size: 12px;">-</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

// ฟังก์ชันช่วยดึง token
const getToken = () => {
  return localStorage.getItem("token") || "";
};


const form = ref({
  type: "",
  operator: "",
  date: "",
  time_start: "",
  time_end: "",
  note: "",
  file_before: null,
  file_after: null,
});

const logs = ref([]);

// ฟังก์ชันช่วยตรวจสอบนามสกุลไฟล์ หรือ mime type image
function isSupportedFile(filename, mimeType) {
  if (!filename) return false;
  const ext = filename.split(".").pop().toLowerCase();
  const supportedExt = ["txt", "csv", "conf"];
  if (supportedExt.includes(ext)) return true;
  if (mimeType && mimeType.startsWith("image/")) return true;
  return false;
}

// เช็คว่าไฟล์ก่อนและหลังรองรับการ compare หรือไม่
function canCompare(log) {
  // backend ควรส่งชื่อไฟล์และ mime type ในแต่ละ log ด้วย เช่น
  // log.file_before_name, log.file_before_type, log.file_after_name, log.file_after_type
  return (
    isSupportedFile(log.file_before_name, log.file_before_type) &&
    isSupportedFile(log.file_after_name, log.file_after_type)
  );
}

async function handleSubmit() {
  const formData = new FormData();
  formData.append("type", form.value.type);
  formData.append("operator", form.value.operator);
  formData.append("date", form.value.date);
  formData.append("time_start", form.value.time_start);
  formData.append("time_end", form.value.time_end);
  formData.append("note", form.value.note);
  formData.append("file_before", form.value.file_before);
  formData.append("file_after", form.value.file_after);

  try {
    const token = getToken(); // ดึง token
    const res = await fetch("http://127.0.0.1:3000/change", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`, // ใส่ token ใน headers
      },
      body: formData,
    });
    if (!res.ok) throw new Error("Upload failed");
    alert("บันทึกเรียบร้อย");
    resetForm();
    await fetchLogs();
  } catch (error) {
    alert(error.message);
  }
}

async function fetchLogs() {
  try {
    const token = getToken(); // ดึง token
    const res = await fetch("http://127.0.0.1:3000/change", {
      headers: {
        Authorization: `Bearer ${token}`, // ใส่ token ใน headers
      },
    });
    const data = await res.json();
    logs.value = data;
  } catch (err) {
    console.error("load error", err);
  }
}

async function downloadFile(id, type) {
  try {
    const token = getToken(); // ดึง token
    const res = await fetch(`http://127.0.0.1:3000/change/${id}/file/${type}`, {
      headers: {
        Authorization: `Bearer ${token}`, // ใส่ token ใน headers
      },
    });
    if (!res.ok) throw new Error("ไม่สามารถดาวน์โหลดไฟล์ได้");

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type}_${id}`; // หรือเปลี่ยนชื่อไฟล์ตามต้องการ
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (err) {
    alert("ดาวน์โหลดไฟล์ล้มเหลว");
  }
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString();
}

function resetForm() {
  form.value = {
    type: "",
    operator: "",
    date: "",
    time_start: "",
    time_end: "",
    note: "",
    file_before: null,
    file_after: null,
  };
}

onMounted(() => {
  fetchLogs();
});
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
}

.log-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.wide {
  grid-column: 1 / -1; /* ✅ ทำให้ Note อยู่ล่างสุดเสมอ */
}

.form-group label {
  font-size: 13px;
  color: #555;
  margin-bottom: 4px;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 6px 10px;
  font-size: 13px;
  border: 1px solid #ccc;
  border-radius: 6px;
  resize: vertical;
}

.form-actions {
  grid-column: 1 / -1;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.import-btn {
  background-color: #1abc9c;
  color: white;
  border: none;
  padding: 8px 16px;
  font-size: 14px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s ease;
}

.import-btn:hover {
  background-color: #16a085;
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
  vertical-align: top;
}

.policy-table tr:hover {
  background-color: #f9f9f9;
}

.policy-table a {
  color: #3498db;
  text-decoration: none;
}

.policy-table a:hover {
  text-decoration: underline;
}

.download-btn {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: background-color 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.download-btn:hover {
  background-color: #2980b9;
}

.download-btn:active {
  background-color: #2471a3;
}

.compare-btn {
  background-color: #08b55e;
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: background-color 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.compare-btn:hover {
  background-color: #28c30d;
}

.compare-btn:active {
  background-color: #1a8b06;
}
</style>
