import express from 'express'
import cors from 'cors'

import {initializeAPI} from './api'
import { initializeMessageBroker } from './message-broker'  // neue Zeile

const port = 3000
const app = express()

app.use(cors())
app.use(express.json())

initializeAPI(app)
initializeMessageBroker()  // neue Zeile

// Server starten
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})