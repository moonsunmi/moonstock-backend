import {PrismaClient} from '@prisma/client'
import {CustomError} from '../../errors/CustomError'
import client from '../../../prisma/db'
import {ERROR_CODES} from '../../utils/constants'

export const getTransactionByIdService = async (id: string, userId: string) => {
  //   const transaction = await client.transaction.findUnique({
  //     where: {id}
  //   })
  //   if (transaction?.userId !== userId) {
  //     throw new CustomError('접근 권한이 없습니다.', ERROR_CODES.UNAUTHORIZED)
  //   }
  //   return {transaction}
}

export const getActiveTransactionsByTickerService = async (
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

  const transactions = await client.buyTransaction.findMany({
    where: {
      userId,
      stockTicker: ticker
    },
    include: {
      sellTransactions: true
    },
    orderBy: {
      buyCreatedAt: 'desc'
    }
  })

  const activeTransactions = transactions
    .map(txn => {
      const soldQuantity = txn.sellTransactions.reduce(
        (acc, sellTxn) => acc + sellTxn.quantity,
        0
      )
      return {
        id: txn.id,
        quantity: txn.quantity - soldQuantity,
        price: txn.buyPrice,
        createdAt: txn.buyCreatedAt
      }
    })
    .filter(tnx => tnx.quantity > 0)

  return {stock, transactions: activeTransactions}
}

interface TransactionTotal {
  profit: number
  quantity: number
}

export const getClosedTransactionsByTicker = async (
  ticker: string,
  userId: string
) => {
  // 하단 부분 middleware로 해야 할 듯.
  const stock = await client.stock.findUnique({
    where: {ticker}
  })

  if (!stock) {
    throw new CustomError(
      `${ticker}는 존재하지 않는 stockTicker입니다.`,
      ERROR_CODES.NOT_EXIST
    )
  }

  const transactions = await client.buyTransaction.findMany({
    where: {
      userId,
      stockTicker: ticker
    },
    include: {
      sellTransactions: true
    },
    orderBy: {
      buyCreatedAt: 'desc'
    }
  })

  const closedTransactions = transactions.map(txn => {
    const soldQuantity = txn.sellTransactions.reduce(
      (acc, sellTxn) => acc + sellTxn.quantity,
      0
    )
    return {
      id: txn.id,
      quantity: soldQuantity,
      price: txn.buyPrice,
      createdAt: txn.buyCreatedAt,
      sellTransactions: txn.sellTransactions.map(sellTxn => ({
        id: sellTxn.id,
        quantity: sellTxn.quantity,
        price: sellTxn.sellPrice,
        createdAt: sellTxn.sellCreatedAt
      }))
    }
  })

  // const total = transactions.reduce<TransactionTotal>(
  //   (acc, transaction) => ({
  //     profit:
  //       acc.profit +
  //       (transaction.profit ? transaction.profit * transaction.quantity : 0),
  //     quantity: acc.quantity + transaction.quantity
  //   }),
  //   {profit: 0, quantity: 0}
  // )

  return {stock, transactions: closedTransactions}
}
