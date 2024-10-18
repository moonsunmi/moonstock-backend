import {Router} from 'express'
import {Prisma, PrismaClient} from '@prisma/client'
import {extractUserIdFromJwt} from '../utils'

export const usersRouter = (...args: any[]) => {
  const router = Router()
  const client = new PrismaClient()

  return router
    .get('/holdings', async (req, res) => {
      try {
        const token = req.headers.authorization?.split('Bearer ')[1]
        console.log(token)
        if (!token) {
          return res.status(401).json({errorMessage: '로그인이 필요합니다.'})
        }
        const userId = extractUserIdFromJwt(token)

        console.log(userId)
        if (!userId) {
          return res.status(401).json({
            errorMessage: '유효하지 않은 토큰입니다. 다시 로그인해 주세요.'
          })
        }

        const result = await client.holding.findMany({where: {userId: userId}})

        res.status(200).json({holdings: result})
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
    .get('/holdings/:holdingId', async (req, res) => {
      try {
        const token = req.cookies.token
        if (!token) {
          return res.status(401).json({errorMessage: '로그인이 필요합니다.'})
        }

        const userId = extractUserIdFromJwt(token)
        if (!userId) {
          return res.status(401).json({
            errorMessage: '유효하지 않은 토큰입니다. 다시 로그인해 주세요.'
          })
        }

        const {holdingId} = req.params
        if (!holdingId) {
          return res.status(400).json({errorMessage: 'holdingId가 필요합니다.'})
        }

        const result = await client.holding.findUnique({
          where: {id: holdingId, userId: userId},
          include: {stock: true}
        })

        if (!result) {
          return res.status(404).json({
            errorMessage: '해당 주식 정보를 찾을 수 없습니다.'
          })
        }

        res.status(200).json({holding: result})
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
    .post('/holdings/:holdingId', async (req, res) => {
      try {
        const token = req.cookies.token
        if (!token) {
          return res.status(401).json({errorMessage: '로그인이 필요합니다.'})
        }

        const userId = extractUserIdFromJwt(token)
        if (!userId) {
          return res.status(401).json({
            errorMessage: '유효하지 않은 토큰입니다. 다시 로그인해 주세요.'
          })
        }
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
    .put('/holdings/:holdingId', async (req, res) => {
      try {
        const token = req.cookies.token
        if (!token) {
          return res.status(401).json({errorMessage: '로그인이 필요합니다.'})
        }

        const userId = extractUserIdFromJwt(token)
        if (!userId) {
          return res.status(401).json({
            errorMessage: '유효하지 않은 토큰입니다. 다시 로그인해 주세요.'
          })
        }
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
    .delete('/holdings/:holdingId', async (req, res) => {
      try {
        const token = req.cookies.token
        if (!token) {
          return res.status(401).json({errorMessage: '로그인이 필요합니다.'})
        }

        const userId = extractUserIdFromJwt(token)
        if (!userId) {
          return res.status(401).json({
            errorMessage: '유효하지 않은 토큰입니다. 다시 로그인해 주세요.'
          })
        }

        const {holdingId} = req.params
        if (!holdingId) {
          return res.status(400).json({errorMessage: 'holdingId가 필요합니다.'})
        }

        const result = await client.holding.delete({
          where: {id: holdingId, userId: userId}
        })

        if (result) return res.status(200).json({holdings: result})
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
