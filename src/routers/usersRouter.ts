import {Router} from 'express'
import {Prisma, PrismaClient} from '@prisma/client'
import multer from 'multer'

import {extractUserIdFromJwt} from '../utils'

export const usersRouter = (...args: any[]) => {
  const router = Router()
  const client = new PrismaClient()
  const upload = multer()

  return router
    .get('/holdings', async (req, res) => {
      try {
        const token = req.headers.authorization?.split('Bearer ')[1]
        if (!token) {
          return res.status(401).json({errorMessage: '로그인이 필요합니다.'})
        }

        const userId = extractUserIdFromJwt(token)
        if (!userId) {
          return res.status(401).json({
            errorMessage: '유효하지 않은 토큰입니다. 다시 로그인해 주세요.'
          })
        }
        // todo. holdings르ㄹ transaction 기준으로 가져와야 할지도.
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

        res.status(200).json({holdings: arrangedResult})
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
        const token = req.headers.authorization?.split('Bearer ')[1]
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
        const token = req.headers.authorization?.split('Bearer ')[1]
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
        const token = req.headers.authorization?.split('Bearer ')[1]
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
    .get('/transactions', async (req, res) => {
      try {
        const token = req.headers.authorization?.split('Bearer ')[1]
        if (!token) {
          return res.status(401).json({errorMessage: '로그인이 필요합니다.'})
        }

        const userId = extractUserIdFromJwt(token)
        if (!userId) {
          return res.status(401).json({
            errorMessage: '유효하지 않은 토큰입니다. 다시 로그인해 주세요.'
          })
        }

        const transactions = await client.transaction.findMany({
          where: {userId: userId},
          include: {
            matchedTransaction: true
          }
        })
        res.status(200).json({transactions: transactions})
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
    .post('/transactions', upload.none(), async (req, res) => {
      try {
        const token = req.headers.authorization?.split('Bearer ')[1]
        if (!token) {
          return res.status(401).json({errorMessage: '로그인이 필요합니다.'})
        }

        const userId = extractUserIdFromJwt(token)
        if (!userId) {
          return res.status(401).json({
            errorMessage: '유효하지 않은 토큰입니다. 다시 로그인해 주세요.'
          })
        }

        const {stockTicker, quantity, price, type, transactionAt} = req.body

        console.log('req.body', req.body)
        // todo. 값에 대한 validation , error 메시지 추가해야 할 듯.
        const createdTransaction = await client.transaction.create({
          data: {
            user: {
              connect: {id: userId}
            },
            stock: {
              connect: {ticker: stockTicker}
            },
            quantity: parseInt(quantity), // 숫자로 변환
            price: parseInt(price), // 숫자로 변환
            type, // BUY or SELL (TransactionType enum 값)
            transactionAt: new Date(transactionAt) // 날짜 변환
          }
        })

        res.status(201).json({transaction: createdTransaction})
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
