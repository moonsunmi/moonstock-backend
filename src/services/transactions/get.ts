import {PrismaClient, TransactionStatus} from '@prisma/client'
import {CustomError} from '../../errors/CustomError'
import client from '../../../prisma/db'
import {ERROR_CODES} from '../../utils/constants'

export const getTransactionById = async (id: string, userId: string) => {
  const transaction = await client.transaction.findUnique({
    where: {id}
  })
  if (transaction?.userId !== userId) {
    throw new CustomError('접근 권한이 없습니다.', ERROR_CODES.UNAUTHORIZED)
  }
  return {transaction}
}

export const getTransactionsByTicker = async (
  ticker: string,
  userId: string
) => {
  const stock = await client.stock.findUnique({
    where: {ticker}
  })

  if (!stock) {
    throw new CustomError(
      `${ticker}는 존재하지 않는 stockTicker입니다.`,
      ERROR_CODES.NOT_EXIST
    )
  }

  const transactions = await client.transaction.findMany({
    where: {
      userId,
      stockTicker: ticker,
      OR: [{partiallyDone: 'BUY'}, {partiallyDone: 'SELL'}]
    }
  })

  return {stock, transactions}
}

interface TransactionTotal {
  profit: number
  quantity: number
}

export const getCompletedTransactionsByTicker = async (
  ticker: string,
  userId: string
) => {
  const stock = await client.stock.findUnique({
    where: {ticker}
  })

  if (!stock) {
    throw new CustomError(
      `${ticker}는 존재하지 않는 stockTicker입니다.`,
      ERROR_CODES.NOT_EXIST
    )
  }

  const transactions = await client.transaction.findMany({
    where: {
      userId,
      stockTicker: ticker,
      partiallyDone: TransactionStatus.DONE
    },
    orderBy: {
      sellCreatedAt: 'desc'
    }
  })

  const total = transactions.reduce<TransactionTotal>(
    (acc, transaction) => ({
      profit:
        acc.profit +
        (transaction.profit ? transaction.profit * transaction.quantity : 0),
      quantity: acc.quantity + transaction.quantity
    }),
    {profit: 0, quantity: 0}
  )

  return {stock, total, transactions}
}
