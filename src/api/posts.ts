import { type Express, type Request, type Response } from 'express'
import { and, eq, desc, asc, sql } from 'drizzle-orm';

import { db } from '../database';
import { postsTable, usersTable, commentsTable, likesTable } from '../db/schema';

export const initializePostsAPI = (app: Express) => {
    // Update get posts to include all comments
    app.get('/api/posts', async (req: Request, res: Response) => {
        try {
            const userId = req.user?.id
            const posts = await db
                .select({
                    id: postsTable.id,
                    content: postsTable.content,
                    userId: postsTable.userId,
                    username: usersTable.username,
                    createdAt: postsTable.createdAt,
                    likeCount: sql`COALESCE(SUM(${likesTable.value}), 0)::integer`,
                    userLikeValue: sql`MAX(CASE WHEN ${likesTable.userId} = ${userId} THEN ${likesTable.value} ELSE NULL END)::integer`
                })
                .from(postsTable)
                .leftJoin(usersTable, eq(postsTable.userId, usersTable.id))
                .leftJoin(likesTable, eq(postsTable.id, likesTable.postId))
                .groupBy(postsTable.id, usersTable.username)
                .orderBy(desc(postsTable.createdAt))

            // Fetch all comments for each post (removed approval filter)
            const postsWithComments = await Promise.all(
                posts.map(async (post) => {
                    const comments = await db
                        .select({
                            id: commentsTable.id,
                            content: commentsTable.content,
                            userId: commentsTable.userId,
                            username: usersTable.username,
                            createdAt: commentsTable.createdAt,
                            likeCount: sql`COALESCE(SUM(${likesTable.value}), 0)::integer`,
                            userLikeValue: sql`MAX(CASE WHEN ${likesTable.userId} = ${userId} THEN ${likesTable.value} ELSE NULL END)::integer`
                        })
                        .from(commentsTable)
                        .leftJoin(usersTable, eq(commentsTable.userId, usersTable.id))
                        .leftJoin(likesTable, eq(commentsTable.id, likesTable.commentId))
                        .where(eq(commentsTable.postId, post.id))
                        .groupBy(commentsTable.id, usersTable.username)
                        .orderBy(asc(commentsTable.createdAt)) // Changed to ascending order
                    return { ...post, comments }
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
        const newComment = await db
            .insert(commentsTable)
            .values({ 
                content, 
                userId, 
                postId
            })
            .returning()
        
        res.send(newComment[0])
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

        const updatedComment = await db
            .update(commentsTable)
            .set({ content: req.body.content })
            .where(and(
                eq(commentsTable.id, commentId),
                eq(commentsTable.userId, userId)
            ))
            .returning()
        
        res.send(updatedComment[0])
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
        const newPost = await db.insert(postsTable).values({ content, userId }).returning()
        res.send(newPost[0])
    })
    
    app.put('/api/posts/:id', async (req: Request, res: Response) => {
        const id = parseInt(req.params.id)
        const userId = req.user?.id
        if (!userId) {
            res.status(401).send({ error: 'Nicht authentifiziert' })
            return
        }
        const updatedPost = await db.update(postsTable).set(req.body).where(and(eq(postsTable.id, id), eq(postsTable.userId, userId))).returning()
        res.send(updatedPost[0])
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