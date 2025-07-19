const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/'

export async function MigrateGetService() {
  try {
    const res = await fetch(`${API_URL}/migration/get-service`, {
      method: 'GET',
    })
    if (!res.ok) throw new Error('From Frontend .js : Failed to fetch')
    return await res.json()
  } catch (err) {
    console.error('From Frontend .js : MigrateGetService -> ❌ Error', err)
    throw err
  }
}

export async function uploadFile(file, token) {
  if (!file) throw new Error('From Frontend .js : No file provided')

  const formData = new FormData()
  formData.append('file', file)
  formData.append('type', 'address') // กำหนด type เป็น address
  formData.append('create_file_time', new Date().toISOString()) // ✅ เพิ่มบรรทัดนี้
  try {
    const res = await fetch(`${API_URL}/migration/import-service`, {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    if (!res.ok) throw new Error(`From Frontend .js : uploadFile -> Upload failed with status ${res.status}`)
    return await res.json()
  } catch (err) {
    console.error('From Frontend .js uploadFile catch(err) -> ❌ Error  in uploadFile:', err)
    throw err
  }
}

export async function downloadCSVFileService(id, token) {
  const response = await fetch(`${API_URL}/migration/download-csv-service/${id}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  if (!response.ok) {
    throw new Error('From Frontend .js : downloadCSVFile ->Failed to download CSV file')
  }
  const blob = await response.blob()
  return blob
}