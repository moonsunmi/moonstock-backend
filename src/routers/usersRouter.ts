import {Response, Router} from 'express'
import {Prisma, PrismaClient} from '@prisma/client'
import multer from 'multer'

import authenticateUser from '../middlewares/authenticateUser'
import {AuthenticatedRequest} from '../types'

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
          const userId = req.userId

          const results = await client.holding.findMany({
            where: {userId: userId},
            include: {stock: true}
          })

          const arrangedResult = results.map(result => {
            const {
              userId: _userId,
              stockTicker: _stockTicker,
              stock: _stock,
              ...rest
            } = result

            return {..._stock, ...rest}
          })

          return res.status(200).json({holdings: arrangedResult})
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
      '/holdings/:holdingId',
      authenticateUser,
      async (req: AuthenticatedRequest, res: Response) => {
        try {
          const userId = req.userId

          const {holdingId} = req.params
          if (!holdingId) {
            return res.status(400).json({message: 'holdingId가 필요합니다.'})
          }

          const result = await client.holding.findUnique({
            where: {id: holdingId, userId: userId},
            include: {stock: true}
          })

          if (!result) {
            return res.status(404).json({
              message: '해당 주식 정보를 찾을 수 없습니다.'
            })
          }

          return res.status(200).json({holding: result})
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
    .post(
      '/holdings/:holdingId',
      authenticateUser,
      async (req: AuthenticatedRequest, res: Response) => {
        try {
          const userId = req.userId
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
      '/holdings/:holdingId',
      authenticateUser,
      async (req: AuthenticatedRequest, res: Response) => {
        try {
          const userId = req.userId
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
    .delete(
      '/holdings/:holdingId',
      authenticateUser,
      async (req: AuthenticatedRequest, res: Response) => {
        try {
          const userId = req.userId

          const {holdingId} = req.params
          if (!holdingId) {
            return res.status(400).json({message: 'holdingId가 필요합니다.'})
          }

          const result = await client.holding.delete({
            where: {id: holdingId, userId: userId}
          })

          if (result) return res.status(200).json({holdings: result})
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
      '/transactions',
      authenticateUser,
      async (req: AuthenticatedRequest, res: Response) => {
        try {
          const userId = req.userId

          const transactions = await client.transaction.findMany({
            where: {userId: userId},
            include: {
              matched: true,
              stock: true
            }
          })
          return res.status(200).json({transactions: transactions})
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
    .post(
      '/transactions',
      upload.none(),
      authenticateUser,
      async (req: AuthenticatedRequest, res: Response) => {
        try {
          const userId = req.userId
          const {stockTicker, quantity, price, type, transactedAt, matchedId} =
            req.body

          if (!userId || !stockTicker || !quantity || !price || !type) {
            return res.status(400).json({
              message:
                '필수 값이 누락되었습니다. (필수: userId, stockTicker, quantity, price, type)'
            })
          }

          const stockRecord = await client.stock.findUnique({
            where: {ticker: stockTicker}
          })

          if (!stockRecord) {
            return res.status(404).json({
              message: `${stockTicker}는 존재하지 않는 stockTicker입니다.`
            })
          }

          const createdTransaction = await client.transaction.create({
            data: {
              user: {
                connect: {id: userId}
              },
              stock: {
                connect: {ticker: stockTicker}
              },
              quantity: parseInt(quantity),
              price: parseInt(price),
              type,
              transactedAt: new Date(transactedAt),
              matched: matchedId ? {connect: {id: matchedId}} : undefined
            },
            include: {
              stock: true
            }
          })

          if (matchedId) {
            await client.transaction.update({
              where: {id: matchedId},
              data: {
                matched: {connect: {id: createdTransaction.id}}
              }
            })
          }

          return res.status(201).json({transaction: createdTransaction})
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
}
