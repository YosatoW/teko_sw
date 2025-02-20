import { type Express, type Request, type Response } from 'express';
import {eq} from 'drizzle-orm';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken' 

import {db} from '../database';
import {postsTable, usersTable} from '../db/schema';

const jwtSecret = process.env.JWT_SECRET || "supersecret123"


export const initializeAuthAPI = (app: Express) => {
    app.post('/api/auth/register', async (req: Request, res: Response) => {
        const { username, password } = req.body
        // Überprüfen, ob der Benutzername bereits existiert
        const existingUser = await db.select().from(usersTable).where(eq(usersTable.username, username))
        if (existingUser.length > 0) {  // Prüfen, ob das Array nicht leer ist
            res.status(400).send({ message: 'Ein Benutzer mit diesem Namen existiert bereits.' })
            return
        }
        const passwordHash = await bcrypt.hash(password, 10)
        const newUser = await db.insert(usersTable).values({ username, password: passwordHash }).returning()
        res.send({ id: newUser[0].id, username: newUser[0].username })
    })

    app.post('/api/auth/login', async (req: Request, res: Response) => {
        const { username, password } = req.body
        //Benutzer aus der Datenbank abrufen
        const existingUsers = await db.select().from(usersTable).where(eq(usersTable.username, username))
        if (!existingUsers.length) {
            res.status(401).send({error: 'Der Benutzername existiert nicht.' })
            return
        }
        const existingUser = existingUsers[0]
        const passwordMatch = await bcrypt.compare(password, existingUser.password)
        if (!passwordMatch) { 
            res.status(401).send({error: 'Falsches Passwort' })
            return
        } else {
            const token = jwt.sign({ id: existingUser.id, username: existingUser.username }, jwtSecret, { expiresIn: '1h' })
            res.send(token)            
        }
    }) 
}