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
    .post(
      '/transactions',
      upload.none(),
      authenticateUser,
      async (req: AuthenticatedRequest, res: Response) => {
        try {
          const {userId} = req
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

          const created = await client.transaction.create({
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
                matched: {connect: {id: created.id}}
              }
            })
          }

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
      '/transactions/:ticker',
      authenticateUser,
      async (req: AuthenticatedRequest, res: Response) => {
        try {
          const {userId} = req
          const {ticker} = req.params

          const transactions = await client.transaction.findMany({
            where: {userId: userId, stockTicker: ticker},
            include: {
              matched: true
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
    .get(
      '/transactions/:id',
      authenticateUser,
      async (req: AuthenticatedRequest, res: Response) => {
        try {
          const {userId} = req

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
    .put(
      '/transactions/:id',
      upload.none(),
      authenticateUser,
      async (req: AuthenticatedRequest, res: Response) => {
        try {
          const {userId} = req

          const {id} = req.params
          const {quantity, price, transactedAt, ...rest} = req.body

          console.log('req:', req)

          if (Object.keys(rest).length > 0) {
            return res.status(400).json({
              message: `${Object.keys(rest).join(
                ', '
              )}는 수정할 수 없습니다. 수정 가능한 항목: quantity, price, transactedAt`
            })
          }

          const updated = await client.transaction.update({
            where: {
              userId: userId,
              id: id
            },
            data: {
              quantity: quantity != null ? parseInt(quantity) : undefined,
              price: price != null ? parseInt(price) : undefined,
              transactedAt:
                transactedAt != null ? new Date(transactedAt) : undefined
            }
          })

          return res.status(200).json({transaction: updated})
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
    .delete(
      '/transactions/:id',
      authenticateUser,
      async (req: AuthenticatedRequest, res: Response) => {
        try {
          const {userId} = req

          const {id} = req.params
          if (!id) {
            return res.status(400).json({message: 'id 필요합니다.'})
          }

          const deleted = await client.holding.delete({
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
