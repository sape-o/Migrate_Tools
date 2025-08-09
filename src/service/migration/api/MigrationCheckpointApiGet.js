
export const login = async (ipaddressServer,ipaddress, username, password) => {
    const response = await fetch(`http://${ipaddressServer}/web_api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ipaddress: ipaddress, user: username, password: password })
    })

    if (!response.ok) {
    const error = await response.text()
    throw new Error(`Login failed: ${error}`)
    }
    const data = await response.json()
    return { ...data }
}

export const logout = async (ipaddressServer, ipaddress, sid) => {
  const response = await fetch(`http://${ipaddressServer}/web_api/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ipaddress: ipaddress, sid:sid })
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Logout failed: ${error}`)
  }

  return await response.json()
}

export const showHost = async (ipaddress, sessionId, hostName) => {
  const response = await fetch(`http://${ipaddress}/web_api/show-host`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-chkp-sid': sessionId
    },
    body: JSON.stringify({ name: hostName })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Show host failed: ${error}`)
  }

  const data = await response.json()
  return { ...data }
}