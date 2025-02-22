import express from 'express'
import cors from 'cors'

import {initializeAPI} from './api'
<<<<<<< HEAD
import { initializeMessageBroker } from './message-broker' // neue Zeile
=======
import { initializeMessageBroker } from './message-broker'  // neue Zeile
>>>>>>> le10

const port = 3000
const app = express()

app.use(cors())
app.use(express.json())

initializeAPI(app)
<<<<<<< HEAD
if (process.env.SERVER_ROLE !== 'worker') {
  initializeMessageBroker();
}

=======
initializeMessageBroker()  // neue Zeile
>>>>>>> le10

// Server starten
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
