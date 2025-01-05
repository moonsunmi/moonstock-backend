import {TransactionStatus} from '@prisma/client'
import {CustomError} from '../../errors/CustomError'
import {AuthenticatedRequest} from '../../types'
import {getDuration, getOpposite} from '../../utils/helper'
import client from '../../../prisma/db'
import {ERROR_CODES} from '../../utils/constants'

export const matchTransactionService = async (req: AuthenticatedRequest) => {
  const {
    parsedMatchIds,
    buyPrice,
    sellPrice,
    type,
    buyCreatedAt,
    sellCreatedAt
  } = req.body

  if (!Array.isArray(parsedMatchIds) || parsedMatchIds.length === 0) {
    throw new CustomError('매칭할 Id가 없습니다.', ERROR_CODES.NOT_EXIST)
  }
  let data
  if (!type) {
    throw new CustomError(
      `type은 필수입니다. 유효 type값: buy, sell`,
      ERROR_CODES.INVALID_TYPE
    )
  } else if (type.toLowerCase() === 'buy') {
    if (!buyPrice || !buyCreatedAt) {
      throw new CustomError(
        '매수 필수 값이 누락되었습니다. (필수: buyPrice, buyCreatedAt)',
        ERROR_CODES.MISSING_VALUE
      )
    }
    data = {
      buyPrice: parseFloat(buyPrice),
      buyCreatedAt: new Date(buyCreatedAt)
    }
  } else if (type.toLowerCase() === 'sell') {
    if (!sellPrice || !sellCreatedAt) {
      throw new CustomError(
        '매도 필수 값이 누락되었습니다. (필수: sellPrice, sellCreatedAt)',
        ERROR_CODES.MISSING_VALUE
      )
    }
    data = {
      sellPrice: parseFloat(sellPrice),
      sellCreatedAt: new Date(sellCreatedAt)
    }
  } else {
    throw new CustomError(
      `${type}은 유효하지 않은 type입니다. (buy or sell)`,
      ERROR_CODES.INVALID_TYPE
    )
  }

  const updatedTransactions = await Promise.all(
    parsedMatchIds.map(async id => {
      const transaction = await client.transaction.findUnique({
        where: {id}
      })

      if (!transaction || type !== getOpposite(transaction.partiallyDone)) {
        throw new CustomError(
          `반대 타입의 거래만 매칭할 수 있습니다. (SELL - BUY)`,
          ERROR_CODES.INVALID_TYPE
        )
      }

      let calculatedData
      if (type === 'BUY') {
        if (!transaction?.sellCreatedAt) {
          throw new CustomError(
            'sellCreatedAt 값이 존재하지 않습니다. 매칭 불가',
            ERROR_CODES.MISSING_VALUE
          )
        }

        const duration = getDuration(
          new Date(transaction.sellCreatedAt),
          new Date(buyCreatedAt)
        )
        const profit = (transaction.sellPrice ?? 0) - buyPrice
        const rateOfProfit = profit / buyPrice
        const rateOfProfitYear = (1 + rateOfProfit) ** (365 / duration) - 1
        calculatedData = {
          duration,
          profit,
          rateOfProfit,
          rateOfProfitYear
        }
      } else if (type === 'SELL') {
        if (!transaction?.buyCreatedAt) {
          throw new CustomError(
            'buyCreatedAt 값이 존재하지 않습니다. 매칭 불가',
            ERROR_CODES.MISSING_VALUE
          )
        }
        const duration = getDuration(
          new Date(sellCreatedAt),
          new Date(transaction.buyCreatedAt)
        )
        const profit = sellPrice - (transaction.buyPrice ?? 0)
        const rateOfProfit = profit / (transaction.buyPrice ?? 1)
        const rateOfProfitYear = (1 + rateOfProfit) ** (365 / duration) - 1
        calculatedData = {
          duration,
          profit,
          rateOfProfit,
          rateOfProfitYear
        }
      }

      const updatedTransaction = await client.transaction.update({
        where: {id},
        data: {
          ...data,
          ...calculatedData,
          partiallyDone: TransactionStatus.DONE
        }
      })

      return updatedTransaction
    })
  )
  return {transactions: updatedTransactions}
}

export const updateTransactionById = async (
  id: string,
  req: AuthenticatedRequest
) => {
  const {quantity, buyPrice, sellPrice} = req.body

  const data = {
    quantity: parseFloat(quantity),
    buyPrice: parseFloat(buyPrice),
    sellPrice: parseFloat(sellPrice)
  }

  if (!data.quantity || data.quantity <= 0) {
    throw new CustomError(
      '거래 수량은 1 이상이어야 합니다.',
      ERROR_CODES.INVALID_VALUE
    )
  }

  if (data.buyPrice && data.buyPrice < 0) {
    throw new CustomError(
      '구매 가격은 0보다 커야 합니다.',
      ERROR_CODES.INVALID_VALUE
    )
  }

  if (data.sellPrice && data.sellPrice < 0) {
    throw new CustomError(
      '판매 가격은 0보다 커야 합니다.',
      ERROR_CODES.INVALID_VALUE
    )
  }

  const updated = await client.transaction.update({
    where: {id},
    data: {
      ...data
    }
  })
  return {transaction: updated}
}
