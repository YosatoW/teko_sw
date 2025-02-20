<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full p-6 bg-white rounded-lg border border-gray-200">
      <h2 class="text-2xl font-bold text-center text-gray-900 mb-6">Login</h2>
      <form @submit.prevent="handleLogin">
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="username">
            Username
          </label>
          <input
            v-model="username"
            type="text"
            id="username"
            class="w-full p-2 border rounded-lg focus:outline-none focus:border-blue-500"
            required
          />
        </div>
        <div class="mb-6">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="password">
            Password
          </label>
          <input
            v-model="password"
            type="password"
            id="password"
            class="w-full p-2 border rounded-lg focus:outline-none focus:border-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          class="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600"
        >
          Login
        </button>
      </form>
      <p v-if="error" class="mt-4 text-red-500 text-center">{{ error }}</p>
      <p class="mt-4 text-center text-gray-600">
        Don't have an account?
        <NuxtLink to="/register" class="text-blue-500 hover:text-blue-600">Register here</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const { baseUrl } = useApi()
const router = useRouter()

const username = ref('')
const password = ref('')
const error = ref('')

const handleLogin = async () => {
  try {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username.value,
        password: password.value,
      }),
    })

    if (!response.ok) {
      const data = await response.json()
      error.value = data.error
      return
    }

    const token = await response.text()
    localStorage.setItem('token', token)
    await router.push('/posts')
  } catch (e) {
    error.value = 'An error occurred during login'
  }
}
</script>
