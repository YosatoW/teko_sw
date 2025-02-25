<template>
  <div class="container mx-auto p-4 mt-16"> <!-- Added mt-16 for header space -->
    <!-- Create new post section -->
    <div class="mb-8 p-4 border rounded-lg bg-white">
      <h2 class="text-xl font-bold mb-4">Create New Post</h2>
      <form @submit.prevent="createPost" class="space-y-4">
        <textarea
          v-model="newPostContent"
          class="w-full p-2 border rounded-lg resize-none h-24"
          placeholder="What's on your mind?"
          required
        ></textarea>
        <button
          type="submit"
          class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Post
        </button>
      </form>
    </div>

    <!-- Posts list -->
    <div v-if="pending">Loading...</div>
    <div v-else-if="error">Error loading posts</div>
    <div v-else class="space-y-4">
      <h1 class="text-2xl font-bold mb-4">Posts</h1>
      <div v-for="post in posts" :key="post.id" class="p-4 border rounded-lg bg-white">
        <!-- Edit mode -->
        <div v-if="editingPost?.id === post.id">
          <textarea
            v-model="editingPost.content"
            class="w-full p-2 border rounded-lg resize-none h-24 mb-2"
          ></textarea>
          <div class="flex gap-2">
            <button
              @click="updatePost(post.id)"
              class="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600"
            >
              Save
            </button>
            <button
              @click="cancelEdit"
              class="bg-gray-500 text-white px-3 py-1 rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
        <!-- View mode -->
        <div v-else class="space-y-4">
          <!-- Post header -->
          <div class="flex justify-between items-start">
            <div>
              <p class="font-medium text-gray-900">{{ post.username }}</p>
              <p class="text-sm text-gray-500">{{ formatDate(post.createdAt) }}</p>
            </div>
            <div class="flex items-center gap-4">
              <!-- Like/Dislike buttons -->
              <div class="flex gap-2">
                <button 
                  @click="handleLike(post.id)"
                  class="flex items-center gap-1 px-2 py-1 rounded"
                  :class="{
                    'bg-blue-100': post.userLike === true,
                    'hover:bg-blue-50': post.userLike !== true
                  }"
                >
                  <span>👍 {{ post.likes || 0 }}</span>
                </button>
                <button 
                  @click="handleDislike(post.id)"
                  class="flex items-center gap-1 px-2 py-1 rounded"
                  :class="{
                    'bg-red-100': post.userLike === false,
                    'hover:bg-red-50': post.userLike !== false
                  }"
                >
                  <span>👎 {{ post.dislikes || 0 }}</span>
                </button>
              </div>
              <!-- Edit/Delete buttons -->
              <div v-if="post.userId === currentUserId" class="flex gap-2">
                <button
                  @click="startEdit(post)"
                  class="text-blue-500 hover:text-blue-600"
                >
                  Edit
                </button>
                <button
                  @click="deletePost(post.id)"
                  class="text-red-500 hover:text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
          
          <!-- Post content -->
          <p class="text-gray-800 whitespace-pre-wrap">{{ post.content }}</p>
        </div>

        <!-- Comments section -->
        <div class="mt-4 border-t pt-4">
          <h3 class="text-lg font-semibold mb-2">
            Comments
          </h3>

          <!-- Comments list -->
          <div v-if="post.comments?.length" class="space-y-2 max-h-96 overflow-y-auto mb-4">
            <div v-for="comment in post.comments" :key="comment.id" class="ml-4 p-2 bg-gray-50 rounded">
              <div v-if="editingComment?.id === comment.id">
                <input
                  v-model="editingComment.content"
                  type="text"
                  class="w-full p-2 border rounded mb-2"
                />
                <div class="flex gap-2">
                  <button
                    @click="updateComment(post.id, comment.id)"
                    class="text-xs bg-green-500 text-white px-2 py-1 rounded"
                  >
                    Save
                  </button>
                  <button
                    @click="cancelCommentEdit"
                    class="text-xs bg-gray-500 text-white px-2 py-1 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
              <div v-else>
                <!-- Comment header -->
                <div class="flex justify-between items-start mb-1">
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ comment.username }}</p>
                    <p class="text-xs text-gray-500">{{ formatDate(comment.createdAt) }}</p>
                  </div>
                  <div class="flex items-center gap-2">
                    <!-- Like/Dislike buttons -->
                    <div class="flex gap-1">
                      <button 
                        @click="handleCommentLike(comment.id)"
                        class="text-xs px-1.5 py-0.5 rounded"
                        :class="{
                          'bg-blue-100': comment.userLike === true,
                          'hover:bg-blue-50': comment.userLike !== true
                        }"
                      >
                        <span>👍 {{ comment.likes || 0 }}</span>
                      </button>
                      <button 
                        @click="handleCommentDislike(comment.id)"
                        class="text-xs px-1.5 py-0.5 rounded"
                        :class="{
                          'bg-red-100': comment.userLike === false,
                          'hover:bg-red-50': comment.userLike !== false
                        }"
                      >
                        <span>👎 {{ comment.dislikes || 0 }}</span>
                      </button>
                    </div>
                    <!-- Edit/Delete buttons -->
                    <div v-if="comment.userId === currentUserId" class="flex gap-2">
                      <button
                        @click="startCommentEdit(comment)"
                        class="text-xs text-blue-500 hover:text-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        @click="deleteComment(post.id, comment.id)"
                        class="text-xs text-red-500 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
                <!-- Comment content -->
                <p class="text-sm whitespace-pre-wrap">{{ comment.content }}</p>
              </div>
            </div>
          </div>

          <!-- Add comment form -->
          <form @submit.prevent="addComment(post.id)" class="mt-4">
            <div class="flex gap-2">
              <input
                v-model="newComments[post.id]"
                type="text"
                placeholder="Add a comment"
                class="flex-1 p-2 border rounded"
                required
              />
              <button
                type="submit"
                class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              >
                Comment
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth']
})

const router = useRouter()

// Check authentication
const checkAuth = () => {
  const token = localStorage.getItem('token')
  if (!token) {
    router.push('/login')
    return false
  }
  return true
}

// Add authentication checks
onMounted(() => {
  if (!checkAuth()) return
})

// Watch for token removal
watch(() => localStorage.getItem('token'), (newToken) => {
  if (!newToken) {
    router.push('/login')
  }
})

const { baseUrl } = useApi()
const newPostContent = ref('')
const editingPost = ref<{ id: number; content: string } | null>(null)
const currentUserId = computed(() => {
  const token = localStorage.getItem('token')
  if (!token) return null
  const payload = JSON.parse(atob(token.split('.')[1]))
  return payload.id
})

const newComments = ref<Record<number, string>>({})
const editingComment = ref<{ id: number; content: string } | null>(null)

// Fetch posts
const { pending, data: posts, error, refresh } = await useFetch<Array<{
  id: number
  userId: number
  content: string
  username: string
  createdAt: string
  comments: Array<any>
}>>(`${baseUrl}/api/posts`, {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})

// Create new post
const createPost = async () => {
  try {
    await fetch(`${baseUrl}/api/posts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: newPostContent.value }),
    })
    newPostContent.value = ''
    refresh()
  } catch (e) {
    console.error('Error creating post:', e)
  }
}

// Start editing post
const startEdit = (post: any) => {
  editingPost.value = {
    id: post.id,
    content: post.content
  }
}

// Cancel editing
const cancelEdit = () => {
  editingPost.value = null
}

// Update post
const updatePost = async (id: number) => {
  try {
    await fetch(`${baseUrl}/api/posts/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: editingPost.value?.content }),
    })
    editingPost.value = null
    refresh()
  } catch (e) {
    console.error('Error updating post:', e)
  }
}

// Delete post with confirmation
const deletePost = async (id: number) => {
  if (!confirm('Are you sure you want to delete this post?')) return
  
  try {
    const response = await fetch(`${baseUrl}/api/posts/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    })
    
    if (!response.ok) {
      throw new Error('Failed to delete post')
    }

    // Remove post from local state immediately
    if (posts.value) {
      posts.value = posts.value.filter(post => post.id !== id)
    }
    
    // Refresh data from server
    await refresh()
  } catch (e) {
    console.error('Error deleting post:', e)
    alert('Failed to delete post. Please try again.')
  }
}

// Add comment with debug logging
const addComment = async (postId: number) => {
  console.log('Attempting to add comment to post:', postId)
  try {
    const response = await fetch(`${baseUrl}/api/posts/${postId}/comments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: newComments.value[postId] }),
    })
    
    if (!response.ok) {
      const error = await response.text()
      console.error('Error response:', error)
      throw new Error(`Failed to add comment: ${error}`)
    }

    console.log('Comment added successfully')
    newComments.value[postId] = ''
    refresh()
  } catch (e) {
    console.error('Error adding comment:', e)
    alert('Failed to add comment. Please try again.')
  }
}

// Start editing comment
const startCommentEdit = (comment: any) => {
  editingComment.value = {
    id: comment.id,
    content: comment.content
  }
}

// Cancel comment editing
const cancelCommentEdit = () => {
  editingComment.value = null
}

// Update comment
const updateComment = async (postId: number, commentId: number) => {
  try {
    await fetch(`${baseUrl}/api/posts/${postId}/comments/${commentId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: editingComment.value?.content }),
    })
    editingComment.value = null
    refresh()
  } catch (e) {
    console.error('Error updating comment:', e)
  }
}

// Delete comment
const deleteComment = async (postId: number, commentId: number) => {
  if (!confirm('Are you sure you want to delete this comment?')) return
  
  try {
    await fetch(`${baseUrl}/api/posts/${postId}/comments/${commentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    })
    refresh()
  } catch (e) {
    console.error('Error deleting comment:', e)
  }
}

// Format date
const formatDate = (date: string) => {
  try {
    return new Date(date).toLocaleString('de-CH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (e) {
    return 'Invalid date'
  }
}

// Ensure fresh data on component mount
onMounted(() => {
  refresh()
})
</script>
