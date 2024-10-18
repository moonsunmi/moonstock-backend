import {Router} from 'express'
import {Prisma, PrismaClient} from '@prisma/client'
import {extractUserIdFromJwt} from '../utils'

export const stockRouter = (...args: any[]) => {
  const router = Router()
  const client = new PrismaClient()

  return router.get('/', async (req, res) => {
    try {
      const result = await client.stock.findMany()

      res.status(200).json({stockList: result})
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        res.json({
          errorMessage: '데이터베이스 오류가 발생했습니다.'
        })
      }
      console.error('알 수 없는 오류 발생:', err)
      res.status(500).json({
        errorMessage: '서버 오류가 발생했습니다. 나중에 다시 시도해 주세요.'
      })
    }
  })
}
