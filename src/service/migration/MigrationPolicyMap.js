const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/'

export async function MigrateFetchValidatePolicyMap() {
  try {
    const res = await fetch(`${API_URL}/migration/get-policy-map`)
    if (!res.ok) throw new Error('Failed to fetch policy map')
    return await res.json()
  } catch (err) {
    console.error('From Frontend .js : MigrateFetchPolicyMap -> ❌ Error', err)
    throw err
  }
}

export async function MigrateGetPolicyMapPolicy() {
  try {
    const res = await fetch(`${API_URL}/migration/get-policy-map/policy`)
    if (!res.ok) throw new Error('Failed to fetch policy map policy')
    return await res.json()
  } catch (err) {
    console.error('From Frontend .js : MigrateGetPolicyMapPolicy -> ❌ Error', err)
    throw err
  }
}

export async function MigrateGetPolicyMapAddress() {
  try {
    const res = await fetch(`${API_URL}/migration/get-policy-map/address`)
    if (!res.ok) throw new Error('Failed to fetch policy map address')
    return await res.json()
  } catch (err) {
    console.error('From Frontend .js : MigrateGetPolicyMapAddress -> ❌ Error', err)
    throw err
  }
}
export async function MigrateGetPolicyMapAddressGroup() {
  try {
    const res = await fetch(`${API_URL}/migration/get-policy-map/address-group`)
    if (!res.ok) throw new Error('Failed to fetch policy map address group')
    return await res.json()
  } catch (err) {
    console.error('From Frontend .js : MigrateGetPolicyMapAddressGroup -> ❌ Error', err)
    throw err
  }
}
export async function MigrateGetPolicyMapService() {
  try {
    const res = await fetch(`${API_URL}/migration/get-policy-map/service`)
    if (!res.ok) throw new Error('Failed to fetch policy map service')
    return await res.json()
  } catch (err) {
    console.error('From Frontend .js : MigrateGetPolicyMapService -> ❌ Error', err)
    throw err
  }
}
export async function MigrateGetPolicyMapServiceGroup() {
  try {
    const res = await fetch(`${API_URL}/migration/get-policy-map/service-group`)
    if (!res.ok) throw new Error('Failed to fetch policy map service group')
    return await res.json()
  } catch (err) {
    console.error('From Frontend .js : MigrateGetPolicyMapServiceGroup -> ❌ Error', err)
    throw err
  }
}
export async function validatePolicyMap (policyId, addressId, addressGroupId, serviceId, serviceGroupId) {
  try {
    const res = await fetch(`${API_URL}/migration/validate-policy-map`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        policyId,
        addressId,
        addressGroupId,
        serviceId,
        serviceGroupId
      })
    })
    if (!res.ok) throw new Error('Failed to validate policy')
    return await res.json()
  } catch (err) {
    console.error('From Frontend .js : ValidationPolicy -> ❌ Error', err)
    throw err
  }
}

export async function updateStatusDelteMigrateGetPolicyMap(id) {
  try {
    const response = await fetch(`${API_URL}/migration/validate-policy-map/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'From Frontend.js: Failed to delete')
    }

    const data = await response.json() 
    return data //  return JSON ที่ backend ส่งมา
  } catch (err) {
    console.error('From Frontend.js: updateStatusDelteMigrateGetPolicyMap -> ❌ Error', err)
    throw err
  }
}
