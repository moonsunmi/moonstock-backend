import {AuthenticatedRequest} from '../../types'
import {CustomError} from '../../errors/CustomError'
import client from '../../../prisma/db'
import {ERROR_CODES} from '../../utils/constants'

// stock의 ticker가 있는지 여부를 middleware로 뺄 수도 있을 거 같음.
export const createBuyTransactionService = async (
  req: AuthenticatedRequest
) => {
  const {userId} = req
  const {stockTicker, quantity, buyPrice, buyCreatedAt} = req.body

  let data
  if (!stockTicker || !quantity || !buyPrice || !buyCreatedAt) {
    throw new CustomError(
      '매수 필수 값이 누락되었습니다. (필수: stockTicker, quantity, buyPrice, buyCreatedAt)',
      ERROR_CODES.MISSING_VALUE
    )
  }
  data = {
    quantity: parseInt(quantity),
    buyPrice: parseFloat(buyPrice),
    buyCreatedAt: new Date(buyCreatedAt)
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
  const {id} = req.params
  const {quantity, sellPrice, sellCreatedAt} = req.body

  let data
  if (!quantity || !sellPrice || !sellCreatedAt) {
    throw new CustomError(
      '매도 필수 값이 누락되었습니다. (필수: stockTicker, quantity, sellPrice, sellCreatedAt)',
      ERROR_CODES.MISSING_VALUE
    )
  }
  data = {
    quantity: parseInt(quantity),
    sellPrice: parseFloat(sellPrice),
    sellCreatedAt: new Date(sellCreatedAt)
  }

  const buyTransaction = await client.buyTransaction.findUnique({
    where: {id},
    include: {
      sellTransactions: true,
      stock: true
    }
  })

  if (buyTransaction === null) {
    throw new CustomError(
      `${id}는 존재하지 않는 buyTransaction입니다.`,
      ERROR_CODES.NOT_EXIST
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
        connect: {id: id}
      }
    }
  })

  const result = transaction
    ? {...transaction, createdAt: undefined, updatedAt: undefined}
    : null
  return {transaction: result}
}
