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
            <!-- Action buttons column -->
            <div class="flex flex-col gap-2">
              <!-- Like/Dislike buttons - Only show for other users' posts -->
              <div v-if="post.userId !== currentUserId" class="flex gap-2 items-center">
                <button 
                  @click="handleLike(post.id, 1)"
                  class="px-3 py-1.5 rounded transition-colors"
                  :class="{ 
                    'bg-blue-100 text-blue-600': post.userLikeValue === 1,
                    'bg-gray-50 hover:bg-gray-100': post.userLikeValue !== 1
                  }"
                >
                  👍
                </button>
                <span class="font-medium" :class="{
                  'text-blue-600': post.likeCount > 0,
                  'text-red-600': post.likeCount < 0
                }">
                  {{ post.likeCount }}
                </span>
                <button 
                  @click="handleLike(post.id, -1)"
                  class="px-3 py-1.5 rounded transition-colors"
                  :class="{ 
                    'bg-red-100 text-red-600': post.userLikeValue === -1,
                    'bg-gray-50 hover:bg-gray-100': post.userLikeValue !== -1
                  }"
                >
                  👎
                </button>
              </div>
              <!-- Show just the count for own posts -->
              <div v-else class="text-center">
                <span class="font-medium" :class="{
                  'text-blue-500': post.likeCount > 0,
                  'text-red-500': post.likeCount < 0
                }">
                  Rating: {{ post.likeCount }}
                </span>
              </div>
              <!-- Edit/Delete buttons -->
              <div v-if="post.userId === currentUserId" class="flex gap-2">
                <button
                  @click="startEdit(post)"
                  class="flex-1 px-3 py-1.5 rounded bg-gray-50 text-blue-500 hover:bg-gray-100 transition-colors"
                  title="Edit post"
                >
                  ✏️
                </button>
                <button
                  @click="deletePost(post.id)"
                  class="flex-1 px-3 py-1.5 rounded bg-gray-50 text-red-500 hover:bg-gray-100 transition-colors"
                  title="Delete post"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
          
          <!-- Post content -->
          <p class="text-gray-800 whitespace-pre-wrap">{{ post.content }}</p>

          <!-- Comment buttons section -->
          <div class="mt-4 border-t pt-4 flex gap-4">
            <!-- Direct Add Comment button -->
            <button
              @click="toggleQuickComment(post.id)"
              class="text-blue-500 hover:text-blue-600 text-sm font-medium flex items-center gap-1"
            >
              <span>Add Comment</span>
              <span class="text-xs" v-if="showQuickComment[post.id]">▼</span>
              <span class="text-xs" v-else>▶</span>
            </button>

            <!-- View Comments toggle button -->
            <button
              @click="toggleComments(post.id)"
              class="text-gray-600 hover:text-gray-900 text-sm font-medium flex items-center gap-1"
            >
              <span>View Comments ({{ post.comments?.length || 0 }})</span>
              <span class="text-xs" v-if="showComments[post.id]">▼</span>
              <span class="text-xs" v-else>▶</span>
            </button>
          </div>

          <!-- Quick Comment form -->
          <div v-if="showQuickComment[post.id] && !showComments[post.id]" class="mt-4">
            <form @submit.prevent="addComment(post.id)" class="space-y-2">
              <textarea
                v-model="newComments[post.id]"
                rows="2"
                placeholder="Write your comment..."
                class="w-full p-2 border rounded-lg resize-none"
                required
              ></textarea>
              <div class="flex justify-end">
                <button
                  type="submit"
                  class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                >
                  Post Comment
                </button>
              </div>
            </form>
          </div>

          <!-- Comments section -->
          <div v-if="showComments[post.id]" class="mt-4">
            <div class="mt-4 border-t pt-4">
              <h3 class="text-lg font-semibold mb-2">Comments</h3>
              
              <!-- Comments list -->
              <div v-if="post.comments?.length" class="space-y-4">
                <div v-for="comment in post.comments" :key="comment.id" class="p-4 border rounded-lg bg-white">
                  <div v-if="editingComment?.id === comment.id">
                    <textarea
                      v-model="editingComment.content"
                      class="w-full p-2 border rounded-lg resize-none h-16 mb-2"
                    />
                    <div class="flex gap-2">
                      <button
                        @click="updateComment(post.id, comment.id)"
                        class="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600"
                      >
                        Save
                      </button>
                      <button
                        @click="cancelCommentEdit"
                        class="bg-gray-500 text-white px-3 py-1 rounded-lg hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                  <div v-else>
                    <!-- Comment header -->
                    <div class="flex justify-between items-start">
                      <div>
                        <p class="font-medium text-gray-900">{{ comment.username }}</p>
                        <p class="text-sm text-gray-500">{{ formatDate(comment.createdAt) }}</p>
                      </div>
                      <div class="flex flex-col gap-2">
                        <!-- Comment Like/Dislike buttons -->
                        <div v-if="comment.userId !== currentUserId" class="flex gap-2 items-center">
                          <button 
                            @click="handleCommentLike(comment.id, 1)"
                            class="px-3 py-1.5 rounded transition-colors"
                            :class="{ 
                              'bg-blue-100 text-blue-600': comment.userLikeValue === 1,
                              'bg-gray-50 hover:bg-gray-100': comment.userLikeValue !== 1
                            }"
                          >
                            👍
                          </button>
                          <span class="font-medium" :class="{
                            'text-blue-600': comment.likeCount > 0,
                            'text-red-600': comment.likeCount < 0
                          }">
                            {{ comment.likeCount }}
                          </span>
                          <button 
                            @click="handleCommentLike(comment.id, -1)"
                            class="px-3 py-1.5 rounded transition-colors"
                            :class="{ 
                              'bg-red-100 text-red-600': comment.userLikeValue === -1,
                              'bg-gray-50 hover:bg-gray-100': comment.userLikeValue !== -1
                            }"
                          >
                            👎
                          </button>
                        </div>
                        <!-- Show rating for own comments -->
                        <div v-else class="text-center">
                          <span class="font-medium" :class="{
                            'text-blue-500': comment.likeCount > 0,
                            'text-red-500': comment.likeCount < 0
                          }">
                            Rating: {{ comment.likeCount }}
                          </span>
                        </div>
                        <!-- Edit/Delete buttons -->
                        <div v-if="comment.userId === currentUserId" class="flex gap-2">
                          <button
                            @click="startCommentEdit(comment)"
                            class="px-3 py-1.5 rounded bg-gray-50 text-blue-500 hover:bg-gray-100 transition-colors"
                            title="Edit comment"
                          >
                            ✏️
                          </button>
                          <button
                            @click="deleteComment(post.id, comment.id)"
                            class="px-3 py-1.5 rounded bg-gray-50 text-red-500 hover:bg-gray-100 transition-colors"
                            title="Delete comment"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                    <!-- Comment content -->
                    <p class="text-gray-800 whitespace-pre-wrap mt-2">{{ comment.content }}</p>
                  </div>
                </div>
              </div>

              <!-- Add comment button -->
              <button
                @click="toggleAddComment(post.id)"
                class="mt-4 text-blue-500 hover:text-blue-600 text-sm font-medium flex items-center gap-2"
              >
                <span>Add a comment</span>
                <span class="text-xs" v-if="showAddComment[post.id]">▼</span>
                <span class="text-xs" v-else>▶</span>
              </button>

              <!-- Add comment form -->
              <form 
                v-if="showAddComment[post.id]"
                @submit.prevent="addComment(post.id)" 
                class="mt-4"
              >
                <div class="space-y-2">
                  <textarea
                    v-model="newComments[post.id]"
                    rows="2"
                    placeholder="Write your comment..."
                    class="w-full p-2 border rounded-lg resize-none"
                    required
                  ></textarea>
                  <button
                    type="submit"
                    class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                  >
                    Post Comment
                  </button>
                </div>
              </form>
            </div>
          </div>
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

// Add reactive ref for tracking shown comments
const showComments = ref<Record<number, boolean>>({})

// Add reactive ref for tracking shown add comment forms
const showAddComment = ref<Record<number, boolean>>({})

// Add reactive ref for quick comment form
const showQuickComment = ref<Record<number, boolean>>({})

// Toggle comments visibility
const toggleComments = (postId: number) => {
  showComments.value[postId] = !showComments.value[postId]
  // Close quick comment if opening comments
  if (showComments.value[postId]) {
    showQuickComment.value[postId] = false
  }
}

// Toggle add comment form visibility
const toggleAddComment = (postId: number) => {
  showAddComment.value[postId] = !showAddComment.value[postId]
}

// Toggle quick comment form
const toggleQuickComment = (postId: number) => {
  showQuickComment.value[postId] = !showQuickComment.value[postId]
  // Close comments section if opening quick comment
  if (showQuickComment.value[postId]) {
    showComments.value[postId] = false
  }
}

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
  // Show comments section when adding a comment
  showComments.value[postId] = true
  
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
    // Reset and hide both forms after successful comment
    showQuickComment.value[postId] = false
    showAddComment.value[postId] = false
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

// Handle post likes with unified counter
const handleLike = async (postId: number, value: number) => {
  if (!posts.value) return
  const post = posts.value.find(p => p.id === postId)
  if (!post) return

  // Don't allow liking own posts
  if (post.userId === currentUserId.value) {
    return
  }

  // Get current user's like value
  const currentValue = post.userLikeValue || 0

  // If clicking same button, remove the like
  const newValue = currentValue === value ? 0 : value

  try {
    const response = await fetch(`${baseUrl}/api/likes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ postId, value: newValue }),
    })

    if (!response.ok) {
      const error = await response.json()
      if (error.message) {
        alert(error.message)
      }
      return
    }

    // Update local state
    post.userLikeValue = newValue
    const data = await response.json()
    post.likeCount = data.likeCount
  } catch (e) {
    console.error('Error handling like:', e)
  }
}

// Handle comment likes
const handleCommentLike = async (commentId: number, value: number) => {
  if (!posts.value) return
  
  // Find the comment in the posts
  let targetComment = null
  for (const post of posts.value) {
    const comment = post.comments.find(c => c.id === commentId)
    if (comment) {
      targetComment = comment
      break
    }
  }
  
  if (!targetComment || targetComment.userId === currentUserId.value) return

  // Get current user's like value
  const currentValue = targetComment.userLikeValue || 0

  // If clicking same button, remove the like
  const newValue = currentValue === value ? 0 : value

  try {
    const response = await fetch(`${baseUrl}/api/comments/likes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ commentId, value: newValue }),
    })

    if (!response.ok) {
      const error = await response.json()
      if (error.message) {
        alert(error.message)
      }
      return
    }

    // Update local state
    targetComment.userLikeValue = newValue
    const data = await response.json()
    targetComment.likeCount = data.likeCount
  } catch (e) {
    console.error('Error handling comment like:', e)
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
