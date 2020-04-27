import SearchResult from "./search_result"
import { Request } from "express"
import { Response } from "express-serve-static-core"

import express from 'express'
import path from 'path'
import fs from 'fs'
import lunr from 'lunr'
import 'log-timestamp'

type FileRepository = { [ref: string]: SearchResult }

/**
 * Returns the contents of the JSON file whose name is passed as parameter.
 * @param file A valid filename
 */
function readJsonFileSync(filepath: string, encoding = 'utf8'): object {
  if (!fs.existsSync(filepath)) {
    throw `File "${filepath}" does not exist'`
  }
  const file = fs.readFileSync(filepath, encoding)
  return JSON.parse(file)
}

/**
 * Returns a JSON object with the contents of a configuration file.
 * @param file A valid filename
 */
function getConfigSync(file: string): object {
  const filepath = path.join('/site/index', file)
  return readJsonFileSync(filepath)
}

/**
 * Returns true if a string is null, undefined, empty or blank after trimming.
 * @param s The string to test
 */
function isEmptyOrBlank(s: string): boolean {
  return (!s || s.length === 0 || !s.trim())
}

/**
 * Performs the actual search against the Lunr index.
 * @param lunrIndex The Lunr.js index
 * @param files The repository of files
 * @param query Text to search
 * @param count (Optional, default 10) Number of items to return
 */
function search(lunrIndex: lunr.Index, files: FileRepository, query: string, count = 10): SearchResult[] {
  console.log(`Searching for "${query}" (count = ${count})`)
  if (isEmptyOrBlank(query)) {
    return []
  }
  const results: SearchResult[] = lunrIndex.search(query.trim())
    .slice(0, count)
    .map((result: lunr.Index.Result) => {
      return files[result.ref]
    })
  return results
}

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
    res.send(search(lunrIndex, files, req.query.q, req.query.c))
  })

  app.listen(port, () => console.log(`Search engine listening on port ${port}`))
}
catch (error) {
  console.error(`Application error: ${error}`)
}
