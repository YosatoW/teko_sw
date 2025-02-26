<template>
  <div>Loading...</div>
</template>

<script setup lang="ts">
const router = useRouter()

// Redirect to login page
onMounted(() => {
  router.replace('/login')
})
</script>
