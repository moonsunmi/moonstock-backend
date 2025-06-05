import {CustomError} from '../../errors/CustomError'
import prisma from '../../lib/prisma'
import {ERROR_CODES} from '../../utils/constants'

export const getTradingByTickerService = async (
  ticker: string,
  userId: string
) => {
  const stock = await prisma.stock.findUnique({
    where: {ticker}
  })

  if (!stock) {
    throw new CustomError(
      `${ticker}는 존재하지 않는 stockTicker입니다.`,
      ERROR_CODES.NOT_FOUND
    )
  }

  const trades = await prisma.trade.findMany({
    where: {
      userId,
      stockTicker: ticker
    },
    orderBy: {
      tradeAt: 'desc'
    }
  })

  const tradings = trades.filter(tnx => tnx.isMatched === false)

  return {stock, tradings}
}

export const getMatchedByTickerService = async (
  ticker: string,
  userId: string
) => {
  const stock = await prisma.stock.findUnique({
    where: {ticker}
  })

  if (!stock) {
    throw new CustomError(
      `${ticker}는 존재하지 않는 stockTicker입니다.`,
      ERROR_CODES.NOT_FOUND
    )
  }

  const matched = await prisma.tradeMatch.findMany({
    where: {
      userId,
      stockTicker: ticker
    },
    include: {
      buyTrade: true,
      sellTrade: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return {stock, matched}
}
