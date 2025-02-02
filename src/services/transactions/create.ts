import {AuthenticatedRequest} from '../../types'
import {CustomError} from '../../errors/CustomError'
import client from '../../../prisma/db'
import {ERROR_CODES} from '../../utils/constants'

// stock의 ticker가 있는지 여부를 middleware로 뺄 수도 있을 거 같음.
export const createBuyTransactionService = async (
  req: AuthenticatedRequest
) => {
  const {userId} = req
  const {stockTicker, quantity, price, createdAt} = req.body

  let data
  if (!stockTicker || !quantity || !price || !createdAt) {
    throw new CustomError(
      `${data}에 매수 필수 값이 누락되었습니다. (필수: stockTicker, quantity, price, createdAt)`,
      ERROR_CODES.MISSING_VALUE
    )
  }
  data = {
    quantity: parseInt(quantity),
    buyPrice: parseFloat(price),
    buyCreatedAt: new Date(createdAt)
  }

  const stockRecord = await client.stock.findUnique({
    where: {ticker: stockTicker}
  })

  if (!stockRecord) {
    throw new CustomError(
      `${stockTicker}는 존재하지 않는 stockTicker입니다.`,
      ERROR_CODES.NOT_FOUND
    )
  }

  const transaction = await client.buyTransaction.create({
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

  const result = transaction
    ? {...transaction, createdAt: undefined, updatedAt: undefined}
    : null
  return {transaction: result}
}

export const createSellTransactionService = async (
  req: AuthenticatedRequest
) => {
  const {userId} = req
  const {buyId} = req.params
  const {quantity, price, createdAt} = req.body

  let data
  if (!quantity || !price || !createdAt) {
    throw new CustomError(
      '매도 필수 값이 누락되었습니다. (필수: stockTicker, quantity, price, createdAt)',
      ERROR_CODES.MISSING_VALUE
    )
  }
  data = {
    quantity: parseInt(quantity),
    sellPrice: parseFloat(price),
    sellCreatedAt: new Date(createdAt)
  }

  const buyTransaction = await client.buyTransaction.findUnique({
    where: {id: buyId},
    include: {
      sellTransactions: true,
      stock: true
    }
  })

  if (buyTransaction === null) {
    throw new CustomError(
      `${buyId}는 존재하지 않는 buyTransaction입니다.`,
      ERROR_CODES.NOT_FOUND
    )
  }
  if (buyTransaction.userId !== userId) {
    throw new CustomError(`권한이 없습니다.`, ERROR_CODES.UNAUTHORIZED)
  }

  const soldQuantity = buyTransaction?.sellTransactions.reduce(
    (acc, cur) => acc + cur.quantity,
    0
  )
  const remainingQuantity = buyTransaction.quantity - soldQuantity
  if (remainingQuantity < parseInt(quantity)) {
    throw new CustomError(
      `매도 가능한 주식 수량이 부족합니다. 남은 수량: ${remainingQuantity}`,
      ERROR_CODES.INVALID_VALUE
    )
  }

  const transaction = await client.sellTransaction.create({
    data: {
      ...data,
      buyTransaction: {
        connect: {id: buyId}
      }
    }
  })

  const result = transaction
    ? {...transaction, createdAt: undefined, updatedAt: undefined}
    : null
  return {transaction: result}
}
