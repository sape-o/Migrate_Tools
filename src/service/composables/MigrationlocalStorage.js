
import { ref, onMounted } from 'vue'

export function useSessionInfo() {
  const hasSessionInfoAPI = ref(false)
  const sessionInfo = ref(null)
  const sessionInfoAPI = JSON.parse(localStorage.getItem('sessionInfoAPI'))
  const sessionInfoIpaddressServer = localStorage.getItem('sessionInfoIpaddressServer')
  const sessionInfoIpaddress = localStorage.getItem('sessionInfoIpaddress')

  onMounted(() => {
    const storedSession = localStorage.getItem('sessionInfoAPI')
    if (storedSession) {
      sessionInfo.value = JSON.parse(storedSession)
      hasSessionInfoAPI.value = true
    } else {
      sessionInfo.value = null
      hasSessionInfoAPI.value = false
    }
  })

  return {
    hasSessionInfoAPI,
    sessionInfoAPI,
    sessionInfoIpaddressServer,
    sessionInfoIpaddress
  }
}
