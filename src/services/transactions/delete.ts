// import {CustomError} from '../../errors/CustomError'
// import client from '../../../prisma/db'
// import {ERROR_CODES} from '../../utils/constants'

// export const deleteTransactionById = async (id: string) => {
//   if (!id) {
//     throw new CustomError('id 필요합니다.', ERROR_CODES.MISSING_VALUE)
//   }

//   const deleted = await client.transaction.delete({
//     where: {id: id}
//   })

//   return {transaction: deleted}
// }
