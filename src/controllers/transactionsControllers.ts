import {CustomError} from '../errors/CustomError'
import {
  getActiveTransactionsByTickerService,
  getClosedTransactionsByTicker,
  getTransactionByIdService
} from '../services/transactions/get'
import {Response} from 'express'
import {AuthenticatedRequest} from '../types'
import {
  createBuyTransactionService,
  createSellTransactionService
} from '../services/transactions/create'
// import {
//   matchTransactionsService,
//   updateTransactionById
// } from '../services/transactions/update'
// import {deleteTransactionById} from '../services/transactions/delete'

export const createBuyTransaction = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const result = await createBuyTransactionService(req)
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

export const createSellTransaction = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const result = await createSellTransactionService(req)
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
    const result = await getTransactionByIdService(id, userId || '')

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

export const getActiveTransactionsByTicker = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const {userId} = req
    const {ticker} = req.params
    const result = await getActiveTransactionsByTickerService(
      ticker,
      userId || ''
    )

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

export const getClosedTransactions = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const {userId} = req
    const {ticker} = req.params
    const result = await getClosedTransactionsByTicker(ticker, userId || '')

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

// export const matchTransaction = async (
//   req: AuthenticatedRequest,
//   res: Response
// ) => {
//   try {
//     const result = await matchTransactionsService(req)

//     return res.status(200).json(result)
//   } catch (err) {
//     if (err instanceof CustomError) {
//       return res.status(400).json({
//         errorCode: err.errorCode,
//         message: err.message
//       })
//     }
//     console.error('알 수 없는 오류 발생:', err)
//     return res.status(500).json({
//       errorCode: 'ERROR_CODE_SERVER_ERROR',
//       message: '서버 오류가 발생했습니다. 나중에 다시 시도해 주세요.'
//     })
//   }
// }

// export const postTransaction = async (
//   req: AuthenticatedRequest,
//   res: Response
// ) => {
//   try {
//     const {id} = req.params
//     const result = await updateTransactionById(id, req)

//     return res.status(200).json(result)
//   } catch (err) {
//     if (err instanceof CustomError) {
//       return res.status(400).json({
//         errorCode: err.errorCode,
//         message: err.message
//       })
//     }
//     console.error('알 수 없는 오류 발생:', err)
//     return res.status(500).json({
//       errorCode: 'ERROR_CODE_SERVER_ERROR',
//       message: '서버 오류가 발생했습니다. 나중에 다시 시도해 주세요.'
//     })
//   }
// }

// export const deleteTransaction = async (
//   req: AuthenticatedRequest,
//   res: Response
// ) => {
//   try {
//     const {id} = req.params

//     const result = await deleteTransactionById(id)

//     return res.status(204).json(result)
//   } catch (err) {
//     if (err instanceof CustomError) {
//       return res.status(400).json({
//         errorCode: err.errorCode,
//         message: err.message
//       })
//     }
//     console.error('알 수 없는 오류 발생:', err)
//     return res.status(500).json({
//       errorCode: 'ERROR_CODE_SERVER_ERROR',
//       message: '서버 오류가 발생했습니다. 나중에 다시 시도해 주세요.'
//     })
//   }
// }
