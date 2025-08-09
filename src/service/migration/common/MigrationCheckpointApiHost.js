
export const addHost = async (ipaddress, sessionId, hostData) => {
  const response = await fetch(`https://${ipaddress}/web_api/add-host`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-chkp-sid': sessionId
    },
    body: JSON.stringify(hostData)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Add host failed: ${error}`);
  }

  const data = await response.json();
  return { ...data };
};

export const setHost = async (ipaddress, sessionId, hostData) => {
  const response = await fetch(`https://${ipaddress}/web_api/set-host`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-chkp-sid': sessionId
    },
    body: JSON.stringify(hostData)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Set host failed: ${error}`);
  }

  const data = await response.json();
  return { ...data };
};

export const deleteHost = async (ipaddress, sessionId, hostData) => {
  const response = await fetch(`https://${ipaddress}/web_api/delete-host`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-chkp-sid': sessionId
    },
    body: JSON.stringify(hostData)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Delete host failed: ${error}`);
  }

  const data = await response.json();
  return { ...data };
};
