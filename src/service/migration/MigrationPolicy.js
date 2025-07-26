const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/'

export async function MigrateGetPolicy() {
  try {
    const res = await fetch(`${API_URL}/migration/get-policy`)
    if (!res.ok) throw new Error('Failed to fetch')
    return await res.json()
  } catch (err) {
    console.error('From Frontend .js : MigrateGetPolicy -> ❌ Error', err)
    throw err
  }
}

export async function uploadFile(file, token) {
  if (!file) throw new Error('No file provided')

  const formData = new FormData()
  formData.append('file', file)
  formData.append('type', 'policy') // กำหนด type เป็น policy
  formData.append('create_file_time', new Date().toISOString()) // ✅ เพิ่มบรรทัดนี้
  try {
    const res = await fetch(`${API_URL}/migration/import-policy`, {
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

export async function downloadCSVFilePolicy(id, token) {
  const response = await fetch(`${API_URL}/migration/download-csv-policy/${id}`, {
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
export async function updateStatusDeletePolicy(id, token) {
  const response = await fetch(`${API_URL}/migration/policy-delete/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'From Frontend .js : updateStatusDeleteService -> Failed to delete address')
  }

  return response
}