import {Response, Router} from 'express'
import {Prisma, PrismaClient, TransactionStatus} from '@prisma/client'
import multer from 'multer'

import {AuthenticatedRequest} from '../types'

import authenticateUser from '../middlewares/authenticateUser'

export const usersRouter = (...args: any[]) => {
  const router = Router()
  const client = new PrismaClient()
  const upload = multer()

  return router.get(
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
}
