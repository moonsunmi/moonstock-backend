import {Response, Router} from 'express'
import {Prisma, PrismaClient} from '@prisma/client'
import multer from 'multer'

import authenticateUser from '../middlewares/authenticateUser'
import {getHoldings} from '../controllers/userControllers'

export const usersRouter = (...args: any[]) => {
  const router = Router()
  const client = new PrismaClient()
  const upload = multer()

  router.get('/holdings', authenticateUser, getHoldings)

  return router
}
