import { desc, eq } from 'drizzle-orm'
import { db } from '../database'
import { postsTable, usersTable, commentsTable, likesTable } from '../db/schema'
import IORedis from 'ioredis'

const CACHE_ACTIVE = (process.env.CACHE_ACTIVE || 'true') === 'true'

let redis: IORedis

// Add initialization in app.ts
export const initializeCache = async () => {
  if (redis || !CACHE_ACTIVE) return
  console.log('Initializing Redis Cache...')
  redis = new IORedis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    maxRetriesPerRequest: null,
  })
  console.log('Redis Cache initialized')
}

type Posts = Awaited<ReturnType<typeof getPostsFromDB>>
type Users = Awaited<ReturnType<typeof getUsersFromDB>>
type Comments = Awaited<ReturnType<typeof getCommentsFromDB>>
type Likes = Awaited<ReturnType<typeof getLikesFromDB>>

export const getPosts = async (userId?: number) => {
  // 1. Check if Cache is active
  if (!CACHE_ACTIVE || !redis) {
    return getPostsFromDB()
  }

  try {
    // 2. Try to get posts from cache
    const cachedPosts = await getPostsFromCache()
    if (cachedPosts) {
      return cachedPosts
    }

    // 2.2 If not in cache, get from database
    const posts = await getPostsFromDB()
    
    // 2.3 Store in cache
    await setPostsInCache(posts)
    
    return posts
  } catch (error) {
    console.error('Cache error, falling back to database:', error)
    return getPostsFromDB()
  }
}

const getPostsFromCache = async () => {
  try {
    const cached = await redis.get('posts')
    if (cached) {
      return JSON.parse(cached) as Posts
    }
    return null
  } catch (error) {
    console.error('Error getting posts from cache:', error)
    return null
  }
}

const getPostsFromDB = async () => {
  const posts = await db
    .select()
    .from(postsTable)
    .leftJoin(usersTable, eq(postsTable.userId, usersTable.id))
    .orderBy(desc(postsTable.createdAt))

  return posts
}

const setPostsInCache = async (posts: Posts) => {
  try {
    await redis.set('posts', JSON.stringify(posts), 'EX', 300) // Cache for 5 minutes
  } catch (error) {
    console.error('Error setting posts in cache:', error)
  }
}

export const getUsers = async () => {
  if (!CACHE_ACTIVE || !redis) {
    return getUsersFromDB()
  }

  try {
    const cached = await getUsersFromCache()
    if (cached) return cached
    
    const users = await getUsersFromDB()
    await setUsersInCache(users)
    return users
  } catch (error) {
    console.error('Users cache error:', error)
    return getUsersFromDB()
  }
}

const getUsersFromCache = async () => {
  try {
    const cached = await redis.get('users')
    return cached ? JSON.parse(cached) as Users : null
  } catch (error) {
    console.error('Error getting users from cache:', error)
    return null
  }
}

const getUsersFromDB = async () => {
  return db.select().from(usersTable)
}

const setUsersInCache = async (users: Users) => {
  try {
    await redis.set('users', JSON.stringify(users), 'EX', 300)
  } catch (error) {
    console.error('Error caching users:', error)
  }
}

export const getComments = async () => {
  if (!CACHE_ACTIVE || !redis) {
    return getCommentsFromDB()
  }

  try {
    const cached = await getCommentsFromCache()
    if (cached) return cached
    
    const comments = await getCommentsFromDB()
    await setCommentsInCache(comments)
    return comments
  } catch (error) {
    console.error('Comments cache error:', error)
    return getCommentsFromDB()
  }
}

const getCommentsFromCache = async () => {
  try {
    const cached = await redis.get('comments')
    return cached ? JSON.parse(cached) as Comments : null
  } catch (error) {
    console.error('Error getting comments from cache:', error)
    return null
  }
}

const getCommentsFromDB = async () => {
  return db.select().from(commentsTable)
    .leftJoin(usersTable, eq(commentsTable.userId, usersTable.id))
    .orderBy(desc(commentsTable.createdAt))
}

const setCommentsInCache = async (comments: Comments) => {
  try {
    await redis.set('comments', JSON.stringify(comments), 'EX', 300)
  } catch (error) {
    console.error('Error caching comments:', error)
  }
}

export const getLikes = async () => {
  if (!CACHE_ACTIVE || !redis) {
    return getLikesFromDB()
  }

  try {
    const cached = await getLikesFromCache()
    if (cached) return cached
    
    const likes = await getLikesFromDB()
    await setLikesInCache(likes)
    return likes
  } catch (error) {
    console.error('Likes cache error:', error)
    return getLikesFromDB()
  }
}

const getLikesFromCache = async () => {
  try {
    const cached = await redis.get('likes')
    return cached ? JSON.parse(cached) as Likes : null
  } catch (error) {
    console.error('Error getting likes from cache:', error)
    return null
  }
}

const getLikesFromDB = async () => {
  return db.select().from(likesTable)
}

const setLikesInCache = async (likes: Likes) => {
  try {
    await redis.set('likes', JSON.stringify(likes), 'EX', 300)
  } catch (error) {
    console.error('Error caching likes:', error)
  }
}

export const invalidateCache = async () => {
  if (!CACHE_ACTIVE || !redis) return
  try {
    await Promise.all([
      redis.del('posts'),
      redis.del('users'),
      redis.del('comments'),
      redis.del('likes')
    ])
    console.log('Cache invalidated for all tables')
  } catch (error) {
    console.error('Error invalidating cache:', error)
  }
}

export const invalidatePostsCache = async () => {
  if (!CACHE_ACTIVE || !redis) return
  try {
    console.log('invalidating posts cache...')
    await redis.del('posts')
  } catch (error) {
    console.error('Error invalidating posts cache:', error)
  }
}