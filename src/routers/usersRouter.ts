import {Router} from 'express'
import {Prisma, PrismaClient} from '@prisma/client'
import {extractUserIdFromJwt} from '../utils'

export const usersRouter = (...args: any[]) => {
  const router = Router()
  const client = new PrismaClient()

  return router
    .get('/holdings', async (req, res) => {
      try {
        const token = req.cookies.token
        if (!token) {
          return res
            .status(401)
            .json({ok: false, errorMessage: '로그인이 필요합니다.'})
        }

        const userId = extractUserIdFromJwt(token)
        if (!userId) {
          return res.status(401).json({
            ok: false,
            errorMessage: '유효하지 않은 토큰입니다. 다시 로그인해 주세요.'
          })
        }

        const result = await client.holding.findMany({where: {userId: userId}})

        res.status(200).json({ok: true, holdings: result})
      } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
          res.json({
            ok: false,
            errorMessage: '데이터베이스 오류가 발생했습니다.'
          })
        }
      }
    })
    .get('/holdings/:holdingId', async (req, res) => {
      const token = req.cookies.token
      const userId = extractUserIdFromJwt(token)
    })
    .post('/holdings/:holdingId', async (req, res) => {
      const token = req.cookies.token
      const userId = extractUserIdFromJwt(token)
    })
    .put('/holdings/:holdingId', async (req, res) => {
      const token = req.cookies.token
      const userId = extractUserIdFromJwt(token)
    })
    .delete('/holdings/:holdingId', async (req, res) => {
      const token = req.cookies.token
      const userId = extractUserIdFromJwt(token)
    })
}
