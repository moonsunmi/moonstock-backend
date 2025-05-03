import {AuthenticatedRequest} from '../../types'
import {CustomError} from '../../errors/CustomError'
import client from '../../../prisma/db'
import {ERROR_CODES} from '../../utils/constants'

export const createTransactionService = async (req: AuthenticatedRequest) => {
  const {userId} = req as any // authenticateUser 미들웨어에서 설정했다고 가정
  const {accountId, stockTicker, type, quantity, price, createdAt} = req.body

  console.log('???????', req.body)
  if (!accountId || !stockTicker || !type || !quantity || !price) {
    throw new CustomError(
      '필수 값이 누락되었습니다. (accountId, stockTicker, type, quantity, price 필요)',
      ERROR_CODES.MISSING_VALUE
    )
  }

  const parsedQuantity = parseInt(quantity)
  const parsedPrice = parseFloat(price)

  // 거래 타입이 올바른지 확인
  if (type !== 'BUY' && type !== 'SELL') {
    throw new CustomError(
      '거래 타입은 BUY 또는 SELL 이어야 합니다.',
      ERROR_CODES.INVALID_VALUE
    )
  }

  // 해당 주식이 존재하는지 확인
  const stockRecord = await client.stock.findUnique({
    where: {ticker: stockTicker}
  })
  if (!stockRecord) {
    throw new CustomError(
      `${stockTicker}는 존재하지 않는 주식 티커입니다.`,
      ERROR_CODES.NOT_FOUND
    )
  }

  // 계좌가 존재하는지 확인
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

  // 최초 거래 생성 (매칭되지 않은 상태)
  const transaction = await client.tradeTransaction.create({
    data: {
      user: {connect: {id: userId}},
      account: {connect: {id: accountId}},
      stock: {connect: {ticker: stockTicker}},
      type: type,
      quantity: parsedQuantity,
      price: parsedPrice,
      fee: 0,
      tax: 0,
      feeRate: 0,
      taxRate: 0,
      // 아직 매칭되지 않았으므로 remainingQuantity는 전체 수량과 동일
      remainingQuantity: parsedQuantity,
      ...(createdAt ? {createdAt: new Date(createdAt)} : {})
    }
  })

  return {transaction}
}

export const matchTransactionService = async (req: AuthenticatedRequest) => {
  const {userId} = req as any // authenticateUser 미들웨어에서 설정했다고 가정
  const {initialOrderId, quantity, price, createdAt} = req.body

  if (!initialOrderId || !quantity || !price) {
    throw new CustomError(
      '필수 값이 누락되었습니다. (initialOrderId, quantity, price 필요)',
      ERROR_CODES.MISSING_VALUE
    )
  }

  const parsedQuantity = parseInt(quantity)
  const parsedPrice = parseFloat(price)

  // 최초 주문 조회
  const initialOrder = await client.tradeTransaction.findUnique({
    where: {id: initialOrderId}
  })
  if (!initialOrder) {
    throw new CustomError(
      '최초 주문을 찾을 수 없습니다.',
      ERROR_CODES.NOT_FOUND
    )
  }
  // 최초 주문은 동일 사용자 소유여야 함 (자기 매매)
  if (initialOrder.userId !== userId) {
    throw new CustomError('권한이 없습니다.', ERROR_CODES.UNAUTHORIZED)
  }

  if (initialOrder.remainingQuantity < parsedQuantity) {
    throw new CustomError(
      `매칭할 수량이 부족합니다. 남은 수량: ${initialOrder.remainingQuantity}`,
      ERROR_CODES.INVALID_VALUE
    )
  }

  // 최초 주문의 타입에 따라 매칭 주문의 타입은 반대가 됨
  const matchingType = initialOrder.type === 'BUY' ? 'SELL' : 'BUY'

  // 트랜잭션을 이용하여 매칭 주문 생성 및 최초 주문 업데이트, TradeMatching 생성
  const matchingResult = await client.$transaction(async tx => {
    // 1. 매칭 주문 생성
    const matchingOrder = await tx.tradeTransaction.create({
      data: {
        user: {connect: {id: userId}},
        // 최초 주문과 동일한 계정과 주식 사용
        account: {connect: {id: initialOrder.accountId}},
        stock: {connect: {ticker: initialOrder.stockTicker}},
        type: matchingType,
        quantity: parsedQuantity,
        price: parsedPrice,
        fee: 0,
        tax: 0,
        feeRate: 0,
        taxRate: 0,
        // 매칭 주문은 즉시 처리되므로 remainingQuantity는 0
        remainingQuantity: 0,
        ...(createdAt ? {createdAt: new Date(createdAt)} : {})
      }
    })

    // 2. 최초 주문의 remainingQuantity 업데이트
    const newRemaining = initialOrder.remainingQuantity - parsedQuantity
    await tx.tradeTransaction.update({
      where: {id: initialOrder.id},
      data: {remainingQuantity: newRemaining}
    })

    // 3. TradeMatching 레코드 생성
    // 최초 주문과 매칭 주문 중 BUY인 주문이 매수, SELL인 주문이 매도로 결정됨
    const buyTransactionId =
      initialOrder.type === 'BUY' ? initialOrder.id : matchingOrder.id
    const sellTransactionId =
      initialOrder.type === 'SELL' ? initialOrder.id : matchingOrder.id

    await tx.tradeMatching.create({
      data: {
        user: {connect: {id: userId}},
        stock: {connect: {ticker: initialOrder.stockTicker}},
        buyTransaction: {connect: {id: buyTransactionId}},
        sellTransaction: {connect: {id: sellTransactionId}},
        profit: 0, // 이후 수익 계산 로직 추가 가능
        netProfit: 0, // 이후 순수익 계산 로직 추가 가능
        fee: 0,
        tax: 0,
        feeRate: 0,
        taxRate: 0
      }
    })

    return matchingOrder
  })

  return {transaction: matchingResult}
}
