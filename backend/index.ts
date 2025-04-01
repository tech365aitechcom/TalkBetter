import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import ErrorMiddleware from '@/middlewares/ErrorMiddleware'

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(
  cors({
    origin: [process.env.FRONTEND_URL as string],
    credentials: true,
  })
)

app.use(ErrorMiddleware)

const PORT = process.env.PORT || 4000

app.listen(PORT, () => {
  console.log(`server running: http://localhost:${PORT}`)
})
