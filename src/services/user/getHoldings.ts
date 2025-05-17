import {AuthenticatedRequest} from '../../types'
import client from '../../../prisma/db'

export const getHoldingsService = async (req: AuthenticatedRequest) => {
  const {userId} = req

  const holdings = await client.trade.findMany({
    where: {userId: userId},
    distinct: ['stockTicker'],
    select: {stock: true}
  })

  const flattened = holdings.map(holding => ({
    ticker: holding.stock.ticker,
    name: holding.stock.name,
    market: holding.stock.market
  }))

  return flattened
}
