import { Request } from "express"
import { Response } from "express-serve-static-core"

import express from 'express'
import lunr from 'lunr'
import 'log-timestamp'
import { FileRepository, getConfigSync, search } from "./engine"

// Entry point of the application
try {
  const app = express()

  // These methods are synchronous, after all
  // the index is only read once and then held in memory
  const files = getConfigSync('files.json') as FileRepository
  const lunrIndexSource = getConfigSync('lunr.json')
  const lunrIndex = lunr.Index.load(lunrIndexSource)
  const port = 3000

  // API endpoint
  app.get('/search', (req: Request, res: Response) => {
    const query = req.query['q'] as string
    const version = req.query["v"] as string
    const countString = req.query['c'] as string
    const count: number = (countString) ? parseInt(countString) : 50
    res.send(search(lunrIndex, files, query, count, version))
  })

  app.listen(port, () => console.log(`Search engine listening on port ${port}`))
}
catch (error) {
  console.error(`Application error: ${error}`)
}
