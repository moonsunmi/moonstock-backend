import {Router} from 'express'

import authenticateUser from '../middlewares/authenticateUser'
import {getHoldings} from '../controllers/userControllers'

export const usersRouter = (...args: any[]) => {
  const router = Router()

  router.get('/holdings', authenticateUser, getHoldings)

  return router
}
