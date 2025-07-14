const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const UserService = {
  async getCustomersLarge() {
    try {
      const token = getToken();
      const response = await fetch('http://127.0.0.1:3000/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('ไม่สามารถโหลดข้อมูลลูกค้าได้');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('เกิดข้อผิดพลาด:', error.message);
      return [];
    }
  },
  async createUser(userData) {
    try {
      const res = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })

      if (!res.ok) {
        const errText = await res.text()
        alert("From BackEND :  "+errText)
        throw new Error(`Failed to add user: ${errText}`)
      }

      return await res.json()
    } catch (error) {
      console.error('Error adding user:', error)
      throw error
    }
  },

  async updateUser(id, userData) {
    try {
      const res = await fetch(`${API_URL}/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })

      if (!res.ok) throw new Error('Failed to update user')
      return await res.json()
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  },

  async deleteUser(id) {
    try {
      const res = await fetch(`${API_URL}/users/${id}`, {
        method: 'DELETE'
      })

      if (!res.ok) throw new Error('Failed to delete user')
      return await res.json()
    } catch (error) {
      console.error('Error deleting user:', error)
      throw error
    }
  }
};

function getToken() {
  return localStorage.getItem('token');
}