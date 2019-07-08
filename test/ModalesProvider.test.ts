import * as React from 'react'
import { shallow, ShallowWrapper } from 'enzyme'
import { Location, History, Action } from 'history'
import { match, RouteComponentProps } from 'react-router'

import Modales from '../src/Modales'
import ProviderHelper from '../src/ProviderHelper'
import { ModalesProvider, ModalesProviderProps } from '../src/ModalesProvider'

jest.useFakeTimers()

function generateLocation(pathname?: string, key?: string, state?: {}): Location {
  return {
    key: key,
    pathname: pathname || '',
    state: state || {},
    search: '',
    hash: ''
  }
}

function generateHistory(location?: Location, action?: Action): History {
  return {
    length: 0,
    location: location || generateLocation(),
    action: action || 'PUSH',
    push: jest.fn(),
    replace: jest.fn(),
    go: jest.fn(),
    goBack: jest.fn(),
    goForward: jest.fn(),
    block: jest.fn(),
    listen: jest.fn(),
    createHref: jest.fn()
  }
}

function generateMatch(params?: {}, path?: string, isExact?: boolean, url?: string): match {
  return {
    params: params || {},
    path: path || '',
    isExact: isExact || false,
    url: url || ''
  }
}

interface ProviderTestInterface {
  baseLocation: Location
  intialId: string
  historyIndex: number
  historyOrder: string[]
  historyMap: { [key: string]: Location }
  lastLocation: Location
  providerHelper: ProviderHelper
}

let providerTestInterface: ProviderTestInterface = null

class ModalesProviderX extends ModalesProvider {
  public constructor(props: ModalesProviderProps) {
    super(props)

    providerTestInterface = this.getInterface()
  }

  public setInterface(): void {
    providerTestInterface = this.getInterface()
  }

  private getInterface(): ProviderTestInterface {
    return {
      baseLocation: this.baseLocation,
      intialId: this.intialId,
      historyIndex: this.historyIndex,
      historyOrder: this.historyOrder,
      historyMap: this.historyMap,
      lastLocation: this.lastLocation,
      providerHelper: this.providerHelper
    }
  }
}

beforeEach((): void => {
  providerTestInterface = null
})

describe('ModalesProvider', (): void => {
  describe('Constructor', (): void => {
    it('sets an initial location id with a random one', (): void => {
      const location: Location = generateLocation()
      const history: History = generateHistory(location)
      const match: match = generateMatch()
      const modales: Modales = new Modales()

      const component: ShallowWrapper = shallow(React.createElement(ModalesProviderX, { location, history, match, modales }))
      const instance: ModalesProviderX = component.instance() as ModalesProviderX

      expect(instance.props.location.key).toEqual(providerTestInterface.intialId)
    })

    describe('if the iniital location is set as modal', () => {
      it('sets it as false since a initial location can only be base location', () => {
        const location: Location = generateLocation('', '', { modal: true })
        const history: History = generateHistory(location)
        const match: match = generateMatch()
        const modales: Modales = new Modales()

        const component: ShallowWrapper = shallow(React.createElement(ModalesProviderX, { location, history, match, modales }))
        const instance: ModalesProviderX = component.instance() as ModalesProviderX

        expect(instance.props.location.state.modal).toBe(false)
        expect(instance.props.location).toBe(providerTestInterface.baseLocation)
      })
    })

    it('connects with the modales passed instance', (): void => {
      const location: Location = generateLocation()
      const history: History = generateHistory(location)
      const match: match = generateMatch()
      const modales: Modales = new Modales()

      const connectWithProvider: jest.Mock = jest.fn()
      const connectWithRouter: jest.Mock = jest.fn()

      modales.connectWithProvider = connectWithProvider
      modales.connectWithRouter = connectWithRouter

      const component: ShallowWrapper = shallow(React.createElement(ModalesProviderX, { location, history, match, modales }))
      const instance: ModalesProviderX = component.instance() as ModalesProviderX

      expect(connectWithProvider.mock.calls.length).toEqual(1)
      expect(connectWithProvider.mock.calls[0][0]).toBe(providerTestInterface.providerHelper)
      expect(connectWithRouter.mock.calls.length).toEqual(1)
      expect(connectWithRouter.mock.calls[0][0]).toEqual(instance.props.location)
      expect(connectWithRouter.mock.calls[0][1]).toEqual(instance.props.history)
    })

    it('keeps a track of the first location and maps it', (): void => {
      const location: Location = generateLocation()
      const history: History = generateHistory(location)
      const match: match = generateMatch()
      const modales: Modales = new Modales()

      const component: ShallowWrapper = shallow(React.createElement(ModalesProviderX, { location, history, match, modales }))
      const instance: ModalesProviderX = component.instance() as ModalesProviderX

      const propsLocation: Location = instance.props.location

      expect(providerTestInterface.historyOrder[0]).toEqual(propsLocation.key)
      expect(providerTestInterface.historyMap[propsLocation.key]).toBe(propsLocation)
    })
  })

  describe('A new location has come form props', () => {
    describe('and is a diferent pathname', () => {
      it('scrolls to top', (): void => {
        const location: Location = generateLocation()
        const history: History = generateHistory(location)
        const match: match = generateMatch()
        const modales: Modales = new Modales()

        const component: ShallowWrapper = shallow(React.createElement(ModalesProviderX, { location, history, match, modales }))

        // Shallow provider will not instantiate a ModalesScene so we need to set this
        providerTestInterface.providerHelper.modalsUpdateCallBack = jest.fn()

        const scrollToMock: jest.Mock = jest.fn()
        window.scrollTo = scrollToMock

        component.setProps({ location: generateLocation('/newPath', 'key1') })

        jest.runAllTimers()

        expect(scrollToMock.mock.calls.length).toEqual(1)
      })

      it('re-connects with the modales passed instance', (): void => {
        const location: Location = generateLocation()
        const history: History = generateHistory(location)
        const match: match = generateMatch()
        const modales: Modales = new Modales()

        const connectWithProvider: jest.Mock = jest.fn()
        const connectWithRouter: jest.Mock = jest.fn()

        modales.connectWithProvider = connectWithProvider
        modales.connectWithRouter = connectWithRouter

        const component: ShallowWrapper = shallow(React.createElement(ModalesProviderX, { location, history, match, modales }))

        // Shallow provider will not instantiate a ModalesScene so we need to set this
        providerTestInterface.providerHelper.modalsUpdateCallBack = jest.fn()

        const newLocation: Location = generateLocation('/newPath', 'key1')

        component.setProps({ location: newLocation })

        expect(connectWithRouter.mock.calls.length).toEqual(2)
        expect(connectWithRouter.mock.calls[1][0]).toBe(newLocation)
      })
    })
  })
})
