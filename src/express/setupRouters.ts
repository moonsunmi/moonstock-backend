import {Express} from 'express'
import * as R from '../routers/'

export const setupRouters = (app: Express, ...args: any[]): Express => {
  return app
    .use('/auth', R.authRouter(...args))
    .use('/users', R.usersRouter(...args))
    .use('/test', R.testRouter(...args))
}
