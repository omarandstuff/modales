import * as React from 'react'
import { shallow, ShallowWrapper } from 'enzyme'
import { Location, History, Action } from 'history'
import { match } from 'react-router'

import Modales from '../src/Modales'
import ProviderHelper from '../src/ProviderHelper'
import { ModalesProvider } from '../src/ModalesProvider'

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
  baseLocation?: Location
  intialId?: string
  historyIndex?: number
  historyOrder?: string[]
  historyMap?: { [key: string]: Location }
  lastLocation?: Location
  providerHelper?: ProviderHelper
}

class ModalesProviderX extends ModalesProvider {
  public setTestInterface(testInterface: ProviderTestInterface): void {
    this.baseLocation = testInterface.baseLocation || this.baseLocation
    this.intialId = testInterface.intialId || this.intialId
    this.historyIndex = testInterface.historyIndex || this.historyIndex
    this.historyOrder = testInterface.historyOrder || this.historyOrder
    this.historyMap = testInterface.historyMap || this.historyMap
    this.lastLocation = testInterface.lastLocation || this.lastLocation
    this.providerHelper = testInterface.providerHelper || this.providerHelper
  }

  public getTestInterface(): ProviderTestInterface {
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

beforeEach((): void => {})

describe('ModalesProvider', (): void => {
  describe('Constructor', (): void => {
    it('sets an initial location id with a random one', (): void => {
      const location: Location = generateLocation()
      const history: History = generateHistory(location)
      const match: match = generateMatch()
      const modales: Modales = new Modales()

      const component: ShallowWrapper = shallow(React.createElement(ModalesProviderX, { location, history, match, modales }))
      const instance: ModalesProviderX = component.instance() as ModalesProviderX

      expect(instance.props.location.key).toEqual(instance.getTestInterface().intialId)
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
        expect(instance.props.location).toBe(instance.getTestInterface().baseLocation)
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
      expect(connectWithProvider.mock.calls[0][0]).toBe(instance.getTestInterface().providerHelper)
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
      const testInterface: ProviderTestInterface = instance.getTestInterface()

      expect(testInterface.historyOrder[0]).toEqual(propsLocation.key)
      expect(testInterface.historyMap[propsLocation.key]).toBe(propsLocation)
    })
  })

  describe('Location prop changes', () => {
    describe('And is sitted in the first baselocation', () => {
      describe('A new location PUSH has come form props', () => {
        it('scrolls to top', (): void => {
          const location: Location = generateLocation()
          const history: History = generateHistory(location)
          const match: match = generateMatch()
          const modales: Modales = new Modales()

          const component: ShallowWrapper = shallow(React.createElement(ModalesProviderX, { location, history, match, modales }))
          const instance: ModalesProviderX = component.instance() as ModalesProviderX
          // Shallow provider will not instantiate a ModalesScene so we need to set this
          instance.getTestInterface().providerHelper.modalsUpdateCallBack = jest.fn()

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
          const instance: ModalesProviderX = component.instance() as ModalesProviderX
          instance.getTestInterface().providerHelper.modalsUpdateCallBack = jest.fn()

          const newLocation: Location = generateLocation('/newPath', 'key1')

          component.setProps({ location: newLocation })

          expect(connectWithRouter.mock.calls.length).toEqual(2)
          expect(connectWithRouter.mock.calls[1][0]).toBe(newLocation)
        })

        describe('and the incoming location is not a modal', () => {
          it('just pushes the new location ans set it as base location', (): void => {
            const location: Location = generateLocation()
            const history: History = generateHistory(location)
            const match: match = generateMatch()
            const modales: Modales = new Modales()

            const component: ShallowWrapper = shallow(React.createElement(ModalesProviderX, { location, history, match, modales }))
            const instance: ModalesProviderX = component.instance() as ModalesProviderX
            instance.getTestInterface().providerHelper.modalsUpdateCallBack = jest.fn()

            const newLocation: Location = generateLocation('/newPath', 'key1')
            component.setProps({ location: newLocation, history: generateHistory(newLocation, 'PUSH') })

            const testInterface: ProviderTestInterface = instance.getTestInterface()

            expect(testInterface.historyOrder[1]).toEqual(instance.props.location.key)
            expect(testInterface.historyMap[newLocation.key]).toBe(instance.props.location)
            expect(testInterface.baseLocation).toBe(instance.props.location)
          })
        })

        describe('and the incoming location is yes a modal', () => {
          it('leaves the base location alone, launches a modal and kepps track of the modal id in location', (): void => {
            const location: Location = generateLocation()
            const history: History = generateHistory(location)
            const match: match = generateMatch()
            const modales: Modales = new Modales()

            const component: ShallowWrapper = shallow(React.createElement(ModalesProviderX, { location, history, match, modales }))
            const instance: ModalesProviderX = component.instance() as ModalesProviderX
            instance.getTestInterface().providerHelper.modalsUpdateCallBack = jest.fn()

            const newLocation: Location = generateLocation('/newPath', 'key1', { modal: true })
            component.setProps({ location: newLocation, history: generateHistory(newLocation, 'PUSH') })

            const testInterface: ProviderTestInterface = instance.getTestInterface()

            expect(newLocation.state).toEqual({ modalId: 0, modal: true })
            expect(testInterface.baseLocation).toBe(location)
            expect(testInterface.providerHelper.modals.length).toEqual(1)
            expect(testInterface.providerHelper.modals[0]).toMatchObject({ location: instance.props.location })
          })

          describe('but the route modales are disabled from config', () => {
            it('forces the new location to be base location', (): void => {
              const location: Location = generateLocation()
              const history: History = generateHistory(location)
              const match: match = generateMatch()
              const modales: Modales = new Modales({ routeModalsEnabled: false })

              const component: ShallowWrapper = shallow(React.createElement(ModalesProviderX, { location, history, match, modales }))
              const instance: ModalesProviderX = component.instance() as ModalesProviderX
              instance.getTestInterface().providerHelper.modalsUpdateCallBack = jest.fn()

              const newLocation: Location = generateLocation('/newPath', 'key1', { modal: true })
              component.setProps({ location: newLocation, history: generateHistory(newLocation, 'PUSH') })

              const testInterface: ProviderTestInterface = instance.getTestInterface()

              expect(testInterface.baseLocation).toBe(newLocation)
              expect(testInterface.providerHelper.modals.length).toEqual(0)
            })
          })
        })
      })

      describe('A new location POP has come form props (The user is messing with the broweser history)', () => {
        describe('and the incoming location is not a modal', () => {
          it('uses the new location but leaves the provider in oblivion by seting locationIndex to -1', (): void => {
            const location: Location = generateLocation()
            const history: History = generateHistory(location)
            const match: match = generateMatch()
            const modales: Modales = new Modales()

            const component: ShallowWrapper = shallow(React.createElement(ModalesProviderX, { location, history, match, modales }))
            const instance: ModalesProviderX = component.instance() as ModalesProviderX
            instance.getTestInterface().providerHelper.modalsUpdateCallBack = jest.fn()

            const newLocation: Location = generateLocation('/newPath', 'key1')
            component.setProps({ location: newLocation, history: generateHistory(newLocation, 'POP') })

            const testInterface: ProviderTestInterface = instance.getTestInterface()

            expect(testInterface.historyIndex).toEqual(-1)
            expect(testInterface.historyOrder.length).toEqual(1)
            expect(testInterface.historyOrder[0]).toEqual(location.key)
            expect(testInterface.baseLocation).toBe(instance.props.location)
          })
        })

        describe('and the incoming location is yes a modal', () => {
          it('forces the new location and does the same as if it was not modal', (): void => {
            const location: Location = generateLocation()
            const history: History = generateHistory(location)
            const match: match = generateMatch()
            const modales: Modales = new Modales()

            const component: ShallowWrapper = shallow(React.createElement(ModalesProviderX, { location, history, match, modales }))
            const instance: ModalesProviderX = component.instance() as ModalesProviderX
            instance.getTestInterface().providerHelper.modalsUpdateCallBack = jest.fn()

            const newLocation: Location = generateLocation('/newPath', 'key1', { modal: true })
            component.setProps({ location: newLocation, history: generateHistory(newLocation, 'POP') })

            const testInterface: ProviderTestInterface = instance.getTestInterface()

            expect(newLocation.state.modal).toEqual(false)
            expect(testInterface.historyIndex).toEqual(-1)
            expect(testInterface.historyOrder.length).toEqual(1)
            expect(testInterface.historyOrder[0]).toEqual(location.key)
            expect(testInterface.baseLocation).toBe(instance.props.location)
          })
        })
      })

      describe('A new location REPLACE has come form props', () => {
        describe('and the incoming location is not a modal', () => {
          it('just replaces the base location with thew newone', (): void => {
            const location: Location = generateLocation()
            const history: History = generateHistory(location)
            const match: match = generateMatch()
            const modales: Modales = new Modales()

            const component: ShallowWrapper = shallow(React.createElement(ModalesProviderX, { location, history, match, modales }))
            const instance: ModalesProviderX = component.instance() as ModalesProviderX
            instance.getTestInterface().providerHelper.modalsUpdateCallBack = jest.fn()

            const newLocation: Location = generateLocation('/newPath', 'key1')
            component.setProps({ location: newLocation, history: generateHistory(newLocation, 'REPLACE') })

            const testInterface: ProviderTestInterface = instance.getTestInterface()

            expect(testInterface.historyOrder[0]).toEqual(instance.props.location.key)
            expect(testInterface.historyMap[newLocation.key]).toBe(instance.props.location)
            expect(testInterface.baseLocation).toBe(instance.props.location)
          })
        })

        describe('and the incoming location is yes a modal', () => {
          it('forces the new location to not be modal and replace the base location', (): void => {
            const location: Location = generateLocation()
            const history: History = generateHistory(location)
            const match: match = generateMatch()
            const modales: Modales = new Modales()

            const component: ShallowWrapper = shallow(React.createElement(ModalesProviderX, { location, history, match, modales }))
            const instance: ModalesProviderX = component.instance() as ModalesProviderX
            instance.getTestInterface().providerHelper.modalsUpdateCallBack = jest.fn()

            const newLocation: Location = generateLocation('/newPath', 'key1', { modal: true })
            component.setProps({ location: newLocation, history: generateHistory(newLocation, 'REPLACE') })

            const testInterface: ProviderTestInterface = instance.getTestInterface()

            expect(newLocation.state.modal).toEqual(false)
            expect(testInterface.historyOrder[0]).toEqual(instance.props.location.key)
            expect(testInterface.historyMap[newLocation.key]).toBe(instance.props.location)
            expect(testInterface.baseLocation).toBe(instance.props.location)
          })
        })
      })
    })
  })
})
