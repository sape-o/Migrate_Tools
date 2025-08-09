<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useToast } from 'primevue/usetoast'
import { login, logout } from '../../../service/migration/api/MigrationCheckpointApiGet.js'

const toast = useToast()

const ipaddress = ref('10.99.98.29')
const username = ref('oreo')
const password = ref('oreo')
const ipaddressServer = ref('localhost:3001')

const savedSessionAPI = ref(localStorage.getItem('sessionInfoAPI') ? JSON.parse(localStorage.getItem('sessionInfoAPI')) : '')
const savedSessionName = ref(localStorage.getItem('sessionInfoNAME') ? JSON.parse(localStorage.getItem('sessionInfoNAME')) : '')
const savedSessionIpaddress = ref(localStorage.getItem('sessionInfoIpaddress') || '')
const savedSessionIpaddressServer = ref(localStorage.getItem('sessionInfoIpaddressServer') || '')
const savedSessionTimeout = ref(localStorage.getItem('sessionInfoTimeout') ? JSON.parse(localStorage.getItem('sessionInfoTimeout')) : 0)

const countdown = ref(savedSessionTimeout.value)

let intervalId = null
function startCountdown() {
  // ถ้า countdown มากกว่า 0 ให้เริ่มนับ
  if (countdown.value > 0) {
    intervalId = setInterval(() => {
      if (countdown.value > 0) {
        countdown.value -= 1
      } else {
        clearInterval(intervalId)
        // ที่นี่จะทำ logout หรืออย่างอื่นได้
      }
    }, 1000)
  }
}


onMounted(() => {
  startCountdown()
})

onBeforeUnmount(() => {
  if (intervalId) clearInterval(intervalId)
})

async function handleLoginLogout() {
  if (!savedSessionAPI.value) {
    try {
      if(!ipaddressServer.value || !ipaddress.value || !username.value || !password.value) {
        alert("INPUT DATA")
        return
      }
      const response = await login(ipaddressServer.value, ipaddress.value, username.value, password.value)
      savedSessionAPI.value = response.sid
      savedSessionName.value = response['user-name']
      savedSessionIpaddress.value = ipaddress.value
      savedSessionIpaddressServer.value = ipaddressServer.value
      localStorage.setItem('sessionInfoAPI', JSON.stringify(response.sid))
      localStorage.setItem('sessionInfoNAME', JSON.stringify(response['user-name']))
      localStorage.setItem('sessionInfoTimeout', JSON.stringify(response['session-timeout']))
      localStorage.setItem('sessionInfoUid', JSON.stringify(response['user-uid']))
      localStorage.setItem('sessionInfoIpaddressServer', ipaddressServer.value)
      localStorage.setItem('sessionInfoIpaddress', ipaddress.value)
      savedSessionTimeout.value = response['session-timeout']
      countdown.value = response['session-timeout']
      startCountdown() // รีสตาร์ทการนับถอยหลังใหม่
      toast.add({
        severity: 'success',
        summary: 'Login Success',
        detail: `Login success to ip ${savedSessionName.value}`,
        life: 3000
      })
      password.value = ''
      
    } catch (err) {
      username.value = ''
      password.value = ''
      ipaddress.value = ''
      ipaddressServer.value = ''
      savedSessionTimeout.value = 0
      toast.add({
        severity: 'error',
        summary: 'Login Failed',
        detail: `Failed to login: ${err.message || err}`,
        life: 3000
      })
    }
  } else {
    // temp
    localStorage.clear()
    savedSessionAPI.value = ''
    savedSessionName.value = ''
    savedSessionIpaddress.value = ''
    savedSessionIpaddressServer.value = ''
    savedSessionTimeout.value = 0
    countdown.value = 0
    try {
      const returnLogout = await logout(savedSessionIpaddressServer.value, savedSessionIpaddress.value, savedSessionAPI.value)
      toast.add({
        severity: 'info',
        summary: 'Logout Success',
        detail: `Logged out successfully ${returnLogout.message}`,
        life: 3000
      })
      localStorage.clear()
      savedSessionAPI.value = ''
      savedSessionName.value = ''
      savedSessionIpaddress.value = ''
      savedSessionIpaddressServer.value = ''
      savedSessionTimeout.value = 0
      countdown.value = 0

    } catch (err) {
      toast.add({
        severity: 'error',
        summary: 'Logout Failed',
        detail: `Failed to logout: ${err.message || err}`,
        life: 3000
      })
    }
  }
}
</script>

<template>
  <div class="card w-full">
    <div class="flex flex-col md:flex-row gap-6">
      <div class="w-full md:w-2/5">
        <div class="flex flex-col">
          <div class="font-semibold text-xl mb-4">LOGIN API TO CHECK POINT</div>

          <template v-if="!savedSessionAPI">
            <div class="mb-4">
              <InputText
                type="text"
                placeholder="IP Address OR URL Of Server"
                class="w-full"
                v-model="ipaddressServer"
              />
            </div>
            <div class="mb-4">
              <InputText
                type="text"
                placeholder="IP Address OR URL Of Smart Console"
                class="w-full"
                v-model="ipaddress"
              />
            </div>

            <div class="flex flex-col md:flex-row gap-4">
              <InputText
                type="text"
                placeholder="USERNAME"
                class="w-full md:flex-1"
                v-model="username"
              />
              <InputText
                type="password"
                placeholder="PASSWORD"
                class="w-full md:flex-1"
                v-model="password"
              />
              <div class="w-full md:w-auto">
                <Button
                  label="Login"
                  class="w-full md:w-auto p-button-success"
                  @click="handleLoginLogout"
                />
              </div>
            </div>
          </template>

          <template v-else>
            <Button
              label="Logout"
              class="w-full p-button-danger p-button-lg mt-4"
              @click="handleLoginLogout"
            />
          </template>
        </div>
      </div>

      <div class="w-full md:w-3/5">
        <p>
          LOGIN USER : {{ savedSessionName }} <br />
          SESSION TIME OUT (seconds): 
          <span style="font-weight: bold; color: red;">
            {{ countdown }}
          </span>
          <br />
          SID : {{ savedSessionAPI }} <br />
        </p>
      </div>
    </div>
  </div>
  <div class="card">
  <div class="font-semibold text-xl mb-4">Tabs</div>
    <Tabs value="0">
      <TabList>
        <Tab value="0">Header I</Tab>
        <Tab value="1">Header II</Tab>
        <Tab value="2">Header III</Tab>
      </TabList>
      <TabPanels>
        <TabPanel value="0">
          <p class="m-0">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
              commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit
              anim id est laborum.
          </p>
          </TabPanel>
          <TabPanel value="1">
            <p class="m-0">
                Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt
                explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Consectetur, adipisci velit, sed quia non
                numquam eius modi.
            </p>
          </TabPanel>
          <TabPanel value="2">
            <p class="m-0">
                At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique
                sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil
                impedit quo minus.
            </p>
          </TabPanel>
      </TabPanels>
    </Tabs>
  </div>
</template>

<style scoped>
.p-button-lg {
  font-size: 1.25rem;
  padding: 2rem 2rem;
}
.timeout-countdown {
  font-weight: bold;
  color: red;
}
</style>
