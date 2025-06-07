import {Router} from 'express'

import authenticateUser from '../middlewares/authenticateUser'
import {
  createTrade,
  getMatchedByTicker,
  getTradingByTicker,
  matchTrade,
  updateTrade
} from '../controllers/tradeControllers'

// /trade
export const tradeRouter = (...args: any[]) => {
  // << chatgpt 아래 내용 반영?
  const router = Router()

  router.post('/create', authenticateUser, createTrade)
  router.post('/match', authenticateUser, matchTrade)
  router.put('/:id/update', authenticateUser, updateTrade)
  router.get('/:ticker/trading', authenticateUser, getTradingByTicker)
  router.get('/:ticker/matched', authenticateUser, getMatchedByTicker)

  // router.get('/:ticker/closed', authenticateUser, getClosedTransactions)
  // router.get('/:id', authenticateUser, getTransaction)
  // router.put(
  //   '/sell/:id',
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

  // middlewares를 사용해 라우터 구성
  router.post('/', authenticateUser, ...middlewares, createTransaction)

  return router
}

*/
