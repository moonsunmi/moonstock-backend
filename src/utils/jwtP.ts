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
