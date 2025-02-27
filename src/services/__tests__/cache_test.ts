import { describe, it, expect, beforeEach, afterEach } from 'bun:test'
import { initializeCache, getPosts, invalidateCache } from '../cache'
import { db } from '../../database'

// Add proper types
interface Post {
  content: string
  correction: string
  createdAt: Date | string
  id: number
  sentiment: string
  userId: number
}

interface User {
  id: number
  username: string
  password: string
}

interface PostWithUser {
  posts: Post
  users: User
}

describe('Cache Service', () => {
  const originalCacheActive = process.env.CACHE_ACTIVE

  beforeEach(async () => {
    await initializeCache()
    await invalidateCache()
  })

  afterEach(() => {
    process.env.CACHE_ACTIVE = originalCacheActive
  })

  describe('With Cache Active', () => {
    beforeEach(() => {
      process.env.CACHE_ACTIVE = 'true'
    })

    it('should cache posts on first request', async () => {
      const firstCall = await getPosts()
      const secondCall = await getPosts()
      
      const normalizeData = (data: PostWithUser[]) => {
        return data.map(item => ({
          ...item,
          posts: {
            ...item.posts,
            createdAt: new Date(item.posts.createdAt).toISOString()
          }
        }))
      }
      
      expect(normalizeData(firstCall)).toEqual(normalizeData(secondCall))
    })

    it('should return same data structure from cache and database', async () => {
      const dbCall = await getPosts()
      process.env.CACHE_ACTIVE = 'true'
      const cacheCall = await getPosts()

      expect(Object.keys(dbCall[0])).toEqual(Object.keys(cacheCall[0]))
      expect(Object.keys(dbCall[0].posts)).toEqual(Object.keys(cacheCall[0].posts))
    })
  })

  describe('With Cache Inactive', () => {
    beforeEach(() => {
      process.env.CACHE_ACTIVE = 'false'
    })

    it('should always fetch from database', async () => {
      const firstCall = await getPosts()
      const secondCall = await getPosts()
      expect(firstCall).toBeDefined()
      expect(secondCall).toBeDefined()
      expect(Array.isArray(firstCall)).toBe(true)
      expect(Array.isArray(secondCall)).toBe(true)
    })
  })
})