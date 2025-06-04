import {Router} from 'express'
import multer from 'multer'
import {Prisma} from '@prisma/client'
import * as U from '../utils'
import {extractUserIdFromJwt} from '../utils'
import prisma from '../lib/prisma'

export const authRouter = (...args: any[]) => {
  const router = Router()
  const upload = multer()

  return router
    .post('/sign-up', upload.none(), async (req, res) => {
      try {
        const {name, email, password: plainPassword} = req.body
        const hashedPassword = await U.hashPasswordP(plainPassword)

        const result = await prisma.user.create({
          data: {name, email, password: hashedPassword}
        })

        const {password: _password, ...userInfo} = result

        return res.status(201).json({userInfo: userInfo})
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          if (e.code === 'P2002') {
            return res.status(409).json({message: '이미 가입한 회원입니다.'})
          }
          return res.status(500).json({message: '서버 오류'})
        }
      }
    })
    .post('/login', upload.none(), async (req, res) => {
      try {
        const {email, password} = req.body

        const result = await prisma.user.findUnique({where: {email: email}})

        if (!result) {
          return res.status(401).json({message: '등록되지 않은 사용자입니다.'})
        }

        const {password: _password, ...userInfo} = result
        const isSamePw = await U.comparePasswordP(password, result.password)
        if (isSamePw) {
          const accessToken = await U.jwtSignP(
            {id: result.id},
            {expiresIn: '15m'}
          )
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
          return res.status(200).json({
            accessToken: accessToken,
            userInfo: userInfo
          })
        } else {
          return res.status(401).json({message: '비밀번호가 틀렸습니다.'})
        }
      } catch (e) {
        return res.status(500).json({message: '오류'})
      }
    })
    .post('/logout', async (req, res) => {
      return res.cookie('refreshToken', '', {
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
}
