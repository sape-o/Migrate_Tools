const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/'

export async function MigrationDetailID(id, token) {
  try {
    const res = await fetch(`${API_URL}/migration/get-service-detail/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!res.ok) 
        throw new Error(`From Frontend .js : MigrationDetailID -> HTTP error! status: ${res.status}`)

    const csvText = await res.text()

    return csvText
  } catch (error) {
    throw error
  }
}