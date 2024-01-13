import express from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.service'
import { defaultErrorHandler } from './middlewares/error.middewares'
import cookieParser from 'cookie-parser'
const app = express()
const port = 4000
databaseService.connect()

app.use(express.static('public'))
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use('/', usersRouter)
app.use(defaultErrorHandler)
app.listen(port, () => {
	console.log(`Example app listening on port ${port}`)
})
