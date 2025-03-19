import express from 'express'
import cors from 'cors'

import { initializeAPI } from './api'
import { initializeMessageBroker } from './message-broker'
import { initializeCache } from './services/cache'
import { logger } from './services/logger'

// Server initialisieren
export const SERVER_ROLE = process.env.SERVER_ROLE || 'all'
export const allowedServerRoles = [ 'all', 'api', 'worker' ]
if (!allowedServerRoles.includes(SERVER_ROLE)) {
    process.exit(1)
}

// for the worker server & api queue
initializeMessageBroker()
initializeCache()

// For the API server
if (SERVER_ROLE === 'all' || SERVER_ROLE === 'api') {
    const port = 3000
    const app = express()
    
    // Trust first proxy
    app.set('trust proxy', 1)
    
    app.use(cors())
    app.use(express.json())
    
    // Debug endpoint to verify IP handling
    app.get('/ip', (req, res) => {
        res.send({
            ip: req.ip,
            ips: req.ips,
            forwarded: req.headers['x-forwarded-for']
        })
    })
    
    initializeAPI(app)

    // Server starten
    app.listen(port, () => {
        logger.info(`Example app listening on port ${port}`)
    })
}