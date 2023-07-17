import { expect } from 'chai'
import { FileRepository, getConfigSync, search } from '../src/engine'
import lunr from 'lunr'

let files: any
let lunrIndex: any

describe ('Search engine', () => {
  before(() => {
    files = getConfigSync('files.json', 'index') as FileRepository
    const lunrIndexSource = getConfigSync('lunr.json', 'index')
    lunrIndex = lunr.Index.load(lunrIndexSource)
  })

  it('returns results', () => {
    const results = search(lunrIndex, files, 'backup')
    expect(results).not.to.be.null
  })

  it('by default returns a maximum of 50 results', () => {
    const results = search(lunrIndex, files, 'backup')
    expect(results.length).to.equal(50)
  })

  it('the "main" version works just like "master"', () => {
    const results1 = search(lunrIndex, files, 'backup', undefined, 'master')
    const results2 = search(lunrIndex, files, 'backup', undefined, 'main')
    expect(results1.length).to.equal(50)
    expect(results2.length).to.equal(50)
    expect(results1).to.deep.equal(results2)
  })

  it('the "default" version works just like "master"', () => {
    const results1 = search(lunrIndex, files, 'backup', undefined, 'master')
    const results2 = search(lunrIndex, files, 'backup', undefined, 'default')
    expect(results1.length).to.equal(50)
    expect(results2.length).to.equal(50)
    expect(results1).to.deep.equal(results2)
  })

  it('can be filtered by version', () => {
    const results = search(lunrIndex, files, 'backup', undefined, '0.1')
    expect(results.length).to.equal(7)
  })

  it('can be return a maximum number of results', () => {
    const results = search(lunrIndex, files, 'backup', 2, '0.1')
    expect(results.length).to.equal(2)
  })
})
