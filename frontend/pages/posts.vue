<template>
  <div class="container mx-auto p-4">
    <div v-if="pending">Loading...</div>
    <div v-else-if="error">Error loading posts</div>
    <div v-else>
      <h1 class="text-2xl font-bold mb-4">Posts</h1>
      <div class="space-y-4">
        <div v-for="post in posts" :key="post.id" class="p-4 border rounded-lg bg-white">
          <p class="text-gray-800">{{ post.content }}</p>
          <p class="text-sm text-gray-500 mt-2">Posted by: {{ post.userId }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { baseUrl } = useApi()
const { pending, data: posts, error } = await useFetch(`${baseUrl}/api/posts`, {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
</script>
