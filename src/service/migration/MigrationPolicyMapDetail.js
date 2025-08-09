const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/'

export async function getMigrationMappedData(id, token) {
  const encode_id = encodeURIComponent(id)
  try {
    const res = await fetch(`${API_URL}/migration/get-policy-map-detail/${encode_id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    if (!res.ok) {
      throw new Error(`From Frontend .js : getMigrationMappedData -> HTTP error! status: ${res.status}`)
    }

    const result = await res.json()
    console.log(result);
        
    console.log(result)
    return result
  } catch (error) {
    console.error('Fetch error:', error)
    throw error
  }
}