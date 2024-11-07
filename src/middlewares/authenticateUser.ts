import {Response, NextFunction} from 'express'
import {extractUserIdFromJwt} from '../utils'
import {AuthenticatedRequest} from '../types'

const authenticateUser = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      return res.status(401).json({message: '로그인이 필요합니다.'})
    }
    const userId = extractUserIdFromJwt(token)

    if (!userId) {
      return res.status(403).json({
        message: 'Unauthorized'
      })
    }
    req.userId = userId
    next()
  } catch (e) {
    console.error(e)
  }
}
export default authenticateUser
