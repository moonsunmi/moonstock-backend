import {createServer} from 'http'
import {createExpressApp} from './express'
import {makeDir} from './utils'
import {getPublicDirPath} from './config'

makeDir(getPublicDirPath())

const hostname = 'localhost'
const port = 4000
createServer(createExpressApp()).listen(port, () =>
  console.log(`connect http://${hostname}:${port}`)
)
