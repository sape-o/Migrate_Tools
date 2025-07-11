<script setup>
import Sidebar from '../components/Sidebar.vue'
</script>

<template>
  <div class="layout">
      <Sidebar />
      <main class="main-content">
          <slot />
      </main>
    </div>
</template>

<style>
.layout {
  display: flex;
  min-height: 100vh;
  background-color: #f0f0f0;
  margin: 0;
  padding: 0;
  width: 100vw; /* เต็มความกว้าง viewport */
  box-sizing: border-box;
}

.sidebar {
  width: 240px;
  /* margin, padding ตามที่ต้องการ */
}

.main-content {
  flex: 1; /* ขยายเต็มพื้นที่ที่เหลือ */
  padding: 0; /* ลองลด padding เพื่อไม่ให้ card เล็กลง */
  margin: 0;
  box-sizing: border-box;
  display: flex;
  margin-top: 1%;
  margin-left: 1%;
  margin-right: 1%;
  justify-content: center; /* กึ่งกลางแนวนอน */
  align-items: flex-start; /* ชิดบน */
  min-height: 100vh;
}

</style>

