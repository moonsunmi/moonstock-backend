import {AuthenticatedRequest} from '@/types'
import prisma from '@/lib/prisma'

export const getHoldingsService = async (req: AuthenticatedRequest) => {
  const {userId} = req

  const holdings = await prisma.trade.findMany({
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
