const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/'

export async function MigrateGetAddress() {
  try {
    const res = await fetch(`${API_URL}/migration/get-address`)
    if (!res.ok) throw new Error('Failed to fetch')
    return await res.json()
  } catch (err) {
    console.error('VUE-js ❌ Error in MigrateGetAddress:', err)
    throw err
  }
}

export async function uploadFile(file, token) {
  if (!file) throw new Error('No file provided')

  const formData = new FormData()
  formData.append('file', file)
  formData.append('type', 'address') // กำหนด type เป็น address
  formData.append('create_file_time', new Date().toISOString()) // ✅ เพิ่มบรรทัดนี้
  try {
    const res = await fetch(`${API_URL}/migration/import-address`, {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    if (!res.ok) throw new Error(`VUE-js Upload failed with status ${res.status}`)
    return await res.json()
  } catch (err) {
    console.error('VUE-js ❌ Error  in uploadFile:', err)
    throw err
  }
}
