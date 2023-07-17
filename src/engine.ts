import SearchResult from "./search_result"
import path from 'path'
import fs from 'fs'

export type FileRepository = { [ref: string]: SearchResult }

/**
 * Performs the actual search against the Lunr index.
 * This function takes a "version" parameter; if this parameter is "master" or "main", then all search
 * results are included in the response. If a different value is provided, only those values are returned.
 * @param lunrIndex The Lunr.js index
 * @param files The repository of files
 * @param query Text to search
 * @param count (Optional, default 50) Number of items to return
 * @param version (Optional, default "master") Version of the search results to return
 */
export function search(lunrIndex: lunr.Index, files: FileRepository, query: string, count = 50, version = 'master'): SearchResult[] {
  if (isEmptyOrBlank(query)) {
    return []
  }
  const results: SearchResult[] = lunrIndex.search(query.trim())
    .map((result: lunr.Index.Result) => {
      return files[result.ref]
    })
    .filter((result: SearchResult) => {
      // This "or" statement short-circuits the evaluation: if "master" or "main" are mentioned,
      // the result is included; otherwise, if the version coincides, it is included.
      if (version === 'master' || version === 'main' || result.version === version) {
        return result
      }
    })
    .slice(0, count)
  return results
}

/**
 * Returns a JSON object with the contents of a configuration file.
 * @param file A valid filename
 */
export function getConfigSync(file: string, folder = '/site/index'): object {
  const filepath = path.join(folder, file)
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
