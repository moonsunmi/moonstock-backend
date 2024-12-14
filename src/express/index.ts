import express from 'express'
import cors from 'cors'
import {setupRouters} from './setupRouters'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'

export const createExpressApp = (...args: any[]) => {
  const app = express()
  var multer = require('multer')
  var upload = multer()

  app
    .use((req, res, next) => {
      // middleware
      console.log(`url: ${req.url} method: ${req.method}`)
      next()
    })
    .use(cookieParser())
    .use(express.json())
    .use(express.static('public'))
    .use(
      cors({
        origin: 'http://localhost:3000',
        credentials: true
      })
    )
    .get('/', (req, res) => {
      res.json({message: 'hi'})
    })
  return setupRouters(app, ...args)
}
