import {Request} from 'express'
import {CustomError} from '@/errors/CustomError'
import {ERROR_CODES} from '@/utils/constants'
import prisma from '@/lib/prisma'

export const createAccountService = async (req: Request) => {
  const {userId} = req as any // authenticateUser 미들웨어에서 userId를 설정했다고 가정
  const {name, feeRate, isDefault} = req.body

  // 필수 값 검증
  if (!name || feeRate === undefined) {
    throw new CustomError(
      '필수 값이 누락되었습니다. (필수: name, feeRate)',
      ERROR_CODES.MISSING_VALUE,
      400
    )
  }

  const parsedFeeRate = parseFloat(feeRate)
  if (isNaN(parsedFeeRate)) {
    throw new CustomError(
      '수수료율은 숫자 값이어야 합니다.',
      ERROR_CODES.INVALID_VALUE,
      400
    )
  }

  // 클라이언트가 isDefault true를 보내면, 해당 사용자의 다른 계좌는 기본 상태를 false로 업데이트
  if (isDefault === 'true' || isDefault === true) {
    await prisma.account.updateMany({
      where: {userId},
      data: {isDefault: false}
    })
  }

  // 새로운 account 생성
  const account = await prisma.account.create({
    data: {
      user: {connect: {id: userId}},
      name,
      feeRate: parsedFeeRate,
      isDefault: isDefault === 'true' || isDefault === true ? true : false
    }
  })

  return account
}
