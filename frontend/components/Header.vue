<template>
  <header class="bg-blue-500 text-white">
    <div class="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
      <h1 class="text-2xl">Minitwitter</h1>
      <div v-if="currentUser" class="flex items-center gap-4">
        <span class="text-sm">Welcome, {{ currentUser.username }}</span>
        <button 
          @click="handleLogout" 
          class="px-3 py-1 bg-red-500 rounded-lg hover:bg-red-600 text-sm"
        >
          Logout
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const router = useRouter()

const currentUser = computed(() => {
  const token = localStorage.getItem('token')
  if (!token) return null
  return JSON.parse(atob(token.split('.')[1]))
})

const handleLogout = () => {
  localStorage.removeItem('token')
  router.push('/login')
}
</script>
