import { type Express, type Request, type Response } from 'express'
import { and, eq } from 'drizzle-orm';

import { db } from '../database';
import { postsTable, usersTable, commentsTable } from '../db/schema';

export const initializePostsAPI = (app: Express) => {
    // Update get posts to include approved comments
    app.get('/api/posts', async (req: Request, res: Response) => {
        const posts = await db
            .select({
                id: postsTable.id,
                content: postsTable.content,
                userId: postsTable.userId,
                username: usersTable.username,
            })
            .from(postsTable)
            .leftJoin(usersTable, eq(postsTable.userId, usersTable.id))

        // Fetch approved comments for each post
        const postsWithComments = await Promise.all(
            posts.map(async (post) => {
                const comments = await db
                    .select({
                        id: commentsTable.id,
                        content: commentsTable.content,
                        userId: commentsTable.userId,
                        username: usersTable.username,
                        approved: commentsTable.approved,
                    })
                    .from(commentsTable)
                    .leftJoin(usersTable, eq(commentsTable.userId, usersTable.id))
                    .where(and(
                        eq(commentsTable.postId, post.id),
                        eq(commentsTable.approved, true)
                    ))
                return { ...post, comments }
            })
        )
        res.send(postsWithComments)
    })

    // Get pending comments for a post
    app.get('/api/posts/:id/pending-comments', async (req: Request, res: Response) => {
        const postId = parseInt(req.params.id)
        const userId = req.user?.id
        
        if (!userId) {
            res.status(401).send({ error: 'Not authenticated' })
            return
        }

        const post = await db.select().from(postsTable).where(eq(postsTable.id, postId))
        if (post[0].userId !== userId) {
            res.status(403).send({ error: 'Not authorized' })
            return
        }

        const pendingComments = await db
            .select({
                id: commentsTable.id,
                content: commentsTable.content,
                userId: commentsTable.userId,
                username: usersTable.username,
            })
            .from(commentsTable)
            .leftJoin(usersTable, eq(commentsTable.userId, usersTable.id))
            .where(and(
                eq(commentsTable.postId, postId),
                eq(commentsTable.approved, false)
            ))
        
        res.send(pendingComments)
    })

    // Add comment to post
    app.post('/api/posts/:id/comments', async (req: Request, res: Response) => {
        const postId = parseInt(req.params.id)
        const userId = req.user?.id
        if (!userId) {
            res.status(401).send({ error: 'Not authenticated' })
            return
        }

        const { content } = req.body
        const post = await db.select().from(postsTable).where(eq(postsTable.id, postId))
        
        // Auto-approve if comment is from post owner
        const isPostOwner = post[0].userId === userId
        
        const newComment = await db
            .insert(commentsTable)
            .values({ 
                content, 
                userId, 
                postId, 
                approved: isPostOwner 
            })
            .returning()
        
        res.send(newComment[0])
    })

    // Update comment
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

    // Delete comment
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

    // Approve comment
    app.put('/api/posts/:postId/comments/:commentId/approve', async (req: Request, res: Response) => {
        const postId = parseInt(req.params.postId)
        const commentId = parseInt(req.params.commentId)
        const userId = req.user?.id

        if (!userId) {
            res.status(401).send({ error: 'Not authenticated' })
            return
        }

        const post = await db.select().from(postsTable).where(eq(postsTable.id, postId))
        if (post[0].userId !== userId) {
            res.status(403).send({ error: 'Not authorized' })
            return
        }

        const approvedComment = await db
            .update(commentsTable)
            .set({ approved: true })
            .where(eq(commentsTable.id, commentId))
            .returning()
        
        res.send(approvedComment[0])
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