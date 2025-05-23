import {CustomError} from '../../errors/CustomError'
import client from '../../../prisma/db'
import {ERROR_CODES} from '../../utils/constants'

export const getTradingByTickerService = async (
  ticker: string,
  userId: string
) => {
  const stock = await client.stock.findUnique({
    where: {ticker}
  })

  if (!stock) {
    throw new CustomError(
      `${ticker}는 존재하지 않는 stockTicker입니다.`,
      ERROR_CODES.NOT_FOUND
    )
  }

  const trades = await client.trade.findMany({
    where: {
      userId,
      stockTicker: ticker
    },
    orderBy: {
      tradeAt: 'desc'
    }
  })

  const tradings = trades.filter(tnx => tnx.unmatchedQty > 0)

  return {stock, tradings}
}
