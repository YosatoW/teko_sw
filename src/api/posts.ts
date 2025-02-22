import { type Express, type Request, type Response } from 'express'
import { and, eq, desc } from 'drizzle-orm';

import { db } from '../database';
import { postsTable, usersTable, commentsTable } from '../db/schema';

export const initializePostsAPI = (app: Express) => {
    // Update get posts to include all comments
    app.get('/api/posts', async (req: Request, res: Response) => {
        const posts = await db
            .select({
                id: postsTable.id,
                content: postsTable.content,
                userId: postsTable.userId,
                username: usersTable.username,
                createdAt: postsTable.createdAt,
            })
            .from(postsTable)
            .leftJoin(usersTable, eq(postsTable.userId, usersTable.id))
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
                    })
                    .from(commentsTable)
                    .leftJoin(usersTable, eq(commentsTable.userId, usersTable.id))
                    .where(eq(commentsTable.postId, post.id))
                    .orderBy(desc(commentsTable.createdAt))
                return { ...post, comments }
            })
        )
        res.send(postsWithComments)
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
    
    app.delete('/api/posts/:id', (req: Request, res: Response) => {
        const id = parseInt(req.params.id)
        const userId = req.user?.id
        if (!userId) {
            res.status(401).send({ error: 'Nicht authentifiziert' })
            return
        }
        db.delete(postsTable).where(and(eq(postsTable.id, id), eq(postsTable.userId, userId))).execute()
        res.send({ id })
    })
}