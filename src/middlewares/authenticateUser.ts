import {Response, NextFunction} from 'express'
import {extractUserIdFromJwt} from '../utils'
import {AuthenticatedRequest} from '../types'

const authenticateUser = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
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
    req.userId = userId
    next()
  } catch (e) {
    console.error(e)
  }
}
export default authenticateUser
