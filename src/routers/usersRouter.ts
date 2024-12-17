import {Response, Router} from 'express'
import {Prisma, PrismaClient, TransactionStatus} from '@prisma/client'
import multer from 'multer'

import {AuthenticatedRequest} from '../types'

import authenticateUser from '../middlewares/authenticateUser'
import checkAuthorization from '../middlewares/checkAuthorization'
import {getDuration, getOpposite} from '../utils/helper'

export const usersRouter = (...args: any[]) => {
  const router = Router()
  const client = new PrismaClient()
  const upload = multer()

  return router
    .get(
      '/holdings',
      authenticateUser,
      async (req: AuthenticatedRequest, res: Response) => {
        try {
          const {userId} = req

          const holdings = await client.transaction.findMany({
            where: {userId: userId},
            distinct: ['stockTicker'],
            select: {stock: true}
          })

          const flattened = holdings.map(holding => ({
            ticker: holding.stock.ticker,
            name: holding.stock.name,
            market: holding.stock.market
          }))

          return res.status(200).json({holdings: flattened})
        } catch (err) {
          if (err instanceof Prisma.PrismaClientKnownRequestError) {
            console.log(err)

            return res.json({
              message: '데이터베이스 오류가 발생했습니다.'
            })
          }
          console.error('알 수 없는 오류 발생:', err)
          return res.status(500).json({
            message: '서버 오류가 발생했습니다. 나중에 다시 시도해 주세요.'
          })
        }
      }
    )
    .post(
      '/transactions',
      upload.none(),
      authenticateUser,
      async (req: AuthenticatedRequest, res: Response) => {
        try {
          const {userId} = req
          const {
            stockTicker,
            quantity,
            buyPrice,
            sellPrice,
            type,
            buyCreatedAt,
            sellCreatedAt
          } = req.body

          let data
          if (!type) {
            return res.status(400).json({
              errorCode: 'ERROR_CODE_TYPE_INVALID',
              message: `type은 필수입니다. 유효 type값: buy, sell`
            })
          } else if (type.toUpperCase() === 'BUY') {
            if (
              !stockTicker ||
              !quantity ||
              !buyPrice ||
              !buyCreatedAt ||
              !type
            ) {
              return res.status(400).json({
                message:
                  '매수 필수 값이 누락되었습니다. (필수: stockTicker, quantity, buyPrice, buyCreatedAt)'
              })
            }
            data = {
              quantity: parseInt(quantity),
              buyPrice: parseFloat(buyPrice),
              buyCreatedAt: new Date(buyCreatedAt),
              partiallyDone: type.toUpperCase()
            }
          } else if (type.toUpperCase() === 'SELL') {
            if (
              !stockTicker ||
              !quantity ||
              !sellPrice ||
              !sellCreatedAt ||
              !type
            ) {
              return res.status(400).json({
                message:
                  '매도 필수 값이 누락되었습니다. (필수: stockTicker, quantity, sellPrice, sellCreatedAt)'
              })
            }
            data = {
              quantity: parseInt(quantity),
              sellPrice: parseFloat(sellPrice),
              sellCreatedAt: new Date(sellCreatedAt),
              partiallyDone: type.toUpperCase()
            }
          } else {
            return res.status(404).json({
              errorCode: 'ERROR_CODE_TYPE_INVALID',
              message: `${type}은 유효하지 않은 type입니다. (buy or sell)`
            })
          }

          const stockRecord = await client.stock.findUnique({
            where: {ticker: stockTicker}
          })

          if (!stockRecord) {
            return res.status(404).json({
              errorCode: 'ERROR_CODE_STOCK_NOT_FOUND',
              message: `${stockTicker}는 존재하지 않는 stockTicker입니다.`
            })
          }

          const created = await client.transaction.create({
            data: {
              ...data,
              user: {
                connect: {id: userId}
              },
              stock: {
                connect: {ticker: stockTicker}
              },
              quantity: parseInt(quantity)
            },
            include: {
              stock: true
            }
          })

          return res.status(201).json({transaction: created})
        } catch (err) {
          if (err instanceof Prisma.PrismaClientKnownRequestError) {
            console.log(err)

            return res.json({
              message: '데이터베이스 오류가 발생했습니다.'
            })
          }
          console.error('알 수 없는 오류 발생:', err)
          return res.status(500).json({
            message: '서버 오류가 발생했습니다. 나중에 다시 시도해 주세요.'
          })
        }
      }
    )
    .get(
      '/transactions/:ticker/trading',
      authenticateUser,
      async (req: AuthenticatedRequest, res: Response) => {
        try {
          const {userId} = req
          const {ticker} = req.params
          const stock = await client.stock.findUnique({
            where: {ticker: ticker}
          })
          if (!stock) {
            return res.status(404).json({
              message: `${ticker}는 존재하지 않는 stockTicker입니다.`
            })
          }
          const transactions = await client.transaction.findMany({
            where: {
              userId: userId,
              stockTicker: ticker,
              OR: [{partiallyDone: 'BUY'}, {partiallyDone: 'SELL'}]
            }
          })
          return res
            .status(200)
            .json({stock: stock, transactions: transactions})
        } catch (err) {
          if (err instanceof Prisma.PrismaClientKnownRequestError) {
            return res.json({
              message: '데이터베이스 오류가 발생했습니다.'
            })
          }
          console.error('알 수 없는 오류 발생:', err)
          return res.status(500).json({
            message: '서버 오류가 발생했습니다. 나중에 다시 시도해 주세요.'
          })
        }
      }
    )
    .get(
      '/transactions/:ticker/done',
      authenticateUser,
      async (req: AuthenticatedRequest, res: Response) => {
        try {
          const {userId} = req
          const {ticker} = req.params
          const stock = await client.stock.findUnique({
            where: {ticker: ticker}
          })
          if (!stock) {
            return res.status(404).json({
              message: `${ticker}는 존재하지 않는 stockTicker입니다.`
            })
          }
          const transactions = await client.transaction.findMany({
            where: {
              userId: userId,
              stockTicker: ticker,
              partiallyDone: TransactionStatus.DONE
            }
          })
          const total = transactions.reduce(
            (total, transaction) => ({
              profit:
                total.profit +
                (transaction.profit
                  ? transaction.profit * transaction.quantity
                  : 0),
              quantity: total.quantity + transaction.quantity
            }),
            {profit: 0, quantity: 0}
          )
          return res.status(200).json({stock, total, transactions})
        } catch (err) {
          if (err instanceof Prisma.PrismaClientKnownRequestError) {
            return res.json({
              message: '데이터베이스 오류가 발생했습니다.'
            })
          }
          console.error('알 수 없는 오류 발생:', err)
          return res.status(500).json({
            message: '서버 오류가 발생했습니다. 나중에 다시 시도해 주세요.'
          })
        }
      }
    )
    .get(
      '/transactions/:id',
      authenticateUser,
      async (req: AuthenticatedRequest, res: Response) => {
        try {
          const {id} = req.params

          const transaction = await client.transaction.findUnique({
            where: {id}
          })
          return res.status(200).json({transaction: transaction})
        } catch (err) {
          if (err instanceof Prisma.PrismaClientKnownRequestError) {
            return res.json({
              message: '데이터베이스 오류가 발생했습니다.'
            })
          }
          console.error('알 수 없는 오류 발생:', err)
          return res.status(500).json({
            message: '서버 오류가 발생했습니다. 나중에 다시 시도해 주세요.'
          })
        }
      }
    )
    .put(
      '/transactions/match',
      upload.none(),
      authenticateUser,
      checkAuthorization,
      async (req: AuthenticatedRequest, res: Response) => {
        try {
          const {
            parsedMatchIds,
            buyPrice,
            sellPrice,
            type,
            buyCreatedAt,
            sellCreatedAt
          } = req.body

          if (!Array.isArray(parsedMatchIds) || parsedMatchIds.length === 0) {
            return res.status(400).json({error: '매칭할 Id가 없습니다.'})
          }
          let data
          if (!type) {
            return res.status(400).json({
              errorCode: 'ERROR_CODE_TYPE_INVALID',
              message: `type은 필수입니다. 유효 type값: buy, sell`
            })
          } else if (type.toLowerCase() === 'buy') {
            if (!buyPrice || !buyCreatedAt) {
              return res.status(400).json({
                message:
                  '매수 필수 값이 누락되었습니다. (필수: buyPrice, buyCreatedAt)'
              })
            }
            data = {
              buyPrice: parseFloat(buyPrice),
              buyCreatedAt: new Date(buyCreatedAt)
            }
          } else if (type.toLowerCase() === 'sell') {
            if (!sellPrice || !sellCreatedAt) {
              return res.status(400).json({
                message:
                  '매도 필수 값이 누락되었습니다. (필수: sellPrice, sellCreatedAt)'
              })
            }
            data = {
              sellPrice: parseFloat(sellPrice),
              sellCreatedAt: new Date(sellCreatedAt)
            }
          } else {
            return res.status(404).json({
              errorCode: 'ERROR_CODE_TYPE_INVALID',
              message: `${type}은 유효하지 않은 type입니다. (buy or sell)`
            })
          }

          const updatedTransactions = await Promise.all(
            parsedMatchIds.map(async id => {
              const transaction = await client.transaction.findUnique({
                where: {id}
              })

              if (
                !transaction ||
                type !== getOpposite(transaction.partiallyDone)
              ) {
                return res.status(400).json({
                  errorCode: 'ERROR_CODE_TYPE_INVALID',
                  message: `반대 타입의 거래만 매칭할 수 있습니다. (SELL - BUY)`
                })
              }

              let calculatedData
              if (type === 'BUY') {
                if (!transaction?.sellCreatedAt) {
                  throw new Error(
                    'sellCreatedAt 값이 존재하지 않습니다. 매칭 불가'
                  )
                }

                const duration = getDuration(
                  new Date(transaction.sellCreatedAt),
                  new Date(buyCreatedAt)
                )
                const profit = (transaction.sellPrice ?? 0) - buyPrice
                const rateOfProfit = profit / buyPrice
                const rateOfProfitYear =
                  (1 + rateOfProfit) ** (365 / duration) - 1
                calculatedData = {
                  duration,
                  profit,
                  rateOfProfit,
                  rateOfProfitYear
                }
              } else if (type === 'SELL') {
                if (!transaction?.buyCreatedAt) {
                  throw new Error(
                    'buyCreatedAt 값이 존재하지 않습니다. 매칭 불가'
                  )
                }
                const duration = getDuration(
                  new Date(sellCreatedAt),
                  new Date(transaction.buyCreatedAt)
                )
                const profit = sellPrice - (transaction.buyPrice ?? 0)
                const rateOfProfit = profit / (transaction.buyPrice ?? 1)
                const rateOfProfitYear =
                  (1 + rateOfProfit) ** (365 / duration) - 1
                calculatedData = {
                  duration,
                  profit,
                  rateOfProfit,
                  rateOfProfitYear
                }
              }

              const updatedTransaction = await client.transaction.update({
                where: {id},
                data: {
                  ...data,
                  ...calculatedData,
                  partiallyDone: TransactionStatus.DONE
                }
              })

              return updatedTransaction
            })
          )
          return res.status(200).json({transactions: updatedTransactions})
        } catch (err) {
          if (err instanceof Prisma.PrismaClientKnownRequestError) {
            console.log(err)

            return res.json({
              message: '데이터베이스 오류가 발생했습니다.'
            })
          }
          console.error('알 수 없는 오류 발생:', err)
          return res.status(500).json({
            message: '서버 오류가 발생했습니다. 나중에 다시 시도해 주세요.'
          })
        }
      }
    )
    .put(
      // 이미 기록된 거래 정보가 잘못되었을 경우 수정하는 것
      '/transactions/:id',
      upload.none(),
      authenticateUser,
      checkAuthorization,
      async (req: AuthenticatedRequest, res: Response) => {
        return res.status(200).json({message: 'transactions/:id called'})
      }
    )
    .delete(
      '/transactions/:id',
      authenticateUser,
      checkAuthorization,
      async (req: AuthenticatedRequest, res: Response) => {
        try {
          const {userId} = req

          const {id} = req.params
          if (!id) {
            return res.status(400).json({message: 'id 필요합니다.'})
          }

          const deleted = await client.transaction.delete({
            where: {id: id, userId: userId}
          })

          if (deleted) return res.status(200).json({transaction: deleted})
        } catch (err) {
          if (err instanceof Prisma.PrismaClientKnownRequestError) {
            return res.json({
              message: '데이터베이스 오류가 발생했습니다.'
            })
          }
          console.error('알 수 없는 오류 발생:', err)
          return res.status(500).json({
            message: '서버 오류가 발생했습니다. 나중에 다시 시도해 주세요.'
          })
        }
      }
    )
}
