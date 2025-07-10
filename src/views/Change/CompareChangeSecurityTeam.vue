<template>
  <div class="compare-container">
    <h2>เปรียบเทียบไฟล์</h2>
    <div class="file-contents">
      <!-- BEFORE -->
      <div>
        <h3>Before</h3>
        <template v-if="isImage(content.before_mime)">
          <img :src="asBase64(content.before, content.before_mime)" class="preview-img" />
        </template>
        <template v-else-if="isText(content.before_mime)">
          <div class="lined-text">
            <div class="line" v-for="(line, index) in getLines(content.before)" :key="index">
              <span class="line-number">{{ index + 1 }}</span>
              <span class="line-content">{{ line }}</span>
            </div>
          </div>
        </template>
        <template v-else>
          <p>ไม่สามารถแสดงไฟล์ประเภทนี้ได้</p>
        </template>
      </div>

      <!-- AFTER -->
      <div>
        <h3>After</h3>
        <template v-if="isImage(content.after_mime)">
          <img :src="asBase64(content.after, content.after_mime)" class="preview-img" />
        </template>
        <template v-else-if="isText(content.after_mime)">
          <div class="lined-text">
            <div class="line" v-for="(line, index) in getLines(content.after)" :key="index">
              <span class="line-number">{{ index + 1 }}</span>
              <span class="line-content">{{ line }}</span>
            </div>
          </div>
        </template>
        <template v-else>
          <p>ไม่สามารถแสดงไฟล์ประเภทนี้ได้</p>
        </template>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const content = ref({
  before: '',
  after: '',
  before_mime: '',
  after_mime: ''
})

const route = useRoute()

onMounted(async () => {
  const id = route.params.id
  const token = localStorage.getItem('token')  // ดึง token จาก localStorage
  const res = await fetch(`http://127.0.0.1:3000/change/${id}/compare`, {
    headers: {
      Authorization: `Bearer ${token}`  // ใส่ token ใน header
    }
  })
  const data = await res.json()
  content.value = data
})

function isImage(mime) {
  return mime && mime.startsWith('image/')
}

function isText(mime) {
  return mime === 'text/plain' || mime.includes('conf') || mime.includes('text/x-config')
}

function asBase64(base64, mime) {
  // ถ้า base64 มี data uri prefix มาแล้ว ให้ลบออกก่อน
  if (base64.startsWith('data:')) {
    return base64
  }
  return `data:${mime};base64,${base64}`
}

function getLines(text) {
  return text ? text.split('\n') : []
}
</script>


<style scoped>
.compare-container {
  padding: 20px;
}
.file-contents {
  display: flex;
  gap: 20px;
}
.file-contents > div {
  flex: 1;
  background: #f9f9f9;
  padding: 12px;
  border-radius: 8px;
}
pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}
.preview-img {
  max-width: 100%;
  max-height: 400px;
  border-radius: 8px;
  border: 1px solid #ccc;
}
</style>
