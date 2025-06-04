import {Express} from 'express'
import * as R from '../routers'

export const setupRouters = (app: Express, ...args: any[]): Express => {
  return app
    .use('/auth', R.authRouter(...args))
    .use('/account', R.accountsRouter(...args))
    .use('/trade', R.tradeRouter(...args))
    .use('/users', R.usersRouter(...args))
    .use('/stocks', R.stockRouter(...args))
    .use('/test', R.testRouter(...args))
}
