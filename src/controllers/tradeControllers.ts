import {AuthenticatedRequest} from '../types'
import {updateTradeById} from '../services/trade/update'
import {RequestHandler, Response} from 'express'
import {createTradeService, matchTradeService} from '../services/trade/create'
import {CustomError} from '../errors/CustomError'

export const createTrade: RequestHandler = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const authReq = req as AuthenticatedRequest

  try {
    const trade = await createTradeService(authReq)
    return res.status(201).json({trade})
  } catch (error) {
    console.error('createTrade 에러:', error)
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

// todo. 이건 매치로 옮겨야 하려나?
export const matchTrade = async (req: AuthenticatedRequest, res: Response) => {
  const authReq = req as AuthenticatedRequest

  try {
    const trade = await matchTradeService(authReq)
    return res.status(201).json({trade})
  } catch (error) {
    console.error('matchTrade 에러:', error)
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

export const updateTrade = async (req: AuthenticatedRequest, res: Response) => {
  const authReq = req as AuthenticatedRequest

  try {
    const {id} = req.params
    const result = await updateTradeById(id, authReq)
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
