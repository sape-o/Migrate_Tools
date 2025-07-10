<template>
  <div class="login-container">
    <form class="login-form" @submit.prevent="handleLogin">
      <h2>Login</h2>

      <div class="form-group">
        <label>Username</label>
        <input type="text" v-model="username" required />
      </div>

      <div class="form-group">
        <label>Password</label>
        <input type="password" v-model="password" required />
      </div>

      <div class="form-actions">
        <button class="btn" type="submit">Login</button>
      </div>

      <p v-if="error" class="error-msg">{{ error }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const username = ref('')
const password = ref('')
const error = ref('')
const router = useRouter()

async function handleLogin() {
  error.value = ''
  try {
    const res = await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.value, password: password.value }),
    })

    if (!res.ok) throw new Error('Invalid username or password')

    const data = await res.json()
    localStorage.setItem('token', data.token) // เก็บ token
    localStorage.setItem('userId', data.userId);
    router.push('/dashboard') // เปลี่ยน path ที่ต้องการให้ไปหลังล็อกอินสำเร็จ
  } catch (err) {
    error.value = err.message
  }
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #ecf0f1;
}

.login-form {
  background: white;
  padding: 40px;
  border-radius: 10px;
  width: 320px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
}

.login-form h2 {
  margin-bottom: 20px;
  text-align: center;
  color: #2c3e50;
}

.form-group {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 6px;
  font-size: 14px;
  color: #555;
}

.form-group input {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
}

.form-actions {
  margin-top: 20px;
}

.btn {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px;
  width: 100%;
  font-size: 16px;
  font-weight: bold;
  border-radius: 6px;
  cursor: pointer;
}

.btn:hover {
  background-color: #2980b9;
}

.error-msg {
  margin-top: 12px;
  color: red;
  text-align: center;
  font-size: 14px;
}
</style>
