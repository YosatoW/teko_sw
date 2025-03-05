<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 flex items-center justify-center px-4 py-8">
    <div class="w-full max-w-md shadow-2xl">
      <div class="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100">
        <div class="p-8">
          <div class="text-center mb-8">
            <h2 class="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              Create Account
            </h2>
            <p class="text-gray-500 mt-2">Start your journey with us</p>
          </div>
          
          <form @submit.prevent="handleRegister" class="space-y-6">
            <div>
              <label 
                for="username" 
                class="block text-sm font-medium text-gray-700 mb-2 pl-1"
              >
                Username
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                  </svg>
                </div>
                <input
                  v-model="username"
                  type="text"
                  id="username"
                  required
                  class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-300 ease-in-out"
                  placeholder="Choose your username"
                />
              </div>
            </div>

            <div>
              <label 
                for="password" 
                class="block text-sm font-medium text-gray-700 mb-2 pl-1"
              >
                Password
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                  </svg>
                </div>
                <input
                  v-model="password"
                  type="password"
                  id="password"
                  required
                  class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-300 ease-in-out"
                  placeholder="Create a strong password"
                />
              </div>
            </div>

            <button
              type="submit"
              class="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:opacity-90 transition duration-300 ease-in-out transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            >
              Register Now
            </button>
          </form>

          <div v-if="error" class="mt-4 text-center">
            <p class="text-red-500 bg-red-50 py-2 px-4 rounded-lg border border-red-200">
              {{ error }}
            </p>
          </div>

          <div class="mt-6 text-center">
            <p class="text-gray-600">
              Already have an account?
              <NuxtLink 
                to="/login" 
                class="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition duration-300"
              >
                Login here
              </NuxtLink>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { baseUrl } = useApi()
const router = useRouter()

const username = ref('')
const password = ref('')
const error = ref('')

const handleRegister = async () => {
  try {
    const response = await fetch(`${baseUrl}/api/auth/register`, {
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
      error.value = data.message
      return
    }

    await router.push('/login')
  } catch (e) {
    error.value = 'An error occurred during registration'
  }
}
</script>