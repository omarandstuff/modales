import { Location, History } from 'history'
import RouterRef from '../src/RouterRef'
import generateLocation from './helpers/generateLocation'
import generateHistory from './helpers/generateHistory'

describe('RouterRef', (): void => {
  describe('History methods', (): void => {
    it('just proxy the history navigation methods', (): void => {
      const location: Location = generateLocation()
      const history: History = generateHistory()
      const routerRef: RouterRef = new RouterRef(location, history)

      const block: jest.Mock = history.block as jest.Mock
      const go: jest.Mock = history.block as jest.Mock
      const goBack: jest.Mock = history.block as jest.Mock
      const goForward: jest.Mock = history.block as jest.Mock
      const push: jest.Mock = history.block as jest.Mock
      const replace: jest.Mock = history.block as jest.Mock

      routerRef.block()
      routerRef.go(2)
      routerRef.goBack()
      routerRef.goForward()
      routerRef.push('/path')
      routerRef.replace('/path2')

      expect(block.mock.calls.length).toEqual(1)
      expect(go.mock.calls.length).toEqual(1)
      expect(goBack.mock.calls.length).toEqual(1)
      expect(goForward.mock.calls.length).toEqual(1)
      expect(push.mock.calls.length).toEqual(1)
      expect(replace.mock.calls.length).toEqual(1)
    })
  })

  describe('.isModalLocation', (): void => {
    describe('a location is passed as argument', () => {
      it('returns true if the location has a state property modal as true or otherwise false', (): void => {
        const location: Location = generateLocation()
        const history: History = generateHistory()
        const routerRef: RouterRef = new RouterRef(location, history)

        expect(routerRef.isModalLocation(generateLocation('/path', 'key', { modal: true }))).toEqual(true)
        expect(routerRef.isModalLocation(generateLocation('/path', 'key', { modal: false }))).toEqual(false)
        expect(routerRef.isModalLocation(generateLocation('/path', 'key'))).toEqual(false)
      })
    })

    describe('a location is not passed as argument', () => {
      it('returns true if the location that was provider in constructor has a state property modal as true or otherwise false', (): void => {
        let location: Location = generateLocation('/path', 'key', { modal: true })
        const history: History = generateHistory()
        let routerRef: RouterRef = new RouterRef(location, history)

        expect(routerRef.isModalLocation()).toEqual(true)

        location = generateLocation('/path', 'key', { modal: false })
        routerRef = new RouterRef(location, history)

        expect(routerRef.isModalLocation()).toEqual(false)

        location = generateLocation('/path', 'key')
        routerRef = new RouterRef(location, history)

        expect(routerRef.isModalLocation()).toEqual(false)
      })
    })
  })
})
