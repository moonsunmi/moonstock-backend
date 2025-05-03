// import {
//   getActiveTransactionsByTickerService,
//   getClosedTransactionsByTicker,
//   getTransactionByIdService
// } from '../services/transactions/get'
import {AuthenticatedRequest} from '../types'
import {
  updateBuyTransactionById,
  updateSellTransactionById
} from '../services/transactions/update'
// import {
//   deleteBuyTransactionById,
//   deleteSellTransactionById
// } from '../services/transactions/delete'
import {Request, Response} from 'express'
import {
  createTransactionService,
  matchTransactionService
} from '../services/transactions/create'
import {CustomError} from '../errors/CustomError'

export const createTransaction = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const transaction = await createTransactionService(req)
    return res.status(201).json({transaction})
  } catch (error) {
    console.error('createTransaction 에러:', error)
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

export const matchTransaction = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const transaction = await matchTransactionService(req)
    return res.status(201).json({transaction})
  } catch (error) {
    console.error('matchTransaction 에러:', error)
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

// export const getTransaction = async (
//   req: AuthenticatedRequest,
//   res: Response
// ) => {
//   try {
//     const {userId} = req
//     const {id} = req.params
//     const result = await getTransactionByIdService(id, userId || '')

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

// export const getActiveTransactionsByTicker = async (
//   req: AuthenticatedRequest,
//   res: Response
// ) => {
//   try {
//     const {userId} = req
//     const {ticker} = req.params
//     const result = await getActiveTransactionsByTickerService(
//       ticker,
//       userId || ''
//     )

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

// export const getClosedTransactions = async (
//   req: AuthenticatedRequest,
//   res: Response
// ) => {
//   try {
//     const {userId} = req
//     const {ticker} = req.params
//     const result = await getClosedTransactionsByTicker(ticker, userId || '')

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

// export const updateBuyTransaction = async (
//   req: AuthenticatedRequest,
//   res: Response
// ) => {
//   try {
//     const {id} = req.params
//     const result = await updateBuyTransactionById(id, req)
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

// export const updateSellTransaction = async (
//   req: AuthenticatedRequest,
//   res: Response
// ) => {
//   try {
//     const {id} = req.params
//     const result = await updateSellTransactionById(id, req)
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

// export const deleteBuyTransaction = async (
//   req: AuthenticatedRequest,
//   res: Response
// ) => {
//   try {
//     const {id} = req.params

//     const result = await deleteBuyTransactionById(id)

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

// export const deleteSellTransaction = async (
//   req: AuthenticatedRequest,
//   res: Response
// ) => {
//   try {
//     const {id} = req.params

//     const result = await deleteSellTransactionById(id)

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
