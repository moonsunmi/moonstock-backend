import {Router} from 'express'
import authenticateUser from '../middlewares/authenticateUser'
import {createAccount} from '../controllers/accountControllers'

export const accountsRouter = (...args: any[]) => {
  const router = Router()

  // POST /accounts/create
  router.post('/create', authenticateUser, createAccount)

  return router
}
