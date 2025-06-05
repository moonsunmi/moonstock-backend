import {Router} from 'express'
import multer from 'multer'

import authenticateUser from '../middlewares/authenticateUser'
import {getHoldings} from '../controllers/userControllers'

export const usersRouter = (...args: any[]) => {
  const router = Router()
  const upload = multer()

  router.get('/holdings', authenticateUser, getHoldings)

  return router
}
