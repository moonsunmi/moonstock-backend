import {Router} from 'express'
import multer from 'multer'
import authenticateUser from '../middlewares/authenticateUser'
import {createAccount} from '../controllers/accountControllers'

export const accountsRouter = (...args: any[]) => {
  const router = Router()
  const upload = multer()

  // POST /accounts/create
  router.post('/create', upload.none(), authenticateUser, createAccount)

  return router
}
