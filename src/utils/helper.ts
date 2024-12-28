import {TransactionStatus} from '@prisma/client'

export const getOpposite = (
  type: TransactionStatus
): 'SELL' | 'BUY' | 'NONE' => {
  if (type === 'BUY') {
    return 'SELL'
  } else if (type === 'SELL') {
    return 'BUY'
  }
  return 'NONE'
}

export const getDuration = (start: Date, end: Date) => {
  return (
    (Math.abs(start.getTime() - end.getTime()) + 24 * 60 * 60 * 1000) /
    1000 /
    60 /
    60 /
    24
  )
}
