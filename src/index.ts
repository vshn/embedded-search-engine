import SearchResult from "./search_result"
import { Request } from "express"
import { Response } from "express-serve-static-core"

import express from 'express'
import path from 'path'
import fs from 'fs'
import lunr from 'lunr'

type FileReference = { [ref: string]: SearchResult }

const files = getConfig('files.json') as FileReference
const lunrIndexSource = getConfig('lunr.json')
const lunrIndex = lunr.Index.load(lunrIndexSource)

function readJsonFileSync(filepath: string, encoding = 'utf8'): object {
  const file = fs.readFileSync(filepath, encoding)
  return JSON.parse(file)
}

function getConfig(file: string): object {
  const filepath = path.join(__dirname, '..', 'index', file)
  return readJsonFileSync(filepath)
}

function isEmptyOrBlank(s: string): boolean {
  return (!s || s.length === 0 || !s.trim())
}

function search(query: string): SearchResult[] {
  if (isEmptyOrBlank(query)) {
    return []
  }
  // Search with Lunr.js, but return at most 10 items.
  const results: SearchResult[] = lunrIndex.search(query.trim())
                                           .slice(0, 10)
                                           .map(function (result: lunr.Index.Result) {
    return files[result.ref]
  })
  return results
}

// Entry point
try {
  const app = express()
  app.get('/search', (req: Request, res: Response) => {
    res.send(search(req.query.q))
  })

  const port = 3000
  app.listen(port, () => console.log(`Search engine listening on port ${port}`))
}
catch (error) {
  console.error('Application error: ' + error)
}
