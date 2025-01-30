import express from 'express'
import {initializeAPI} from './api'

const app = express()
const port = 3000

app.use(express.json())

initializeAPI(app)

// Server starten
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})