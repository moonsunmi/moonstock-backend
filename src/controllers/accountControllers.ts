import {Request, Response} from 'express'
import {CustomError} from '../errors/CustomError'
import {createAccountService} from '../services/accountService'
import {AuthenticatedRequest} from '../types'

export const createAccount = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const authReq = req as AuthenticatedRequest

  try {
    const account = await createAccountService(authReq)
    return res.status(201).json({account})
  } catch (error) {
    console.error('createAccount 에러:', error)
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
