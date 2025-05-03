export class CustomError extends Error {
  statusCode: number
  errorCode: string

  constructor(message: string, errorCode: string, statusCode = 400) {
    super(message)
    this.statusCode = statusCode
    this.errorCode = errorCode
  }
}
