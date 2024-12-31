import {CustomError} from '../errors/CustomError'
import {
  getCompletedTransactionsByTicker,
  getTransactionById,
  getTransactionsByTicker
} from '../services/transactions/get'
import {Response} from 'express'
import {AuthenticatedRequest} from '../types'
import {createTransactionService} from '../services/transactions/create'

export const createTransaction = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const result = await createTransactionService(req)
    return res.status(201).json(result)
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(400).json({
        errorCode: err.errorCode,
        message: err.message
      })
    }
    console.error('알 수 없는 오류 발생:', err)
    return res.status(500).json({
      errorCode: 'ERROR_CODE_SERVER_ERROR',
      message: '서버 오류가 발생했습니다. 나중에 다시 시도해 주세요.'
    })
  }
}

export const getTransaction = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const {userId} = req
    const {id} = req.params
    const result = await getTransactionById(id, userId || '')

    return res.status(200).json(result)
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(400).json({
        errorCode: err.errorCode,
        message: err.message
      })
    }
    console.error('알 수 없는 오류 발생:', err)
    return res.status(500).json({
      errorCode: 'ERROR_CODE_SERVER_ERROR',
      message: '서버 오류가 발생했습니다. 나중에 다시 시도해 주세요.'
    })
  }
}

export const getTradingTransactions = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const {userId} = req
    const {ticker} = req.params
    const result = await getTransactionsByTicker(ticker, userId || '')

    return res.status(200).json(result)
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(400).json({
        errorCode: err.errorCode,
        message: err.message
      })
    }
    console.error('알 수 없는 오류 발생:', err)
    return res.status(500).json({
      errorCode: 'ERROR_CODE_SERVER_ERROR',
      message: '서버 오류가 발생했습니다. 나중에 다시 시도해 주세요.'
    })
  }
}

export const getCompletedTransactions = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const {userId} = req
    const {ticker} = req.params
    const result = await getCompletedTransactionsByTicker(ticker, userId || '')

    return res.status(200).json(result)
  } catch (err) {
    if (err instanceof CustomError) {
      return res.status(400).json({
        errorCode: err.errorCode,
        message: err.message
      })
    }
    console.error('알 수 없는 오류 발생:', err)
    return res.status(500).json({
      errorCode: 'ERROR_CODE_SERVER_ERROR',
      message: '서버 오류가 발생했습니다. 나중에 다시 시도해 주세요.'
    })
  }
}
