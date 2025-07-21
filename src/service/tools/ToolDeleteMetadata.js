const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/'

export async function fetchDeleteMetadata() {
  const token = localStorage.getItem('token') || ''
  const res = await fetch(`${API_URL}/tools/delete-metadata`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) throw new Error('Failed to fetch files')
  return await res.json()
}

// อัพโหลดไฟล์
export async function toolsUploadDeleteMetadata(file, token) {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch(`${API_URL}/tools/delete-metadata`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
      // ห้ามตั้ง Content-Type เองเมื่อใช้ FormData
    },
    body: formData
  })
  if (!res.ok) {
    const errData = await res.json()
    throw new Error(errData.message || 'Upload failed')
  }
  return await res.json()
}

// ลบไฟล์ตาม id
export async function updateStatusDeleteService(id, token) {
  const res = await fetch(`${API_URL}/tools/delete-metadata/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) {
    const errData = await res.json()
    throw new Error(errData.message || 'Delete failed')
  }
  return true
}

// ดาวน์โหลดไฟล์ CSV (blob)
export async function toolsDownloadMetadata(id, token) {
  const res = await fetch(`${API_URL}/tools/delete-metadata/${id}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) {
    const errData = await res.json()
    throw new Error(errData.message || 'Download failed')
  }
  return await res.blob()
}