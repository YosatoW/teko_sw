import type {Express, Request, Response} from 'express'

import {db} from './database';
import {postsTable} from './db/schema';
import {eq} from 'drizzle-orm';

export const initializeAPI = (app: Express) => {


app.get('/api/posts', async (req: Request, res: Response) => {
    const posts = await db.select().from(postsTable)
    res.send(posts)
})

app.post('/api/posts', async (req: Request, res: Response) => {
    const newPost = await
    db.insert(postsTable).values(req.body).returning()
    res.send(newPost[0])
})

app.put('/api/posts/:id', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    const updatedPost = await
    db.update(postsTable).set(req.body).where(eq(postsTable.id,
    id)).returning()
    res.send(updatedPost[0])
})

app.delete('/api/posts/:id', (req: Request, res: Response) => {
    const id = parseInt(req.params.id)
    db.delete(postsTable).where(eq(postsTable.id, id)).execute()
    res.send({ id })
})
}