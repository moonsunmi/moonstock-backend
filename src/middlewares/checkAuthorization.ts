import {NextFunction, Response} from 'express'
import {AuthenticatedRequest} from '../types'
import {PrismaClient} from '@prisma/client'

const checkAuthorization = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const client = new PrismaClient()
    const {userId} = req // type?
    const {matchIds} = req.body

    const parsedMatchIds = JSON.parse(matchIds)

    const transactions = await client.transaction.findMany({
      where: {
        id: {in: parsedMatchIds}
      }
    })

    if (transactions.length !== parsedMatchIds.length) {
      return res.status(403).json({
        errorCode: 'ERROR_CODE_UNAUTHORIZED',
        message: '존재하지 않는 거래 ID가 포함되어 있습니다.'
      })
    }
    const unauthorized = transactions.some(
      transaction => transaction.userId !== userId
    )
    console.log(unauthorized)

    if (unauthorized) {
      return res.status(403).json({
        errorCode: 'ERROR_CODE_UNAUTHORIZED',
        message: '권한이 없는 거래가 포함되어 있습니다.'
      })
    }

    req.body.parsedMatchIds = parsedMatchIds
    next()
  } catch (e) {
    res.status(500).json({
      errorCode: 'ERROR_CODE_INTERNAL_SERVER_ERROR',
      message: '서버 오류가 발생했습니다.'
    })
    return next(e)
  }
}

export default checkAuthorization
