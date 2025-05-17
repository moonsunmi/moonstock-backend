import {Response, Router} from 'express'
import {Prisma, PrismaClient} from '@prisma/client'
import multer from 'multer'

import {AuthenticatedRequest} from '../types'

import authenticateUser from '../middlewares/authenticateUser'
import {getDuration, getOpposite} from '../utils/helper'
import {
  createTrade,
  matchTrade,
  updateTrade
} from '../controllers/tradeControllers'

// /trade
export const tradeRouter = (...args: any[]) => {
  // << chatgpt 아래 내용 반영?
  const router = Router()
  const client = new PrismaClient()
  const upload = multer()

  router.post('/create', upload.none(), authenticateUser, createTrade)
  router.post('/match', upload.none(), authenticateUser, matchTrade)
  router.put(
    '/:id/update',
    upload.none(),
    authenticateUser,
    // checkAuthorization, 권한이 있는지 확인하는 것.
    updateTrade
  )

  // router.get('/:ticker/active', authenticateUser, getActiveTransactionsByTicker)
  // router.get('/:ticker/closed', authenticateUser, getClosedTransactions)
  // router.get('/:id', authenticateUser, getTransaction)
  // router.put(
  //   '/sell/:id',
  //   upload.none(),
  //   authenticateUser,
  //   // checkAuthorization,
  //   updateSellTransaction
  // )
  router.delete(
    '/buy/:id',
    authenticateUser
    //  checkAuthorization,
    // deleteBuyTransaction
  )
  router.delete(
    '/sell/:id',
    authenticateUser
    //  checkAuthorization,
    // deleteSellTransaction
  )

  return router
}

/*
chat gtp:


코드가 전반적으로 잘 작성되어 있고, CustomError를 활용한 에러 핸들링도 깔끔하네!
하지만 몇 가지 타입 안전성과 가독성을 개선할 부분이 보여.

2. transactionsRouter - args 타입 명시
현재 (...args: any[])로 작성돼 있어서 타입 안정성이 부족해.
라우터 생성에 필요한 파라미터 타입을 명시하는 게 더 안전해.

import {RequestHandler} from 'express'

// args에 정확한 타입을 명시
export const transactionsRouter = (middlewares: RequestHandler[] = []) => {
  const router = Router()
  const client = new PrismaClient()
  const upload = multer()

  // middlewares를 사용해 라우터 구성
  router.post('/', upload.none(), authenticateUser, ...middlewares, createTransaction)

  return router
}

*/
