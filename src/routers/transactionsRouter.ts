import {Response, Router} from 'express'
import {Prisma, PrismaClient} from '@prisma/client'
import multer from 'multer'

import {AuthenticatedRequest} from '../types'

import authenticateUser from '../middlewares/authenticateUser'
import {getDuration, getOpposite} from '../utils/helper'
import {
  createBuyTransaction,
  createSellTransaction,
  // deleteTransaction,
  getActiveTransactionsByTicker,
  getClosedTransactions,
  getTransaction
  // matchTransaction,
  // postTransaction
} from '../controllers/transactionsControllers'

// GET /transactions/buy/{buyTransactionId}
// 설명: 특정 매수 트랜잭션을 조회합니다.
// 매수 트랜잭션 수정

// PATCH /transactions/buy/{buyTransactionId}
// 설명: 특정 매수 트랜잭션을 수정합니다. (예: 매수 수량 변경)
// 매수 트랜잭션 삭제

// DELETE /transactions/buy/{buyTransactionId}
// 설명: 특정 매수 트랜잭션을 삭제합니다.

// GET /transactions/buy/{buyTransactionId}/sell
// 설명: 특정 매수 트랜잭션에 관련된 모든 매도 트랜잭션을 조회합니다.
// 매도 트랜잭션 조회 (개별)

// GET /sellTransactions/{sellTransactionId}
// 설명: 특정 매도 트랜잭션을 조회합니다.
// 매도 트랜잭션 수정

// -------- 두 가지 스타일 중 하나를 선택해야 함. ---------
// PATCH /sellTransactions/{sellTransactionId}
// 설명: 특정 매도 트랜잭션을 수정합니다. (예: 매도 수량, 가격 변경)
// PATCH /transactions/{buyTransactionId}/sell/{sellTransactionId}
// 매수 트랜잭션 ID와 매도 트랜잭션 ID를 모두 명시하여, 수정하고자 하는 매도 트랜잭션을 특정합니다.

// DELETE /sellTransactions/{sellTransactionId}
// 설명: 특정 매도 트랜잭션을 삭제합니다.
// 3. 기타 관련 API
// 매수 및 매도 트랜잭션 모두 조회

// GET /transactions/{userId}
// 설명: 사용자의 모든 매수 및 매도 트랜잭션을 조회합니다.
// 매수와 매도 트랜잭션을 함께 확인하려면, userId를 기준으로 전체 거래 내역을 조회하는 방식으로 사용할 수 있습니다.
// 특정 종목에 대한 매수/매도 트랜잭션 조회

// GET /stocks/{ticker}/transactions
// 설명: 특정 종목에 대한 매수 및 매도 트랜잭션을 조회합니다.

// PATCH /sellTransactions/{id}     // 매도 트랜잭션 수정

export const transactionsRouter = (...args: any[]) => {
  // << chatgpt 아래 내용 반영?
  const router = Router()
  const client = new PrismaClient()
  const upload = multer()

  router.post('/buy', upload.none(), authenticateUser, createBuyTransaction)
  router.post(
    '/:id/sell',
    upload.none(),
    authenticateUser,
    createSellTransaction
  )
  router.get('/:ticker/active', authenticateUser, getActiveTransactionsByTicker)
  router.get('/:ticker/closed', authenticateUser, getClosedTransactions)
  // router.get('/:id', authenticateUser, getTransaction)
  // router.patch(
  //   '/match',
  //   upload.none(),
  //   authenticateUser,
  //   // checkAuthorization,
  //   matchTransaction
  // )
  // router.put(
  //   '/:id',
  //   upload.none(),
  //   authenticateUser,
  //   // checkAuthorization,
  //   postTransaction
  // )
  // router.delete(
  //   '/:id',
  //   authenticateUser,
  //   //  checkAuthorization,
  //   deleteTransaction
  // )

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
