// import {CustomError} from '../../errors/CustomError'
// import client from '../../../prisma/db'
// import {ERROR_CODES} from '../../utils/constants'

// export const deleteBuyTransactionById = async (id: string) => {
//   if (!id) {
//     throw new CustomError('id 필요합니다.', ERROR_CODES.MISSING_VALUE)
//   }

//   const deleted = await client.buyTransaction.delete({
//     where: {id: id}
//   })

//   return {transaction: deleted}
// }

// export const deleteSellTransactionById = async (id: string) => {
//   if (!id) {
//     throw new CustomError('id 필요합니다.', ERROR_CODES.MISSING_VALUE)
//   }

//   const deleted = await client.sellTransaction.delete({
//     where: {id: id}
//   })

//   return {transaction: deleted}
// }
