import {CustomError} from '../../errors/CustomError'
import {AuthenticatedRequest} from '../../types'
// import {getDuration, getOpposite} from '../../utils/helper'
import client from '../../../prisma/db'
import {ERROR_CODES} from '../../utils/constants'

export const updateBuyTransactionById = async (
  id: string,
  req: AuthenticatedRequest
) => {
  const {quantity, price, createdAt} = req.body

  const data = {
    quantity: parseFloat(quantity),
    buyPrice: parseFloat(price),
    buyCreatedAt: new Date(createdAt)
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

  // todo. 매도 일자보다 더 이후로 날짜 수정 안 되게 해야 할 듯....?

  const updated = await client.buyTransaction.update({
    where: {id},
    data: {
      ...data
    }
  })
  return {transaction: updated}
}

export const updateSellTransactionById = async (
  id: string,
  req: AuthenticatedRequest
) => {
  const {quantity, price, createdAt} = req.body

  const data = {
    quantity: parseFloat(quantity),
    sellPrice: parseFloat(price),
    sellCreatedAt: new Date(createdAt)
  }

  if (!data.quantity || data.quantity <= 0) {
    throw new CustomError(
      '거래 수량은 1 이상이어야 합니다.',
      ERROR_CODES.INVALID_VALUE
    )
  }

  if (data.sellPrice && data.sellPrice < 0) {
    throw new CustomError(
      '구매 가격은 0보다 커야 합니다.',
      ERROR_CODES.INVALID_VALUE
    )
  }

  // todo. 매수 일자보다 더 이전으로 날짜 수정 안 되게 해야 할 듯....?

  const updated = await client.sellTransaction.update({
    where: {id},
    data: {
      ...data
    }
  })
  return {transaction: updated}
}
