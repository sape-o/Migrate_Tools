<template>
  <div class="full-card">
    <h2>แบบฟอร์มขอเปลี่ยนแปลงอุปกรณ์</h2>

    <form class="log-form" @submit.prevent="submitRequest">
      <div class="form-group">
        <label>ชื่อผู้ร้องขอ</label>
        <input v-model="form.requester" type="text" required />
      </div>

      <div class="form-group">
        <label>อีเมลผู้ร้องขอ</label>
        <input v-model="form.email" type="email" required />
      </div>

      <div class="form-group">
        <label>วันที่ต้องการเปลี่ยน</label>
        <input v-model="form.date" type="date" required />
      </div>

      <div class="form-group wide">
        <label>รายละเอียดการเปลี่ยนแปลง</label>
        <textarea v-model="form.description" rows="3" required></textarea>
      </div>

      <div class="form-group wide">
        <label>เหตุผลในการเปลี่ยน</label>
        <textarea v-model="form.reason" rows="2" required></textarea>
      </div>

      <div class="form-group wide">
        <label>ผลกระทบที่อาจเกิดขึ้น</label>
        <textarea v-model="form.impact" rows="2"></textarea>
      </div>

      <div class="form-group wide">
        <label>แผนการย้อนกลับ (Rollback Plan)</label>
        <textarea v-model="form.rollback_plan" rows="2"></textarea>
      </div>

      <div class="form-group">
        <label>แนบไฟล์ (ถ้ามี)</label>
        <input type="file" @change="e => form.attachment = e.target.files[0]" />
      </div>

      <div class="form-actions">
        <button type="submit" class="import-btn">ส่งขออนุมัติ</button>
      </div>
    </form>
  </div>
</template>
