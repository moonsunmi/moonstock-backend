import {Response, Router} from 'express'
import {Prisma, PrismaClient, TransactionStatus} from '@prisma/client'
import multer from 'multer'

import {AuthenticatedRequest} from '../types'

import authenticateUser from '../middlewares/authenticateUser'
import checkAuthorization from '../middlewares/checkAuthorization'
import {getDuration, getOpposite} from '../utils/helper'
import {
  createTransaction,
  getCompletedTransactions,
  getTradingTransactions,
  getTransaction
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

//     .put(
//       '/match',
//       upload.none(),
//       authenticateUser,
//       checkAuthorization,
//       async (req: AuthenticatedRequest, res: Response) => {
//         try {
//           const {
//             parsedMatchIds,
//             buyPrice,
//             sellPrice,
//             type,
//             buyCreatedAt,
//             sellCreatedAt
//           } = req.body

//           if (!Array.isArray(parsedMatchIds) || parsedMatchIds.length === 0) {
//             return res.status(400).json({error: '매칭할 Id가 없습니다.'})
//           }
//           let data
//           if (!type) {
//             return res.status(400).json({
//               errorCode: 'ERROR_CODE_TYPE_INVALID',
//               message: `type은 필수입니다. 유효 type값: buy, sell`
//             })
//           } else if (type.toLowerCase() === 'buy') {
//             if (!buyPrice || !buyCreatedAt) {
//               return res.status(400).json({
//                 message:
//                   '매수 필수 값이 누락되었습니다. (필수: buyPrice, buyCreatedAt)'
//               })
//             }
//             data = {
//               buyPrice: parseFloat(buyPrice),
//               buyCreatedAt: new Date(buyCreatedAt)
//             }
//           } else if (type.toLowerCase() === 'sell') {
//             if (!sellPrice || !sellCreatedAt) {
//               return res.status(400).json({
//                 message:
//                   '매도 필수 값이 누락되었습니다. (필수: sellPrice, sellCreatedAt)'
//               })
//             }
//             data = {
//               sellPrice: parseFloat(sellPrice),
//               sellCreatedAt: new Date(sellCreatedAt)
//             }
//           } else {
//             return res.status(404).json({
//               errorCode: 'ERROR_CODE_TYPE_INVALID',
//               message: `${type}은 유효하지 않은 type입니다. (buy or sell)`
//             })
//           }

//           const updatedTransactions = await Promise.all(
//             parsedMatchIds.map(async id => {
//               const transaction = await client.transaction.findUnique({
//                 where: {id}
//               })

//               if (
//                 !transaction ||
//                 type !== getOpposite(transaction.partiallyDone)
//               ) {
//                 return res.status(400).json({
//                   errorCode: 'ERROR_CODE_TYPE_INVALID',
//                   message: `반대 타입의 거래만 매칭할 수 있습니다. (SELL - BUY)`
//                 })
//               }

//               let calculatedData
//               if (type === 'BUY') {
//                 if (!transaction?.sellCreatedAt) {
//                   throw new Error(
//                     'sellCreatedAt 값이 존재하지 않습니다. 매칭 불가'
//                   )
//                 }

//                 const duration = getDuration(
//                   new Date(transaction.sellCreatedAt),
//                   new Date(buyCreatedAt)
//                 )
//                 const profit = (transaction.sellPrice ?? 0) - buyPrice
//                 const rateOfProfit = profit / buyPrice
//                 const rateOfProfitYear =
//                   (1 + rateOfProfit) ** (365 / duration) - 1
//                 calculatedData = {
//                   duration,
//                   profit,
//                   rateOfProfit,
//                   rateOfProfitYear
//                 }
//               } else if (type === 'SELL') {
//                 if (!transaction?.buyCreatedAt) {
//                   throw new Error(
//                     'buyCreatedAt 값이 존재하지 않습니다. 매칭 불가'
//                   )
//                 }
//                 const duration = getDuration(
//                   new Date(sellCreatedAt),
//                   new Date(transaction.buyCreatedAt)
//                 )
//                 const profit = sellPrice - (transaction.buyPrice ?? 0)
//                 const rateOfProfit = profit / (transaction.buyPrice ?? 1)
//                 const rateOfProfitYear =
//                   (1 + rateOfProfit) ** (365 / duration) - 1
//                 calculatedData = {
//                   duration,
//                   profit,
//                   rateOfProfit,
//                   rateOfProfitYear
//                 }
//               }

//               const updatedTransaction = await client.transaction.update({
//                 where: {id},
//                 data: {
//                   ...data,
//                   ...calculatedData,
//                   partiallyDone: TransactionStatus.DONE
//                 }
//               })

//               return updatedTransaction
//             })
//           )
//           return res.status(200).json({transactions: updatedTransactions})
//         } catch (err) {
//           if (err instanceof Prisma.PrismaClientKnownRequestError) {
//             console.log(err)

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
//     .put(
//       '/:id',
//       upload.none(),
//       authenticateUser,
//       checkAuthorization,
//       async (req: AuthenticatedRequest, res: Response) => {
//         try {
//           const {userId} = req
//           const {id} = req.params

//           const {quantity, buyPrice, sellPrice} = req.body
//           const data = {
//             quantity: parseFloat(quantity),
//             buyPrice: parseFloat(buyPrice),
//             sellPrice: parseFloat(sellPrice)
//           }

//           if (!data.quantity || data.quantity <= 0) {
//             return res
//               .status(400)
//               .json({message: '거래 수량은 1 이상이어야 합니다.'})
//           }

//           if (data.buyPrice && data.buyPrice < 0) {
//             return res
//               .status(400)
//               .json({message: '구매 가격은 0보다 커야 합니다.'})
//           }

//           if (data.sellPrice && data.sellPrice < 0) {
//             return res
//               .status(400)
//               .json({message: '판매 가격은 0보다 커야 합니다.'})
//           }

//           const updated = await client.transaction.update({
//             where: {id},
//             data: {
//               ...data
//             }
//           })
//           return res.status(201).json({transaction: updated})
//         } catch (err) {
//           if (err instanceof Prisma.PrismaClientKnownRequestError) {
//             console.log(err)

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
