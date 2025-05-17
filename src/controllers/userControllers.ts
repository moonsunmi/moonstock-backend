import {RequestHandler, Response} from 'express'
import {CustomError} from '../errors/CustomError'
import {getHoldingsService} from '../services/user/getHoldings'
import {AuthenticatedRequest} from '../types'

export const getHoldings: RequestHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const authReq = req as AuthenticatedRequest

  try {
    const holdings = await getHoldingsService(authReq)
    return res.status(200).json({holdings})
  } catch (error) {
    console.error('getHoldings 에러:', error)
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({
        errorCode: error.errorCode,
        message: error.message
      })
    }
    return res.status(500).json({
      errorCode: 'INTERNAL_SERVER_ERROR',
      message: '서버 오류가 발생했습니다. 나중에 다시 시도해 주세요.'
    })
  }
}
