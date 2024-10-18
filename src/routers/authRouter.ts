import {Router} from 'express'
import multer from 'multer'
import {Prisma, PrismaClient} from '@prisma/client'
import * as U from '../utils'
import {extractUserIdFromJwt} from '../utils'

export const authRouter = (...args: any[]) => {
  const router = Router()
  const client = new PrismaClient()
  const upload = multer()

  return router
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
            res.status(409).json({errorMessage: '이미 가입한 회원입니다.'})
          } else {
            res.status(500).json({errorMessage: e.message})
          }
        } else {
          res.status(500).json({errorMessage: '서버 오류'})
        }
      }
    })
    .post('/login', upload.none(), async (req, res) => {
      const {email, password} = req.body
      const result = await client.user.findUnique({where: {email: email}})

      if (!result) {
        res.status(401).json({errorMessage: '등록되지 않은 사용자입니다.'})
        return
      }

      const {id: _id, password: _password, ...userInfo} = result
      const isSamePw = await U.comparePasswordP(password, result.password)
      if (isSamePw) {
        const token = await U.jwtSignP({id: result.id}, {expiresIn: '1m'})
        const refreshToken = await U.jwtSignP(
          {id: result.id},
          {expiresIn: '7d'}
        )

        // 쿠키값이 넘어가기는 하는데,(set-cookie) 프런트에서 다시 전달하지를 못하고 있음.
        res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV1 === 'production',
          // sameSite:none을 쓰려면 무조건 https(secure: true)를 적용해야
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
          maxAge: 24 * 60 * 60 * 1000
        })
        res.status(200).json({
          token: token,
          userInfo: userInfo
        })
      } else {
        res.status(401).json({errorMessage: '비밀번호가 틀렸습니다.'})
      }
    })
    .post('/logout', async (req, res) => {
      res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0)
      })
    })
    .post('/refresh-token', async (req, res) => {
      const {refreshToken} = req.cookies // from cookies??
      if (!refreshToken) {
        return res.status(401).json({errorMessage: 'no refresh token'})
      }
      try {
        const userId = extractUserIdFromJwt(refreshToken)

        if (!userId) {
          return res.status(401).json({
            errorMessage: '유효하지 않은 토큰입니다. 다시 로그인해 주세요.'
          })
        }
        const token = await U.jwtSignP({id: userId}, {expiresIn: '1m'})
        return res.status(200).json({token: token})
      } catch (e) {}
    })
    .get('/profile', (req, res) => {
      const token = req.cookies.token // 쿠키에서 토큰을 읽음

      console.log(token)
      if (!token) {
        return res.status(401).json({errorMessage: '인증 토큰이 없습니다.'})
      }

      // try {
      //   const decoded = jwt.verify(token, process.env.JWT_SECRET)
      //   res.status(200).json({ok: true, userInfo: decoded})
      // } catch (e) {
      //   res
      //     .status(401)
      //     .json({ok: false, errorMessage: '유효하지 않은 토큰입니다.'})
      // }
    })
  // 지우지 말기 - jwt 토큰을 이용한 api 요청 권한 확인 시 참고하기
  // .post('/login', async (req, res) => {
  //   const {authorization} = req.headers || {}

  //   if (!authorization) {
  //     res.json({ok: false, errorMessage: 'JSON 토큰이 없습니다.'})
  //     return
  //   }

  //   try {
  //     const recvAuth = authorization.split(' ')
  //     if (recvAuth.length !== 2) {
  //       res.json({
  //         ok: false,
  //         errorMessage: '헤더에서 JSON 토큰을 얻을 수 없습니다.'
  //       })
  //     } else {
  //       const jwt = recvAuth[1]
  //       const decoded = (await U.jwtVerifyP(jwt)) as {id: string}
  //       const result = await client.user.findUnique({where: {id: decoded.id}})

  //       if (!result) {
  //         res.json({ok: false, errorMessage: '등록되지 않은 사용자 입니다.'})
  //         return
  //       }

  //       const {email, password} = req.body
  //       if (email !== result.email) {
  //         res.json({ok: false, errorMessage: '이메일 주소가 틀렸습니다.'})
  //         return
  //       }
  //       const same = await U.comparePasswordP(password, result.password)
  //       if (false === same) {
  //         res.json({ok: false, errorMessage: '비밀번호가 틀립니다.'})
  //         return
  //       }
  //       res.json({ok: true})
  //     }
  //     // todo
  //   } catch (e) {
  //     // todo.
  //   }
  // })
}
