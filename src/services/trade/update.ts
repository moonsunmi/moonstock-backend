import {CustomError} from '../../errors/CustomError'
import {AuthenticatedRequest} from '../../types'
// import {getDuration, getOpposite} from '../../utils/helper'
import client from '../../../prisma/db'
import {ERROR_CODES} from '../../utils/constants'

export const updateTradeById = async (
  id: string,
  req: AuthenticatedRequest
) => {
  const {quantity, price, tradeDate, feeAmount, taskAmount, feeRate, taxRate} =
    req.body

  const data = {
    quantity: parseFloat(quantity),
    price: parseFloat(price),
    tradeDate: new Date(tradeDate),
    feeAmount,
    taskAmount,
    feeRate: parseFloat(feeRate),
    taxRate: parseFloat(taxRate)
  }

  if (!data.quantity || data.quantity <= 0) {
    throw new CustomError(
      '거래 수량은 1 이상이어야 합니다.',
      ERROR_CODES.INVALID_VALUE
    )
  }

  if (data.price && data.price < 0) {
    throw new CustomError(
      '구매 가격은 0보다 커야 합니다.',
      ERROR_CODES.INVALID_VALUE
    )
  }

  // todo. unmatchedQty 계산해서 넣기

  // todo. 매도 일자보다 더 이후로 날짜 수정 안 되게 해야 할 듯....?
  const updated = await client.trade.update({
    where: {id},
    data: {
      ...data
    }
  })
  return {transaction: updated}
}
