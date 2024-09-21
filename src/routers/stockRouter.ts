import {Router} from 'express'

export const transactionRouter = (...args: any[]) => {
  const router = Router()
  return router.get('/', (req, res) => {
    console.log(req.cookies)
    res.json({ok: true})
  })
}
