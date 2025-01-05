import {Response, Router} from 'express'
import {Prisma, PrismaClient, TransactionStatus} from '@prisma/client'
import multer from 'multer'

import {AuthenticatedRequest} from '../types'

import authenticateUser from '../middlewares/authenticateUser'
import checkAuthorization from '../middlewares/checkAuthorization'
import {getDuration, getOpposite} from '../utils/helper'
import {
  createTransaction,
  deleteTransaction,
  getCompletedTransactions,
  getTradingTransactions,
  getTransaction,
  matchTransaction,
  postTransaction
} from '../controllers/transactionsControllers'

export const transactionsRouter = (...args: any[]) => {
  // << chatgpt 아래 내용 반영?
  const router = Router()
  const client = new PrismaClient()
  const upload = multer()

  router.post('/', upload.none(), authenticateUser, createTransaction)
  router.get('/:ticker/trading', authenticateUser, getTradingTransactions)
  router.get('/:ticker/done', authenticateUser, getCompletedTransactions)
  router.get('/:id', authenticateUser, getTransaction)
  router.put(
    '/match',
    upload.none(),
    authenticateUser,
    checkAuthorization,
    matchTransaction
  )
  router.put(
    '/:id',
    upload.none(),
    authenticateUser,
    checkAuthorization,
    postTransaction
  )
  router.delete('/:id', authenticateUser, checkAuthorization, deleteTransaction)

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

//     .delete(
//       '/:id',
//       authenticateUser,
//       checkAuthorization,
//       async (req: AuthenticatedRequest, res: Response) => {
//         try {
//           const {userId} = req

//           const {id} = req.params
//           if (!id) {
//             return res.status(400).json({message: 'id 필요합니다.'})
//           }

//           const deleted = await client.transaction.delete({
//             where: {id: id, userId: userId}
//           })

//           if (deleted) return res.status(200).json({transaction: deleted})
//         } catch (err) {
//           if (err instanceof Prisma.PrismaClientKnownRequestError) {
//             return res.json({
//               message: '데이터베이스 오류가 발생했습니다.'
//             })
//           }
//           console.error('알 수 없는 오류 발생:', err)
//           return res.status(500).json({
//             message: '서버 오류가 발생했습니다. 나중에 다시 시도해 주세요.'
//           })
//         }
//       }
//     )
// }
