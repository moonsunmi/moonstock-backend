import {CustomError} from '@/errors/CustomError'
import {AuthenticatedRequest} from '@/types'
import prisma from '@/lib/prisma'
import {ERROR_CODES} from '@/utils/constants'

export const updateTradeById = async (
  id: string,
  req: AuthenticatedRequest
) => {
  const {quantity, price, tradeAt, feeAmount, taxAmount, feeRate, taxRate} =
    req.body

  const data = {
    quantity: parseFloat(quantity),
    price: parseFloat(price),
    tradeAt: new Date(tradeAt),
    feeAmount: parseFloat(feeAmount),
    taxAmount: parseFloat(taxAmount),
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

  // todo. 매도 일자보다 더 이후로 날짜 수정 안 되게 해야 할 듯....?
  const updated = await prisma.trade.update({
    where: {id},
    data: {
      ...data
    }
  })
  return {...updated}
}
