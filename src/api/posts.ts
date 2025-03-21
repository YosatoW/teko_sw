import { type Express, type Request, type Response } from 'express'
import { and, eq, desc, asc, sql } from 'drizzle-orm';

import { db } from '../database';
import { postsTable, usersTable, commentsTable, likesTable } from '../db/schema';
import { sentimentQueue, commentSentimentQueue } from '../message-broker'

export const initializePostsAPI = (app: Express) => {
    // Update get posts to include all comments
    app.get('/api/posts', async (req: Request, res: Response) => {
        try {
            const userId = req.user?.id
    
            // Get posts with like counts using Drizzle functions
            const posts = await db
                .select({
                    id: postsTable.id,
                    content: postsTable.content,
                    userId: postsTable.userId,
                    username: usersTable.username,
                    createdAt: postsTable.createdAt,
                    sentiment: postsTable.sentiment,
                    correction: postsTable.correction,
                    likeCount: () => count(likesTable.value),
                    userLikeValue: likesTable.value
                })
                .from(postsTable)
                .leftJoin(usersTable, eq(postsTable.userId, usersTable.id))
                .leftJoin(likesTable, and(
                    eq(postsTable.id, likesTable.postId),
                    eq(likesTable.userId, userId ?? 0)
                ))
                .groupBy(postsTable.id, usersTable.username, likesTable.value)
                .orderBy(desc(postsTable.createdAt))
    
            // Filter out hate speech posts from other users
            const filteredPosts = posts.filter(post => 
                post.sentiment !== 'hate_speech' || post.userId === userId
            )
    
            // Fetch comments for each post
            const postsWithComments = await Promise.all(
                filteredPosts.map(async (post) => {
                    const comments = await db
                        .select({
                            id: commentsTable.id,
                            content: commentsTable.content,
                            userId: commentsTable.userId,
                            username: usersTable.username,
                            createdAt: commentsTable.createdAt,
                            sentiment: commentsTable.sentiment,
                            correction: commentsTable.correction,
                            likeCount: () => count(likesTable.value),
                            userLikeValue: likesTable.value
                        })
                        .from(commentsTable)
                        .leftJoin(usersTable, eq(commentsTable.userId, usersTable.id))
                        .leftJoin(likesTable, and(
                            eq(commentsTable.id, likesTable.commentId),
                            eq(likesTable.userId, userId ?? 0)
                        ))
                        .where(eq(commentsTable.postId, post.id))
                        .groupBy(commentsTable.id, usersTable.username, likesTable.value)
                        .orderBy(asc(commentsTable.createdAt))
    
                    // Filter out hate speech comments from other users
                    const filteredComments = comments.filter(comment =>
                        comment.sentiment !== 'hate_speech' || comment.userId === userId
                    )
    
                    return { ...post, comments: filteredComments }
                })
            )
            
            res.send(postsWithComments)
        } catch (error) {
            console.error('Error fetching posts:', error)
            res.status(500).send({ error: 'Failed to fetch posts' })
        }
    })

    // Add comment to post (simplified - removed approval logic)
    app.post('/api/posts/:id/comments', async (req: Request, res: Response) => {
        const postId = parseInt(req.params.id)
        const userId = req.user?.id
        if (!userId) {
            res.status(401).send({ error: 'Not authenticated' })
            return
        }

        const { content } = req.body

        try {
            const newComment = await db
                .insert(commentsTable)
                .values({ 
                    content, 
                    userId, 
                    postId
                })
                .returning()

            // Create sentiment analysis job for new comment
            await commentSentimentQueue.add('analyze', {
                commentId: newComment[0].id
            }, {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 1000
                }
            })
            
            res.send(newComment[0])
        } catch (error) {
            console.error('Error creating comment:', error)
            res.status(500).send({ error: 'Failed to create comment' })
        }
    })

    // Update like/dislike endpoint
    app.post('/api/likes', async (req: Request, res: Response) => {
        const userId = req.user?.id
        if (!userId) {
            res.status(401).send({ error: 'Not authenticated' })
            return
        }

        const { postId, value } = req.body // value: 1 for like, -1 for dislike, 0 to remove

        try {
            // Check if user is trying to like their own post
            const post = await db
                .select()
                .from(postsTable)
                .where(eq(postsTable.id, postId))
                .limit(1)

            if (!post.length || post[0].userId === userId) {
                res.status(400).send({ error: 'Cannot like your own post' })
                return
            }

            // Remove existing like/dislike
            await db.delete(likesTable)
                .where(and(
                    eq(likesTable.userId, userId),
                    eq(likesTable.postId, postId)
                ))

            // Add new like/dislike if value is not 0
            if (value !== 0) {
                await db.insert(likesTable)
                    .values({ userId, postId, value })
                    .returning()
            }

            // Get updated count
            const [updated] = await db
                .select({
                    likeCount: sql`COALESCE(SUM(${likesTable.value}), 0)::integer`
                })
                .from(likesTable)
                .where(eq(likesTable.postId, postId))

            res.send(updated)
        } catch (error) {
            console.error('Error handling like:', error)
            res.status(500).send({ error: 'Failed to process like' })
        }
    })

    // Add comment like endpoint
    app.post('/api/comments/likes', async (req: Request, res: Response) => {
        const userId = req.user?.id
        if (!userId) {
            res.status(401).send({ error: 'Not authenticated' })
            return
        }

        const { commentId, value } = req.body

        try {
            // Check if user is trying to like their own comment
            const comment = await db
                .select()
                .from(commentsTable)
                .where(eq(commentsTable.id, commentId))
                .limit(1)

            if (!comment.length || comment[0].userId === userId) {
                res.status(400).send({ error: 'Cannot like your own comment' })
                return
            }

            // Remove existing like
            await db.delete(likesTable)
                .where(and(
                    eq(likesTable.userId, userId),
                    eq(likesTable.commentId, commentId)
                ))

            // Add new like if value is not 0
            if (value !== 0) {
                await db.insert(likesTable)
                    .values({ userId, commentId, value })
                    .returning()
            }

            // Get updated count
            const [updated] = await db
                .select({
                    likeCount: sql`COALESCE(SUM(${likesTable.value}), 0)::integer`
                })
                .from(likesTable)
                .where(eq(likesTable.commentId, commentId))

            res.send(updated)
        } catch (error) {
            console.error('Error handling comment like:', error)
            res.status(500).send({ error: 'Failed to process like' })
        }
    })

    // Keep existing CRUD operations for posts and comments...
    app.put('/api/posts/:postId/comments/:commentId', async (req: Request, res: Response) => {
        const commentId = parseInt(req.params.commentId)
        const userId = req.user?.id

        if (!userId) {
            res.status(401).send({ error: 'Not authenticated' })
            return
        }

        try {
            const updatedComment = await db
                .update(commentsTable)
                .set({ content: req.body.content })
                .where(and(
                    eq(commentsTable.id, commentId),
                    eq(commentsTable.userId, userId)
                ))
                .returning()

            // Create new sentiment analysis job for updated comment
            await commentSentimentQueue.add('analyze', {
                commentId: commentId
            }, {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 1000
                }
            })
            
            res.send(updatedComment[0])
        } catch (error) {
            console.error('Error updating comment:', error)
            res.status(500).send({ error: 'Failed to update comment' })
        }
    })

    app.delete('/api/posts/:postId/comments/:commentId', async (req: Request, res: Response) => {
        const commentId = parseInt(req.params.commentId)
        const userId = req.user?.id

        if (!userId) {
            res.status(401).send({ error: 'Not authenticated' })
            return
        }

        await db
            .delete(commentsTable)
            .where(and(
                eq(commentsTable.id, commentId),
                eq(commentsTable.userId, userId)
            ))
        
        res.send({ id: commentId })
    })

    app.post('/api/posts', async (req: Request, res: Response) => {
        const userId = req.user?.id // Versucht die ID des auth-User aus dem "req.user" zu extrahieren.
        if (!userId) {
            res.status(401).send({ error: 'Nicht authentifiziert' })
            return
        }
        // der content aus dem req.body extrahiert. Dies ist der Inhalt des neuen Beitrags in der Datenbank.
        const { content } = req.body
        try {
            const newPost = await db.insert(postsTable).values({ content, userId }).returning()
            
            // Create sentiment analysis job
            await sentimentQueue.add('analyze', {
                postId: newPost[0].id
            }, {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 1000
                }
            })

            res.send(newPost[0])
        } catch (error) {
            console.error('Error creating post:', error)
            res.status(500).send({ error: 'Failed to create post' })
        }
    })
    
    app.put('/api/posts/:id', async (req: Request, res: Response) => {
        const id = parseInt(req.params.id)
        const userId = req.user?.id
        if (!userId) {
            res.status(401).send({ error: 'Nicht authentifiziert' })
            return
        }
        try {
            const updatedPost = await db.update(postsTable).set(req.body).where(and(eq(postsTable.id, id), eq(postsTable.userId, userId))).returning()

            // Create new sentiment analysis job for updated content
            await sentimentQueue.add('analyze', {
                postId: id
            }, {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 1000
                }
            })

            res.send(updatedPost[0])
        } catch (error) {
            console.error('Error updating post:', error)
            res.status(500).send({ error: 'Failed to update post' })
        }
    })
    
    app.delete('/api/posts/:id', async (req: Request, res: Response) => {
        const id = parseInt(req.params.id)
        const userId = req.user?.id
        if (!userId) {
            res.status(401).send({ error: 'Nicht authentifiziert' })
            return
        }
        
        try {
            await db.delete(postsTable)
                .where(and(eq(postsTable.id, id), eq(postsTable.userId, userId)))
                .execute()
            res.status(200).send({ id })
        } catch (error) {
            console.error('Error deleting post:', error)
            res.status(500).send({ error: 'Failed to delete post' })
        }
    })
}