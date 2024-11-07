import {
  Jwt,
  JwtPayload,
  sign,
  SignOptions,
  verify,
  VerifyOptions
} from 'jsonwebtoken'

const secret = 'secretKeyforMoonstock'

export const jwtSignP = (payload: Buffer | object, options: SignOptions = {}) =>
  new Promise<string>((resolve, reject) => {
    try {
      const jwt = sign(payload, secret, {
        expiresIn: '1d',
        ...options
      })
      resolve(jwt)
    } catch (e) {
      reject(e)
    }
  })

export const jwtVerifyP = (token: string, options: VerifyOptions = {}) =>
  new Promise<Jwt | JwtPayload | string>((resolve, reject) => {
    try {
      const decoded = verify(token, secret, options)
      resolve(decoded)
    } catch (e) {
      reject(e)
    }
  })

export const extractUserIdFromJwt = (token: string): any | null => {
  try {
    const decoded = verify(token, secret)

    if (typeof decoded === 'object') {
      const {id} = decoded
      return id
    }
    return null
  } catch (err) {
    console.log(
      // todo. 환경에 맞춰서 에러 메시지 ?
      process.env.NODE_ENV === 'development'
        ? `토큰 검증 실패: ${err}`
        : '토큰 검증 실패'
    )
    return null
  }
}
