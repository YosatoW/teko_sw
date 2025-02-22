<template>
  <header class="fixed top-0 left-0 right-0 bg-blue-500 text-white z-10">
    <div class="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
      <h1 class="text-2xl">Minitwitter</h1>
      <div v-if="currentUser" class="flex items-center gap-4">
        <span class="text-sm">Welcome, {{ currentUser.username }}</span>
        <button 
          @click="showPasswordDialog = true"
          class="px-3 py-1 bg-blue-600 rounded-lg hover:bg-blue-700 text-sm"
        >
          Change Password
        </button>
        <button 
          @click="handleLogout" 
          class="px-3 py-1 bg-red-500 rounded-lg hover:bg-red-600 text-sm"
        >
          Logout
        </button>
      </div>
    </div>

    <!-- Password Change Dialog -->
    <div v-if="showPasswordDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white p-6 rounded-lg w-96">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Change Password</h2>
        <form @submit.prevent="handlePasswordChange" class="space-y-4">
          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2">
              Current Password
            </label>
            <input
              v-model="currentPassword"
              type="password"
              class="w-full p-2 border rounded text-gray-900"
              required
            />
          </div>
          <div>
            <label class="block text-gray-700 text-sm font-bold mb-2">
              New Password
            </label>
            <input
              v-model="newPassword"
              type="password"
              class="w-full p-2 border rounded text-gray-900"
              required
            />
          </div>
          <div class="flex justify-end gap-2">
            <button
              type="button"
              @click="closePasswordDialog"
              class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Update
            </button>
          </div>
          <p v-if="passwordError" class="text-red-500 text-sm">{{ passwordError }}</p>
        </form>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const router = useRouter()

// Create a reactive reference to watch token changes
const token = ref(localStorage.getItem('token'))

// Watch for token changes in localStorage
window.addEventListener('storage', (event) => {
  if (event.key === 'token') {
    token.value = event.newValue
  }
})

// Compute current user from the latest token
const currentUser = computed(() => {
  if (!token.value) return null
  try {
    return JSON.parse(atob(token.value.split('.')[1]))
  } catch {
    return null
  }
})

const handleLogout = () => {
  localStorage.removeItem('token')
  token.value = null
  router.push('/login')
}

// Update token when component mounts
onMounted(() => {
  token.value = localStorage.getItem('token')
})

const showPasswordDialog = ref(false)
const currentPassword = ref('')
const newPassword = ref('')
const passwordError = ref('')
const { baseUrl } = useApi()

const handlePasswordChange = async () => {
  try {
    const response = await fetch(`${baseUrl}/api/auth/change-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.value}`
      },
      body: JSON.stringify({
        currentPassword: currentPassword.value,
        newPassword: newPassword.value
      })
    })

    if (!response.ok) {
      const data = await response.json()
      passwordError.value = data.error
      return
    }

    closePasswordDialog()
  } catch (e) {
    passwordError.value = 'An error occurred while changing password'
  }
}

const closePasswordDialog = () => {
  showPasswordDialog.value = false
  currentPassword.value = ''
  newPassword.value = ''
  passwordError.value = ''
}
</script>
