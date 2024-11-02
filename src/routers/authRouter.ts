import {Router} from 'express'
import multer from 'multer'
import {Prisma, PrismaClient} from '@prisma/client'
import * as U from '../utils'
import {extractUserIdFromJwt} from '../utils'

export const authRouter = (...args: any[]) => {
  const router = Router()
  const client = new PrismaClient()
  const upload = multer()

  return (
    router
      // .get('/me', async (req, res) => {
      //   try {
      //     const token = req.headers.authorization?.split(' ')[1]

      //     if (!token) {
      //       return res.status(401).json({message: '로그인이 필요합니다.'})
      //     }

      //     const userId = extractUserIdFromJwt(token)
      //     if (!userId) {
      //       return res.status(403).json({
      //         message: 'Unauthorized'
      //       })
      //     }
      //     res.status(200).json({token: token})
      //   } catch (e) {
      //     res.status(500).json({message: '오류'})
      //   }
      // })
      .post('/sign-up', upload.none(), async (req, res) => {
        try {
          const {name, email, password: plainPassword, emailVerified} = req.body
          const hashedPassword = await U.hashPasswordP(plainPassword)

          const createdUser = await client.user.create({
            data: {name, email, emailVerified, password: hashedPassword}
          })
          const jwt = await U.jwtSignP({id: createdUser.id})

          res.status(201).json({ok: true})
        } catch (e) {
          if (e instanceof Prisma.PrismaClientKnownRequestError) {
            if (e.code === 'P2002') {
              res.status(409).json({message: '이미 가입한 회원입니다.'})
            } else {
              res.status(500).json({message: e.message})
            }
          } else {
            res.status(500).json({message: '서버 오류'})
          }
        }
      })
      .post('/login', upload.none(), async (req, res) => {
        try {
          const {email, password} = req.body

          const result = await client.user.findUnique({where: {email: email}})

          if (!result) {
            res.status(401).json({message: '등록되지 않은 사용자입니다.'})
            return
          }

          const {id: _id, password: _password, ...userInfo} = result
          const isSamePw = await U.comparePasswordP(password, result.password)
          if (isSamePw) {
            const token = await U.jwtSignP({id: result.id}, {expiresIn: '15m'})
            const refreshToken = await U.jwtSignP(
              {id: result.id},
              {expiresIn: '7d'}
            )

            res.cookie('refreshToken', refreshToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV1 === 'production',
              // sameSite:none을 쓰려면 무조건 https(secure: true)를 적용해야
              sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
              maxAge: 24 * 60 * 60 * 1000
            })
            res.status(200).json({
              accessToken: token,
              userInfo: userInfo
            })
          } else {
            res.status(401).json({message: '비밀번호가 틀렸습니다.'})
          }
        } catch (e) {
          res.status(500).json({message: '오류'})
        }
      })
      .post('/logout', async (req, res) => {
        res.cookie('refreshToken', '', {
          httpOnly: true,
          expires: new Date(0)
        })
      })
      .get('/refresh-token', async (req, res) => {
        const {refreshToken} = req.cookies
        if (!refreshToken) {
          return res.status(401).json({message: 'no refresh token'})
        }
        try {
          const userId = extractUserIdFromJwt(refreshToken)

          if (!userId) {
            return res.status(401).json({
              message: '유효하지 않은 토큰입니다. 다시 로그인해 주세요.'
            })
          }
          const token = await U.jwtSignP({id: userId}, {expiresIn: '15m'})
          return res.status(200).json({accessToken: token})
        } catch (e) {}
      })
      .get('/profile', (req, res) => {
        const token = req.cookies.token // 쿠키에서 토큰을 읽음

        console.log(token)
        if (!token) {
          return res.status(401).json({message: '인증 토큰이 없습니다.'})
        }

        // try {
        //   const decoded = jwt.verify(token, process.env.JWT_SECRET)
        //   res.status(200).json({ok: true, userInfo: decoded})
        // } catch (e) {
        //   res
        //     .status(401)
        //     .json({ok: false, message: '유효하지 않은 토큰입니다.'})
        // }
      })
  )
}
