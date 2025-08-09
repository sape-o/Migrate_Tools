// src/api/networkApi.js

export const addNetwork = async (ipaddressServer, ipaddress, sessionId, networkData) => {
  const payload = {
    ipaddress,
    sessionId,
    networkData
  }

  const response = await fetch(`http://${ipaddressServer}/network/add-network`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Add network failed: ${error}`)
  }

  const data = await response.json()
  return { ...data }
}

export const setNetwork = async (ipaddress, sessionId, networkData) => {
  const response = await fetch(`http://${ipaddress}/web_api/set-network`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-chkp-sid': sessionId
    },
    body: JSON.stringify(networkData)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Set network failed: ${error}`);
  }

  const data = await response.json();
  return { ...data };
};

export const deleteNetwork = async (ipaddress, sessionId, networkData) => {
  const response = await fetch(`http://${ipaddress}/web_api/delete-network`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-chkp-sid': sessionId
    },
    body: JSON.stringify(networkData)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Delete network failed: ${error}`);
  }

  const data = await response.json();
  return { ...data };
};

// ------------------------------------------- Address Range --------------------------------- //

export const addAddressRange = async (ipaddressServer, ipaddress, sessionId, addressRangeData) => {
  const payload = {
    ipaddress,
    sessionId,
    rangeData: addressRangeData.rangeData
  }

  const response = await fetch(`http://${ipaddressServer}/network/add-address-range`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Add address range failed: ${error}`)
  }

  const data = await response.json()
  return { ...data }
}

// ------------------------------------------ Address Group --------------------------------- //

export const addAddressGroup = async (ipaddressServer, ipaddress, sessionId, groupData) => {
  const payload = {
    ipaddress,
    sessionId,
    groupData // ควรเป็น object ที่มีข้อมูล group เช่น { name, members, type }
  }

  const response = await fetch(`http://${ipaddressServer}/network/add-address-group`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Add address group failed: ${error}`)
  }

  const data = await response.json()
  return { ...data }
}

// ------------------------------------------ Service-TCP -------------------------------- //
export const addTcpService = async (ipaddressServer, ipaddress, sessionId, serviceData) => {
  console.log(serviceData);
  console.log(sessionId)
  console.log(ipaddress);
  
  
  
  const payload = {
    ipaddress,
    sessionId,
    serviceData
  }

  const response = await fetch(`http://${ipaddressServer}/network/add-service-tcp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Add TCP service failed: ${error}`)
  }

  const data = await response.json()
  return { ...data }
}

