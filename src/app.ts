import express from 'express'
import cors from 'cors'

<<<<<<<<< Temporary merge branch 1
import {initializeAPI} from './api'
import { initializeMessageBroker } from './message-broker' // neue Zeile

=========
import { initializeAPI } from './api'
import { initializeMessageBroker } from './message-broker'
import { initializeCache } from './services/cache'
>>>>>>>>> Temporary merge branch 2

// Server initialisieren
export const SERVER_ROLE = process.env.SERVER_ROLE || 'all'
export const allowedServerRoles = [ 'all', 'api', 'worker' ]
if (!allowedServerRoles.includes(SERVER_ROLE)) {
    process.exit(1)
}

// for the worker server & api queue
initializeMessageBroker()

<<<<<<<<< Temporary merge branch 1
initializeAPI(app)

if (process.env.SERVER_ROLE !== 'worker') {
  initializeMessageBroker();
}


// initializeMessageBroker()  // neue Zeile

=========
// For the API server
if (SERVER_ROLE === 'all' || SERVER_ROLE === 'api') {
    const port = 3000
    const app = express()
    
    app.use(cors())
    app.use(express.json())
    
    initializeAPI(app)
    initializeCache()
>>>>>>>>> Temporary merge branch 2

    // Server starten
    app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
<<<<<<<<< Temporary merge branch 1
})
=========
    })
}
>>>>>>>>> Temporary merge branch 2
