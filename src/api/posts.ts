import { type Express, type Request, type Response } from 'express'
import { and, eq } from 'drizzle-orm';

import { db } from '../database';
import { postsTable, usersTable } from '../db/schema';

export const initializePostsAPI = (app: Express) => {
    app.get('/api/posts', async (req: Request, res: Response) => {
        const posts = await db
            .select({
                id: postsTable.id,
                content: postsTable.content,
                userId: postsTable.userId,
                username: usersTable.username
            })
            .from(postsTable)
            .leftJoin(usersTable, eq(postsTable.userId, usersTable.id))
        res.send(posts)
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