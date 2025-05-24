import {AuthenticatedRequest} from '../../types'
import {CustomError} from '../../errors/CustomError'
import client from '../../../prisma/db'
import {ERROR_CODES} from '../../utils/constants'

export const createTradeService = async (req: AuthenticatedRequest) => {
  const {userId} = req as any
  const {accountId, stockTicker, type, quantity, price, tradeAt} = req.body

  const missingFields: string[] = []

  if (!accountId) missingFields.push('accountId')
  if (!stockTicker) missingFields.push('stockTicker')
  if (!type) missingFields.push('type')
  if (!quantity) missingFields.push('quantity')
  if (!price) missingFields.push('price')
  if (!tradeAt) missingFields.push('tradeAt')

  if (missingFields.length > 0) {
    throw new CustomError(
      `다음 필수값이 누락되었습니다: ${missingFields.join(', ')}`,
      ERROR_CODES.MISSING_VALUE
    )
  }

  const parsedQuantity = parseInt(quantity)
  const parsedPrice = parseFloat(price)

  if (type !== 'BUY' && type !== 'SELL') {
    throw new CustomError(
      '거래 타입은 BUY 또는 SELL 이어야 합니다.',
      ERROR_CODES.INVALID_VALUE
    )
  }

  const stockRecord = await client.stock.findUnique({
    where: {ticker: stockTicker}
  })
  if (!stockRecord) {
    throw new CustomError(
      `${stockTicker}는 존재하지 않는 주식 티커입니다.`,
      ERROR_CODES.NOT_FOUND
    )
  }

  const accountRecord = await client.account.findUnique({
    where: {id: accountId}
  })
  if (!accountRecord) {
    throw new CustomError(
      `Account with id ${accountId} not found.`,
      ERROR_CODES.NOT_FOUND,
      404
    )
  }

  const trade = await client.trade.create({
    data: {
      user: {connect: {id: userId}},
      account: {connect: {id: accountId}},
      stock: {connect: {ticker: stockTicker}},
      type,
      tradeAt,
      quantity: parsedQuantity,
      price: parsedPrice,
      feeAmount: 0,
      taxAmount: 0,
      feeRate: 0,
      taxRate: 0,
      isMatched: false,
      createdAt: new Date()
    }
  })

  return {trade}
}

export const matchTradeService = async (req: AuthenticatedRequest) => {
  const {userId} = req as any
  const {buyTradeId, sellTradeId} = req.body

  const missingFields: string[] = []

  if (!buyTradeId) missingFields.push('buyTradeId')
  if (!sellTradeId) missingFields.push('sellTradeId')

  if (!buyTradeId || !sellTradeId) {
    throw new CustomError(
      `다음 필수값이 누락되었습니다: ${missingFields.join(', ')}`,
      ERROR_CODES.MISSING_VALUE
    )
  }

  const [buyTrade, sellTrade] = await Promise.all([
    client.trade.findUnique({where: {id: buyTradeId}}),
    client.trade.findUnique({where: {id: sellTradeId}})
  ])

  if (!buyTrade || !sellTrade) {
    throw new CustomError(
      '매칭 대상이 되는 거래가 존재하지 않습니다.',
      ERROR_CODES.NOT_FOUND
    )
  }

  if (buyTrade.type !== 'BUY' || sellTrade.type !== 'SELL') {
    throw new CustomError(
      `매칭은 매수, 매도끼리만 가능합니다. 현재는 매수가 ${buyTrade.type}, 매도가 ${sellTrade.type}입니다.`,
      ERROR_CODES.INVALID_TYPE
    )
  }

  if (buyTrade.quantity !== sellTrade.quantity) {
    throw new CustomError(
      `매수와 매도 수량이 같아야 합니다. 현재는 매수 수량이 ${buyTrade.quantity}, 매도 수량이 ${sellTrade.quantity}입니다.`,
      ERROR_CODES.INVALID_VALUE
    )
  }

  const profit = (sellTrade.price - buyTrade.price) * buyTrade.quantity
  const fee = buyTrade.feeAmount + sellTrade.feeAmount
  const tax = buyTrade.taxAmount + sellTrade.taxAmount
  const netProfit = profit - fee - tax

  const matched = await client.tradeMatch.create({
    data: {
      userId,
      stockTicker: buyTrade.stockTicker,
      buyTradeId,
      sellTradeId,
      profit,
      netProfit,
      fee,
      tax,
      feeRate: buyTrade.feeRate,
      taxRate: buyTrade.taxRate,
      createdAt: new Date()
    }
  })

  await Promise.all([
    client.trade.update({
      where: {id: buyTradeId},
      data: {isMatched: true}
    }),
    client.trade.update({
      where: {id: sellTradeId},
      data: {isMatched: true}
    })
  ])

  return {matched}
}
