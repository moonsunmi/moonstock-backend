import {AuthenticatedRequest} from '../../types'
import {CustomError} from '../../errors/CustomError'
import client from '../../../prisma/db'
import {ERROR_CODES} from '../../utils/constants'

export const createTransactionService = async (req: AuthenticatedRequest) => {
  const {userId} = req
  const {
    stockTicker,
    quantity,
    buyPrice,
    sellPrice,
    type,
    buyCreatedAt,
    sellCreatedAt
  } = req.body

  if (!type) {
    throw new Error('type은 필수입니다. 유효 type값: buy, sell')
  }

  let data
  if (type.toUpperCase() === 'BUY') {
    if (!stockTicker || !quantity || !buyPrice || !buyCreatedAt || !type) {
      throw new CustomError(
        '매수 필수 값이 누락되었습니다. (필수: stockTicker, quantity, buyPrice, buyCreatedAt)',
        ERROR_CODES.MISSING_VALUE
      )
    }
    data = {
      quantity: parseInt(quantity),
      buyPrice: parseFloat(buyPrice),
      buyCreatedAt: new Date(buyCreatedAt),
      partiallyDone: type.toUpperCase()
    }
  } else if (type.toUpperCase() === 'SELL') {
    if (!stockTicker || !quantity || !sellPrice || !sellCreatedAt || !type) {
      throw new CustomError(
        '매도 필수 값이 누락되었습니다. (필수: stockTicker, quantity, sellPrice, sellCreatedAt)',
        ERROR_CODES.MISSING_VALUE
      )
    }
    data = {
      quantity: parseInt(quantity),
      sellPrice: parseFloat(sellPrice),
      sellCreatedAt: new Date(sellCreatedAt),
      partiallyDone: type.toUpperCase()
    }
  } else {
    throw new CustomError(
      `${type}은 유효하지 않은 type입니다. (buy or sell)`,
      ERROR_CODES.INVALID_TYPE
    )
  }

  const stockRecord = await client.stock.findUnique({
    where: {ticker: stockTicker}
  })

  if (!stockRecord) {
    throw new CustomError(
      `${stockTicker}는 존재하지 않는 stockTicker입니다.`,
      ERROR_CODES.NOT_EXIST
    )
  }

  const transaction = await client.transaction.create({
    data: {
      ...data,
      user: {
        connect: {id: userId}
      },
      stock: {
        connect: {ticker: stockTicker}
      },
      quantity: parseInt(quantity)
    },
    include: {
      stock: true
    }
  })
  return {transaction}
}
