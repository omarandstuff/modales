import * as React from 'react'
import { shallow, ShallowWrapper } from 'enzyme'
import { Location, History } from 'history'
import { match as Match } from 'react-router'

import Modales from '../src'
import ModalesProviderX, { ProviderTestInterface } from './helpers/ModalesProviderX'
import generateLocation from './helpers/generateLocation'
import generateHistory from './helpers/generateHistory'
import generateMatch from './helpers/generateMatch'

jest.useFakeTimers()

beforeEach((): void => {})

describe('ModalesProvider', (): void => {
  describe('Constructor', (): void => {
    it('sets an initial location id with a random one', (): void => {
      const location: Location = generateLocation()
      const history: History = generateHistory(location)
      const match: Match = generateMatch()
      const modales: Modales = new Modales()

      const component: ShallowWrapper = shallow(React.createElement(ModalesProviderX, { location, history, match, modales }))
      const instance: ModalesProviderX = component.instance() as ModalesProviderX

      expect(instance.props.location.key).toEqual(instance.getTestInterface().intialId)
    })

    describe('if the iniital location is set as modal', (): void => {
      it('sets it as false since a initial location can only be base location', (): void => {
        const location: Location = generateLocation('', '', { modal: true })
        const history: History = generateHistory(location)
        const match: Match = generateMatch()
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
      const match: Match = generateMatch()
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
      const match: Match = generateMatch()
      const modales: Modales = new Modales()

      const component: ShallowWrapper = shallow(React.createElement(ModalesProviderX, { location, history, match, modales }))
      const instance: ModalesProviderX = component.instance() as ModalesProviderX

      const propsLocation: Location = instance.props.location
      const testInterface: ProviderTestInterface = instance.getTestInterface()

      expect(testInterface.historyOrder[0]).toEqual(propsLocation.key)
      expect(testInterface.historyMap[propsLocation.key]).toBe(propsLocation)
    })
  })

  describe('Location prop changes', (): void => {
    describe('And is sitted in the first baselocation', (): void => {
      describe('A new location PUSH has come form props', (): void => {
        it('scrolls to top', (): void => {
          const location: Location = generateLocation()
          const history: History = generateHistory(location)
          const match: Match = generateMatch()
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
          const match: Match = generateMatch()
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

        describe('and the incoming location is not a modal', (): void => {
          it('just pushes the new location and set it as base location', (): void => {
            const location: Location = generateLocation()
            const history: History = generateHistory(location)
            const match: Match = generateMatch()
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

        describe('and the incoming location is yes a modal', (): void => {
          it('leaves the base location alone, launches a modal and kepps track of the modal id in location', (): void => {
            const location: Location = generateLocation()
            const history: History = generateHistory(location)
            const match: Match = generateMatch()
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

          describe('but the route modales are disabled from config', (): void => {
            it('forces the new location to be base location', (): void => {
              const location: Location = generateLocation()
              const history: History = generateHistory(location)
              const match: Match = generateMatch()
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

        describe('and there are custom modals launched', (): void => {
          it('just pushes the new location, set it as base location and cleans up any open modal', (): void => {
            const location: Location = generateLocation()
            const history: History = generateHistory(location)
            const match: Match = generateMatch()
            const modales: Modales = new Modales()

            const component: ShallowWrapper = shallow(React.createElement(ModalesProviderX, { location, history, match, modales }))
            const instance: ModalesProviderX = component.instance() as ModalesProviderX
            instance.getTestInterface().providerHelper.modalsUpdateCallBack = jest.fn()

            let testInterface: ProviderTestInterface = instance.getTestInterface()

            modales.launchModal('Content')
            modales.launchModal('Content2')

            expect(testInterface.providerHelper.modals).toMatchObject([
              { id: 0, type: 'custom', content: 'Content' },
              { id: 1, type: 'custom', content: 'Content2' }
            ])

            const newLocation: Location = generateLocation('/newPath', 'key1')
            component.setProps({ location: newLocation, history: generateHistory(newLocation, 'PUSH') })

            testInterface = instance.getTestInterface()

            expect(testInterface.historyOrder[1]).toEqual(instance.props.location.key)
            expect(testInterface.historyMap[newLocation.key]).toBe(instance.props.location)
            expect(testInterface.baseLocation).toBe(instance.props.location)
            expect(testInterface.providerHelper.modals).toEqual([])
          })
        })

        describe('and there are some location ahead in history', (): void => {
          it('just pushes the new location, set it as base location and cleans the locations ahead', (): void => {
            const location: Location = generateLocation()
            const history: History = generateHistory(location)
            const match: Match = generateMatch()
            const modales: Modales = new Modales()

            const component: ShallowWrapper = shallow(React.createElement(ModalesProviderX, { location, history, match, modales }))
            const instance: ModalesProviderX = component.instance() as ModalesProviderX
            instance.getTestInterface().providerHelper.modalsUpdateCallBack = jest.fn()

            let testInterface: ProviderTestInterface = instance.getTestInterface()
            instance.setTestInterface({
              historyMap: {
                ...testInterface.historyMap,
                key1: generateLocation('/newPath', 'key1', { modal: true }),
                key2: generateLocation('/newPath2', 'key2', { modal: true }),
                key3: generateLocation('/newPath3', 'key3', { modal: true })
              },
              historyOrder: testInterface.historyOrder.concat(['key1', 'key2', 'key3'])
            })

            testInterface = instance.getTestInterface()

            const newLocation: Location = generateLocation('/newPath4', 'key4')
            component.setProps({ location: newLocation, history: generateHistory(newLocation, 'PUSH') })

            testInterface = instance.getTestInterface()

            expect(testInterface.historyOrder.length).toEqual(2)
            expect(testInterface.historyOrder[1]).toEqual(instance.props.location.key)
            expect(testInterface.historyMap[newLocation.key]).toBe(instance.props.location)
            expect(testInterface.baseLocation).toBe(instance.props.location)
          })
        })
      })

      describe('A new location POP has come form props (The user is messing with the broweser history)', (): void => {
        describe('and the incoming location is not a modal', (): void => {
          it('uses the new location but leaves the provider in oblivion by seting historyIndex to -1', (): void => {
            const location: Location = generateLocation()
            const history: History = generateHistory(location)
            const match: Match = generateMatch()
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

        describe('and the incoming location is yes a modal', (): void => {
          it('forces the new location and does the same as if it was not modal', (): void => {
            const location: Location = generateLocation()
            const history: History = generateHistory(location)
            const match: Match = generateMatch()
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

        describe('and the user selects a location that is some steps forward in the hostory', (): void => {
          it('just goes to that location and sets it a s base location', (): void => {
            const location: Location = generateLocation()
            const history: History = generateHistory(location)
            const match: Match = generateMatch()
            const modales: Modales = new Modales()

            const component: ShallowWrapper = shallow(React.createElement(ModalesProviderX, { location, history, match, modales }))
            const instance: ModalesProviderX = component.instance() as ModalesProviderX
            instance.getTestInterface().providerHelper.modalsUpdateCallBack = jest.fn()

            let testInterface: ProviderTestInterface = instance.getTestInterface()
            instance.setTestInterface({
              historyMap: {
                ...testInterface.historyMap,
                key1: generateLocation('/newPath', 'key1'),
                key2: generateLocation('/newPath2', 'key2'),
                key3: generateLocation('/newPath3', 'key3')
              },
              historyOrder: testInterface.historyOrder.concat(['key1', 'key2', 'key3'])
            })

            testInterface = instance.getTestInterface()

            const newLocation: Location = testInterface.historyMap['key2']
            component.setProps({ location: newLocation, history: generateHistory(newLocation, 'POP') })

            testInterface = instance.getTestInterface()

            expect(testInterface.historyIndex).toEqual(2)
            expect(testInterface.historyOrder).toEqual([testInterface.intialId, 'key1', 'key2', 'key3'])
            expect(testInterface.baseLocation).toBe(newLocation)
          })

          describe('and there are modals in between', (): void => {
            it('just goes to that location and does not recreate modals', (): void => {
              const location: Location = generateLocation()
              const history: History = generateHistory(location)
              const match: Match = generateMatch()
              const modales: Modales = new Modales()

              const component: ShallowWrapper = shallow(React.createElement(ModalesProviderX, { location, history, match, modales }))
              const instance: ModalesProviderX = component.instance() as ModalesProviderX
              instance.getTestInterface().providerHelper.modalsUpdateCallBack = jest.fn()

              let testInterface: ProviderTestInterface = instance.getTestInterface()
              instance.setTestInterface({
                historyMap: {
                  ...testInterface.historyMap,
                  key1: generateLocation('/newPath', 'key1', { modal: true }),
                  key2: generateLocation('/newPath2', 'key2', { modal: true }),
                  key3: generateLocation('/newPath3', 'key3')
                },
                historyOrder: testInterface.historyOrder.concat(['key1', 'key2', 'key3'])
              })

              modales.launchModal('Content')
              modales.launchModal('Content2')

              expect(testInterface.providerHelper.modals).toMatchObject([
                { id: 0, type: 'custom', content: 'Content' },
                { id: 1, type: 'custom', content: 'Content2' }
              ])

              testInterface = instance.getTestInterface()

              const newLocation: Location = testInterface.historyMap['key3']
              component.setProps({ location: newLocation, history: generateHistory(newLocation, 'POP') })

              testInterface = instance.getTestInterface()

              expect(testInterface.historyIndex).toEqual(3)
              expect(testInterface.historyOrder).toEqual([testInterface.intialId, 'key1', 'key2', 'key3'])
              expect(testInterface.baseLocation).toBe(newLocation)
              expect(testInterface.providerHelper.modals.length).toEqual(0)
            })
          })
        })

        describe('and the user selects a location that is some steps forward in the hostory and is modal', (): void => {
          it('recreates all the modals in between and the target one', (): void => {
            const location: Location = generateLocation()
            const history: History = generateHistory(location)
            const match: Match = generateMatch()
            const modales: Modales = new Modales()

            const component: ShallowWrapper = shallow(React.createElement(ModalesProviderX, { location, history, match, modales }))
            const instance: ModalesProviderX = component.instance() as ModalesProviderX
            instance.getTestInterface().providerHelper.modalsUpdateCallBack = jest.fn()

            let testInterface: ProviderTestInterface = instance.getTestInterface()
            instance.setTestInterface({
              historyMap: {
                ...testInterface.historyMap,
                key1: generateLocation('/newPath', 'key1', { modal: true }),
                key2: generateLocation('/newPath2', 'key2', { modal: true }),
                key3: generateLocation('/newPath3', 'key3', { modal: true })
              },
              historyOrder: testInterface.historyOrder.concat(['key1', 'key2', 'key3'])
            })

            testInterface = instance.getTestInterface()

            const newLocation: Location = testInterface.historyMap['key2']
            component.setProps({ location: newLocation, history: generateHistory(newLocation, 'POP') })

            testInterface = instance.getTestInterface()

            expect(testInterface.historyIndex).toEqual(2)
            expect(testInterface.historyOrder).toEqual([testInterface.intialId, 'key1', 'key2', 'key3'])
            expect(testInterface.baseLocation).toBe(location)
            expect(testInterface.providerHelper.modals).toMatchObject([
              { id: 0, type: 'route', location: testInterface.historyMap['key1'] },
              { id: 1, type: 'route', location: testInterface.historyMap['key2'] }
            ])
          })

          describe('And there are custom modals laucnhed', (): void => {
            it('recreates all the modals in between and the target one, and cleans up any custom modals', (): void => {
              const location: Location = generateLocation()
              const history: History = generateHistory(location)
              const match: Match = generateMatch()
              const modales: Modales = new Modales()

              const component: ShallowWrapper = shallow(React.createElement(ModalesProviderX, { location, history, match, modales }))
              const instance: ModalesProviderX = component.instance() as ModalesProviderX
              instance.getTestInterface().providerHelper.modalsUpdateCallBack = jest.fn()

              let testInterface: ProviderTestInterface = instance.getTestInterface()
              instance.setTestInterface({
                historyMap: {
                  ...testInterface.historyMap,
                  key1: generateLocation('/newPath', 'key1', { modal: true }),
                  key2: generateLocation('/newPath2', 'key2', { modal: true }),
                  key3: generateLocation('/newPath3', 'key3', { modal: true })
                },
                historyOrder: testInterface.historyOrder.concat(['key1', 'key2', 'key3'])
              })

              testInterface = instance.getTestInterface()

              const newLocation: Location = testInterface.historyMap['key2']
              component.setProps({ location: newLocation, history: generateHistory(newLocation, 'POP') })

              testInterface = instance.getTestInterface()

              expect(testInterface.historyIndex).toEqual(2)
              expect(testInterface.historyOrder).toEqual([testInterface.intialId, 'key1', 'key2', 'key3'])
              expect(testInterface.baseLocation).toBe(location)
              expect(testInterface.providerHelper.modals).toMatchObject([
                { id: 0, type: 'route', location: testInterface.historyMap['key1'] },
                { id: 1, type: 'route', location: testInterface.historyMap['key2'] }
              ])
            })
          })

          describe('and the modals in between are in a modal group', (): void => {
            it('just recreates a modal and sits on the target one', (): void => {
              const location: Location = generateLocation()
              const history: History = generateHistory(location)
              const match: Match = generateMatch()
              const modales: Modales = new Modales()

              const component: ShallowWrapper = shallow(React.createElement(ModalesProviderX, { location, history, match, modales }))
              const instance: ModalesProviderX = component.instance() as ModalesProviderX
              instance.getTestInterface().providerHelper.modalsUpdateCallBack = jest.fn()

              let testInterface: ProviderTestInterface = instance.getTestInterface()
              instance.setTestInterface({
                historyMap: {
                  ...testInterface.historyMap,
                  key1: generateLocation('/newPath', 'key1', { modal: true, modalGroup: 'group' }),
                  key2: generateLocation('/newPath2', 'key2', { modal: true, modalGroup: 'group' }),
                  key3: generateLocation('/newPath3', 'key3', { modal: true, modalGroup: 'group' })
                },
                historyOrder: testInterface.historyOrder.concat(['key1', 'key2', 'key3'])
              })

              testInterface = instance.getTestInterface()

              const newLocation: Location = testInterface.historyMap['key2']
              component.setProps({ location: newLocation, history: generateHistory(newLocation, 'POP') })

              testInterface = instance.getTestInterface()

              expect(testInterface.historyIndex).toEqual(2)
              expect(testInterface.historyOrder).toEqual([testInterface.intialId, 'key1', 'key2', 'key3'])
              expect(testInterface.baseLocation).toBe(location)
              expect(testInterface.providerHelper.modals).toMatchObject([{ id: 0, type: 'route', location: testInterface.historyMap['key2'] }])
            })

            describe('and there are several groups in between', (): void => {
              it('just recreates groups stack in the last modal in that group and sitting on the target one', (): void => {
                const location: Location = generateLocation()
                const history: History = generateHistory(location)
                const match: Match = generateMatch()
                const modales: Modales = new Modales()

                const component: ShallowWrapper = shallow(React.createElement(ModalesProviderX, { location, history, match, modales }))
                const instance: ModalesProviderX = component.instance() as ModalesProviderX
                instance.getTestInterface().providerHelper.modalsUpdateCallBack = jest.fn()

                let testInterface: ProviderTestInterface = instance.getTestInterface()
                instance.setTestInterface({
                  historyMap: {
                    ...testInterface.historyMap,
                    key1: generateLocation('/newPath', 'key1', { modal: true, modalGroup: 'group' }),
                    key2: generateLocation('/newPath2', 'key2', { modal: true, modalGroup: 'group' }),
                    key3: generateLocation('/newPath3', 'key3', { modal: true, modalGroup: 'group2' }),
                    key4: generateLocation('/newPath4', 'key4', { modal: true, modalGroup: 'group2' }),
                    key5: generateLocation('/newPath5', 'key5', { modal: true, modalGroup: 'group2' })
                  },
                  historyOrder: testInterface.historyOrder.concat(['key1', 'key2', 'key3', 'key4', 'key5'])
                })

                testInterface = instance.getTestInterface()

                const newLocation: Location = testInterface.historyMap['key4']
                component.setProps({ location: newLocation, history: generateHistory(newLocation, 'POP') })

                testInterface = instance.getTestInterface()

                expect(testInterface.historyIndex).toEqual(4)
                expect(testInterface.historyOrder).toEqual([testInterface.intialId, 'key1', 'key2', 'key3', 'key4', 'key5'])
                expect(testInterface.baseLocation).toBe(location)
                expect(testInterface.providerHelper.modals).toMatchObject([
                  { id: 0, type: 'route', location: testInterface.historyMap['key2'] },
                  { id: 1, type: 'route', location: testInterface.historyMap['key4'] }
                ])
              })
            })

            describe('and there are several modals and "normal" routes in between', (): void => {
              it('sits on the last normal route as base and recreates from there', (): void => {
                const location: Location = generateLocation()
                const history: History = generateHistory(location)
                const match: Match = generateMatch()
                const modales: Modales = new Modales()

                const component: ShallowWrapper = shallow(React.createElement(ModalesProviderX, { location, history, match, modales }))
                const instance: ModalesProviderX = component.instance() as ModalesProviderX
                instance.getTestInterface().providerHelper.modalsUpdateCallBack = jest.fn()

                let testInterface: ProviderTestInterface = instance.getTestInterface()
                instance.setTestInterface({
                  historyMap: {
                    ...testInterface.historyMap,
                    key1: generateLocation('/newPath', 'key1', { modal: true, modalGroup: 'group' }),
                    key2: generateLocation('/newPath2', 'key2', { modal: true, modalGroup: 'group' }),
                    key3: generateLocation('/newPath3', 'key3'),
                    key4: generateLocation('/newPath4', 'key4', { modal: true, modalGroup: 'group2' }),
                    key5: generateLocation('/newPath5', 'key5', { modal: true, modalGroup: 'group2' })
                  },
                  historyOrder: testInterface.historyOrder.concat(['key1', 'key2', 'key3', 'key4', 'key5'])
                })

                testInterface = instance.getTestInterface()

                const newLocation: Location = testInterface.historyMap['key5']
                component.setProps({ location: newLocation, history: generateHistory(newLocation, 'POP') })

                testInterface = instance.getTestInterface()

                expect(testInterface.historyIndex).toEqual(5)
                expect(testInterface.historyOrder).toEqual([testInterface.intialId, 'key1', 'key2', 'key3', 'key4', 'key5'])
                expect(testInterface.baseLocation).toBe(testInterface.historyMap['key3'])
                expect(testInterface.providerHelper.modals).toMatchObject([{ id: 0, type: 'route', location: testInterface.historyMap['key5'] }])
              })
            })
          })
        })
      })

      describe('A new location REPLACE has come form props', (): void => {
        describe('and the incoming location is not a modal', (): void => {
          it('just replaces the base location with thew newone', (): void => {
            const location: Location = generateLocation()
            const history: History = generateHistory(location)
            const match: Match = generateMatch()
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

        describe('and the incoming location is yes a modal', (): void => {
          it('forces the new location to not be modal and replace the base location', (): void => {
            const location: Location = generateLocation()
            const history: History = generateHistory(location)
            const match: Match = generateMatch()
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

    describe('And is sitted in an unknown location (index -1)', (): void => {
      describe('A new location PUSH has come form props', (): void => {
        describe('and the incoming location is not a modal', (): void => {
          it('sets the unknown location as base location and pushes the newone', (): void => {
            const location: Location = generateLocation()
            const history: History = generateHistory(location)
            const match: Match = generateMatch()
            const modales: Modales = new Modales()

            const component: ShallowWrapper = shallow(React.createElement(ModalesProviderX, { location, history, match, modales }))
            const instance: ModalesProviderX = component.instance() as ModalesProviderX
            instance.getTestInterface().providerHelper.modalsUpdateCallBack = jest.fn()

            // Sit the provider in an unknow location
            instance.setTestInterface({ baseLocation: generateLocation('/unknown', 'unknown'), historyIndex: -1, historyOrder: [], historyMap: {} })

            const newLocation: Location = generateLocation('/newPath', 'key1')
            component.setProps({ location: newLocation, history: generateHistory(newLocation, 'PUSH') })

            const testInterface: ProviderTestInterface = instance.getTestInterface()

            expect(testInterface.historyOrder).toEqual(['unknown', 'key1'])
            expect(testInterface.historyMap).toMatchObject({ unknown: { key: 'unknown' }, key1: { key: 'key1' } })
            expect(testInterface.historyIndex).toEqual(1)
            expect(testInterface.baseLocation).toBe(newLocation)
          })
        })

        describe('and the incoming location is yes a modal', (): void => {
          it('leaves the base location alone, launches a modal and kepps track of the modal id in location', (): void => {
            const location: Location = generateLocation()
            const history: History = generateHistory(location)
            const match: Match = generateMatch()
            const modales: Modales = new Modales()

            const component: ShallowWrapper = shallow(React.createElement(ModalesProviderX, { location, history, match, modales }))
            const instance: ModalesProviderX = component.instance() as ModalesProviderX
            instance.getTestInterface().providerHelper.modalsUpdateCallBack = jest.fn()

            // Sit the provider in an unknow location
            const unknownLocation: Location = generateLocation('/unknown', 'unknown')
            instance.setTestInterface({ baseLocation: unknownLocation, historyIndex: -1, historyOrder: [], historyMap: {} })

            const newLocation: Location = generateLocation('/newPath', 'key1', { modal: true })
            component.setProps({ location: newLocation, history: generateHistory(newLocation, 'PUSH') })

            const testInterface: ProviderTestInterface = instance.getTestInterface()

            expect(testInterface.historyOrder).toEqual(['unknown', 'key1'])
            expect(newLocation.state).toEqual({ modalId: 0, modal: true })
            expect(testInterface.baseLocation).toBe(unknownLocation)
            expect(testInterface.providerHelper.modals.length).toEqual(1)
            expect(testInterface.providerHelper.modals[0]).toMatchObject({ location: instance.props.location })
          })
        })
      })

      describe('A new location POP has come form props (The user is messing with the broweser history... again)', (): void => {
        describe('and the incoming location is not a modal', (): void => {
          it('uses the new location but keeps the provider in oblivion leaving the historyIndex to -1', (): void => {
            const location: Location = generateLocation()
            const history: History = generateHistory(location)
            const match: Match = generateMatch()
            const modales: Modales = new Modales()

            const component: ShallowWrapper = shallow(React.createElement(ModalesProviderX, { location, history, match, modales }))
            const instance: ModalesProviderX = component.instance() as ModalesProviderX
            instance.getTestInterface().providerHelper.modalsUpdateCallBack = jest.fn()

            // Sit the provider in an unknow location
            const unknownLocation: Location = generateLocation('/unknown', 'unknown')
            instance.setTestInterface({ baseLocation: unknownLocation, historyIndex: -1, historyOrder: [], historyMap: {} })

            const newLocation: Location = generateLocation('/unknown2', 'unknown2')
            component.setProps({ location: newLocation, history: generateHistory(newLocation, 'POP') })

            const testInterface: ProviderTestInterface = instance.getTestInterface()

            expect(testInterface.historyOrder.length).toEqual(0)
            expect(testInterface.historyIndex).toEqual(-1)
            expect(testInterface.baseLocation).toBe(newLocation)
          })
        })

        describe('and the incoming location is yes a modal', (): void => {
          it('forces the new location and does the same as if it was not modal', (): void => {
            const location: Location = generateLocation()
            const history: History = generateHistory(location)
            const match: Match = generateMatch()
            const modales: Modales = new Modales()

            const component: ShallowWrapper = shallow(React.createElement(ModalesProviderX, { location, history, match, modales }))
            const instance: ModalesProviderX = component.instance() as ModalesProviderX
            instance.getTestInterface().providerHelper.modalsUpdateCallBack = jest.fn()

            // Sit the provider in an unknow location
            const unknownLocation: Location = generateLocation('/unknown', 'unknown')
            instance.setTestInterface({ baseLocation: unknownLocation, historyIndex: -1, historyOrder: [], historyMap: {} })

            const newLocation: Location = generateLocation('/unknown2', 'unknown2', { modal: true })
            component.setProps({ location: newLocation, history: generateHistory(newLocation, 'POP') })

            const testInterface: ProviderTestInterface = instance.getTestInterface()

            expect(newLocation.state.modal).toEqual(false)
            expect(testInterface.historyIndex).toEqual(-1)
            expect(testInterface.historyOrder.length).toEqual(0)
            expect(testInterface.baseLocation).toBe(instance.props.location)
          })
        })
      })

      describe('A new location REPLACE has come form props', (): void => {
        describe('and the incoming location is not a modal', (): void => {
          it('just replaces the base location and takes the provider out of oblivion', (): void => {
            const location: Location = generateLocation()
            const history: History = generateHistory(location)
            const match: Match = generateMatch()
            const modales: Modales = new Modales()

            const component: ShallowWrapper = shallow(React.createElement(ModalesProviderX, { location, history, match, modales }))
            const instance: ModalesProviderX = component.instance() as ModalesProviderX
            instance.getTestInterface().providerHelper.modalsUpdateCallBack = jest.fn()

            // Sit the provider in an unknow location
            const unknownLocation: Location = generateLocation('/unknown', 'unknown')
            instance.setTestInterface({ baseLocation: unknownLocation, historyIndex: -1, historyOrder: [], historyMap: {} })

            const newLocation: Location = generateLocation('/newPath', 'key1')
            component.setProps({ location: newLocation, history: generateHistory(newLocation, 'REPLACE') })

            const testInterface: ProviderTestInterface = instance.getTestInterface()

            expect(testInterface.historyOrder[0]).toEqual(instance.props.location.key)
            expect(testInterface.historyMap[newLocation.key]).toBe(instance.props.location)
            expect(testInterface.baseLocation).toBe(instance.props.location)
            expect(testInterface.historyIndex).toEqual(0)
          })
        })

        describe('and the incoming location is yes a modal', (): void => {
          it('forces the new location to not be modal and replace the base location', (): void => {
            const location: Location = generateLocation()
            const history: History = generateHistory(location)
            const match: Match = generateMatch()
            const modales: Modales = new Modales()

            const component: ShallowWrapper = shallow(React.createElement(ModalesProviderX, { location, history, match, modales }))
            const instance: ModalesProviderX = component.instance() as ModalesProviderX
            instance.getTestInterface().providerHelper.modalsUpdateCallBack = jest.fn()

            // Sit the provider in an unknow location
            const unknownLocation: Location = generateLocation('/unknown', 'unknown')
            instance.setTestInterface({ baseLocation: unknownLocation, historyIndex: -1, historyOrder: [], historyMap: {} })

            const newLocation: Location = generateLocation('/newPath', 'key1', { modal: true })
            component.setProps({ location: newLocation, history: generateHistory(newLocation, 'REPLACE') })

            const testInterface: ProviderTestInterface = instance.getTestInterface()

            expect(newLocation.state.modal).toEqual(false)
            expect(testInterface.historyOrder[0]).toEqual(instance.props.location.key)
            expect(testInterface.historyMap[newLocation.key]).toBe(instance.props.location)
            expect(testInterface.baseLocation).toBe(instance.props.location)
            expect(testInterface.historyIndex).toEqual(0)
          })
        })
      })
    })

    describe('And is sitted in a modal in the middle of some locations', (): void => {
      describe('A new location PUSH has come form props', (): void => {
        describe('and the incoming location is not a modal', (): void => {
          it('sets the incoming location as base location as force dismisses all modals', (): void => {
            const location: Location = generateLocation()
            const history: History = generateHistory(location)
            const match: Match = generateMatch()
            const modales: Modales = new Modales()

            const component: ShallowWrapper = shallow(React.createElement(ModalesProviderX, { location, history, match, modales }))
            const instance: ModalesProviderX = component.instance() as ModalesProviderX
            instance.getTestInterface().providerHelper.modalsUpdateCallBack = jest.fn()

            // we sit the provider in a modal by passing props to let the system create the modals
            // this is tested in "And is sitted in the first baselocation::and the incoming location is yes a modal"
            const location1: Location = generateLocation('/newPath', 'key1', { modal: true })
            component.setProps({ location: location1, history: generateHistory(location1, 'PUSH') })

            const newLocation: Location = generateLocation('/newPath2', 'key2')
            component.setProps({ location: newLocation, history: generateHistory(newLocation, 'PUSH') })

            const testInterface = instance.getTestInterface()

            expect(testInterface.historyOrder[2]).toEqual(newLocation.key)
            expect(testInterface.historyMap[newLocation.key]).toBe(newLocation)
            expect(testInterface.baseLocation).toBe(newLocation)
          })
        })

        describe('and the incoming location is yes a modal', (): void => {
          it('leaves the base location alone, launches another modal and kepps track of the modal id in location', (): void => {
            const location: Location = generateLocation()
            const history: History = generateHistory(location)
            const match: Match = generateMatch()
            const modales: Modales = new Modales()

            const component: ShallowWrapper = shallow(React.createElement(ModalesProviderX, { location, history, match, modales }))
            const instance: ModalesProviderX = component.instance() as ModalesProviderX
            instance.getTestInterface().providerHelper.modalsUpdateCallBack = jest.fn()

            const location1: Location = generateLocation('/newPath', 'key1', { modal: true })
            component.setProps({ location: location1, history: generateHistory(location1, 'PUSH') })

            const newLocation: Location = generateLocation('/newPath2', 'key2', { modal: true })
            component.setProps({ location: newLocation, history: generateHistory(newLocation, 'PUSH') })

            const testInterface: ProviderTestInterface = instance.getTestInterface()

            expect(newLocation.state).toEqual({ modalId: 1, modal: true })
            expect(testInterface.baseLocation).toBe(location)
            expect(testInterface.providerHelper.modals).toMatchObject([
              { id: 0, type: 'route', location: location1 },
              { id: 1, type: 'route', location: newLocation }
            ])
          })

          describe('and the incoming location is yes a modal and in the same group', (): void => {
            it('leaves the base location alone, launches another modal and replaces the modal and sets the modalgroup', (): void => {
              const location: Location = generateLocation()
              const history: History = generateHistory(location)
              const match: Match = generateMatch()
              const modales: Modales = new Modales()

              const component: ShallowWrapper = shallow(React.createElement(ModalesProviderX, { location, history, match, modales }))
              const instance: ModalesProviderX = component.instance() as ModalesProviderX
              instance.getTestInterface().providerHelper.modalsUpdateCallBack = jest.fn()

              const location1: Location = generateLocation('/newPath', 'key1', { modal: true, modalGroup: 'group' })
              component.setProps({ location: location1, history: generateHistory(location1, 'PUSH') })

              const newLocation: Location = generateLocation('/newPath2', 'key2', { modal: true, modalGroup: 'group' })
              component.setProps({ location: newLocation, history: generateHistory(newLocation, 'PUSH') })

              const testInterface: ProviderTestInterface = instance.getTestInterface()

              expect(location1.state).toEqual({ modalId: 1, modal: true, modalGroup: 'group' })
              expect(newLocation.state).toEqual({ modalId: 1, modal: true, modalGroup: 'group' })
              expect(testInterface.baseLocation).toBe(location)
              expect(testInterface.providerHelper.modals).toMatchObject([{ id: 1, type: 'route', location: newLocation }])
            })
          })

          describe('and there are custom modals launched', (): void => {
            it('just lauches the new location modal and cleans up any open modal', (): void => {
              const location: Location = generateLocation()
              const history: History = generateHistory(location)
              const match: Match = generateMatch()
              const modales: Modales = new Modales()

              const component: ShallowWrapper = shallow(React.createElement(ModalesProviderX, { location, history, match, modales }))
              const instance: ModalesProviderX = component.instance() as ModalesProviderX
              instance.getTestInterface().providerHelper.modalsUpdateCallBack = jest.fn()

              const location1: Location = generateLocation('/newPath', 'key1', { modal: true })
              component.setProps({ location: location1, history: generateHistory(location1, 'PUSH') })

              let testInterface: ProviderTestInterface = instance.getTestInterface()

              modales.launchModal('Content')
              modales.launchModal('Content2')

              expect(testInterface.providerHelper.modals).toMatchObject([
                { id: 0, type: 'route', location: location1 },
                { id: 1, type: 'custom', content: 'Content' },
                { id: 2, type: 'custom', content: 'Content2' }
              ])

              const newLocation: Location = generateLocation('/newPath2', 'key2', { modal: true })
              component.setProps({ location: newLocation, history: generateHistory(newLocation, 'PUSH') })

              testInterface = instance.getTestInterface()

              expect(newLocation.state).toEqual({ modalId: 3, modal: true })
              expect(testInterface.baseLocation).toBe(location)
              expect(testInterface.providerHelper.modals).toMatchObject([
                { id: 0, type: 'route', location: location1 },
                { id: 3, type: 'route', location: newLocation }
              ])
            })
          })
        })
      })

      describe('A new location POP has come form props (The user is messing with the broweser history)', (): void => {
        describe('and the incoming location is not a modal', (): void => {
          describe('and is behind the current location', (): void => {
            it('soft dismisses the modal and sits on the new location', (): void => {
              const location: Location = generateLocation()
              const history: History = generateHistory(location)
              const match: Match = generateMatch()
              const modales: Modales = new Modales()

              const component: ShallowWrapper = shallow(React.createElement(ModalesProviderX, { location, history, match, modales }))
              const instance: ModalesProviderX = component.instance() as ModalesProviderX
              instance.getTestInterface().providerHelper.modalsUpdateCallBack = jest.fn()

              const location1: Location = generateLocation('/newPath', 'key1')
              component.setProps({ location: location1, history: generateHistory(location1, 'PUSH') })

              const location2: Location = generateLocation('/newPath2', 'key2', { modal: true })
              component.setProps({ location: location2, history: generateHistory(location2, 'PUSH') })

              const newLocation = location1
              component.setProps({ location: newLocation, history: generateHistory(newLocation, 'POP') })

              // soft dismissed modals neds time to disappear
              jest.runAllTimers()

              const testInterface: ProviderTestInterface = instance.getTestInterface()

              expect(testInterface.historyIndex).toEqual(1)
              expect(testInterface.historyOrder).toEqual([testInterface.intialId, 'key1', 'key2'])
              expect(testInterface.baseLocation).toBe(instance.props.location)
              expect(testInterface.providerHelper.modals).toEqual([])
            })
          })

          describe('and is front the current location', (): void => {
            it('force dismisses the modal and sits on the new location', (): void => {
              const location: Location = generateLocation()
              const history: History = generateHistory(location)
              const match: Match = generateMatch()
              const modales: Modales = new Modales()

              const component: ShallowWrapper = shallow(React.createElement(ModalesProviderX, { location, history, match, modales }))
              const instance: ModalesProviderX = component.instance() as ModalesProviderX
              instance.getTestInterface().providerHelper.modalsUpdateCallBack = jest.fn()

              let testInterface: ProviderTestInterface = instance.getTestInterface()
              const location1: Location = generateLocation('/newPath', 'key1', { modal: true })
              const newLocation: Location = generateLocation('/newPath2', 'key2')
              instance.setTestInterface({
                historyMap: {
                  ...testInterface.historyMap,
                  key1: location1,
                  key2: newLocation
                },
                historyOrder: testInterface.historyOrder.concat(['key1', 'key2'])
              })

              testInterface = instance.getTestInterface()

              // We are in base location so we launch the known modal
              component.setProps({ location: location1, history: generateHistory(location1, 'POP') })

              // We go forward to a normal known one
              component.setProps({ location: newLocation, history: generateHistory(newLocation, 'POP') })

              testInterface = instance.getTestInterface()

              expect(testInterface.historyIndex).toEqual(2)
              expect(testInterface.historyOrder).toEqual([testInterface.intialId, 'key1', 'key2'])
              expect(testInterface.baseLocation).toBe(newLocation)
              expect(testInterface.providerHelper.modals).toEqual([])
            })
          })

          describe('and is behind the current location but there is another normal one in between', (): void => {
            it('force dismisses the modal and sits on the new location', (): void => {
              const location: Location = generateLocation()
              const history: History = generateHistory(location)
              const match: Match = generateMatch()
              const modales: Modales = new Modales()

              const component: ShallowWrapper = shallow(React.createElement(ModalesProviderX, { location, history, match, modales }))
              const instance: ModalesProviderX = component.instance() as ModalesProviderX
              instance.getTestInterface().providerHelper.modalsUpdateCallBack = jest.fn()

              let testInterface: ProviderTestInterface = instance.getTestInterface()
              const baseLocation: Location = generateLocation('/newPath2', 'key2')
              instance.setTestInterface({
                historyMap: {
                  ...testInterface.historyMap,
                  key1: generateLocation('/newPath', 'key1', { modal: true }),
                  key2: baseLocation
                },
                historyOrder: testInterface.historyOrder.concat(['key1', 'key2']),
                historyIndex: 2,
                baseLocation: baseLocation
              })

              testInterface = instance.getTestInterface()

              const location1: Location = generateLocation('/newPath3', 'key3', { modal: true })
              component.setProps({ location: location1, history: generateHistory(location1, 'PUSH') })

              const newLocation = location
              component.setProps({ location: newLocation, history: generateHistory(newLocation, 'POP') })

              testInterface = instance.getTestInterface()

              expect(testInterface.historyIndex).toEqual(0)
              expect(testInterface.historyOrder).toEqual([testInterface.intialId, 'key1', 'key2', 'key3'])
              expect(testInterface.baseLocation).toBe(location)
              expect(testInterface.providerHelper.modals).toEqual([])
            })
          })
        })

        describe('and the incoming location is yes a modal', (): void => {
          describe('and is behind the current location', (): void => {
            it('soft dismisses the current modal', (): void => {
              const location: Location = generateLocation()
              const history: History = generateHistory(location)
              const match: Match = generateMatch()
              const modales: Modales = new Modales()

              const component: ShallowWrapper = shallow(React.createElement(ModalesProviderX, { location, history, match, modales }))
              const instance: ModalesProviderX = component.instance() as ModalesProviderX
              instance.getTestInterface().providerHelper.modalsUpdateCallBack = jest.fn()

              const location1: Location = generateLocation('/newPath', 'key1', { modal: true })
              component.setProps({ location: location1, history: generateHistory(location1, 'PUSH') })

              const location2: Location = generateLocation('/newPath2', 'key2', { modal: true })
              component.setProps({ location: location2, history: generateHistory(location2, 'PUSH') })

              const newLocation = location1
              component.setProps({ location: newLocation, history: generateHistory(newLocation, 'POP') })

              jest.runAllTimers()

              const testInterface: ProviderTestInterface = instance.getTestInterface()

              expect(testInterface.historyIndex).toEqual(1)
              expect(testInterface.historyOrder).toEqual([testInterface.intialId, 'key1', 'key2'])
              expect(testInterface.baseLocation).toBe(location)
              expect(testInterface.providerHelper.modals).toMatchObject([{ id: 0, type: 'route', location: newLocation }])
            })

            describe('and the incoming modal is in the same group', (): void => {
              it('replece the modal with the new content', (): void => {
                const location: Location = generateLocation()
                const history: History = generateHistory(location)
                const match: Match = generateMatch()
                const modales: Modales = new Modales()

                const component: ShallowWrapper = shallow(React.createElement(ModalesProviderX, { location, history, match, modales }))
                const instance: ModalesProviderX = component.instance() as ModalesProviderX
                instance.getTestInterface().providerHelper.modalsUpdateCallBack = jest.fn()

                const location1: Location = generateLocation('/newPath', 'key1', { modal: true, modalGroup: 'group' })
                component.setProps({ location: location1, history: generateHistory(location1, 'PUSH') })

                const location2: Location = generateLocation('/newPath2', 'key2', { modal: true, modalGroup: 'group' })
                component.setProps({ location: location2, history: generateHistory(location2, 'PUSH') })

                const newLocation = location1
                component.setProps({ location: newLocation, history: generateHistory(newLocation, 'POP') })

                const testInterface: ProviderTestInterface = instance.getTestInterface()

                expect(testInterface.historyIndex).toEqual(1)
                expect(testInterface.historyOrder).toEqual([testInterface.intialId, 'key1', 'key2'])
                expect(testInterface.baseLocation).toBe(location)
                expect(testInterface.providerHelper.modals).toMatchObject([{ id: 3, type: 'route', location: newLocation }])
              })
            })
          })

          describe('and the incoming modal is in a group behind some modals', (): void => {
            it('dissmiss the forn modals and replaces the modal content', (): void => {
              const location: Location = generateLocation()
              const history: History = generateHistory(location)
              const match: Match = generateMatch()
              const modales: Modales = new Modales()

              const component: ShallowWrapper = shallow(React.createElement(ModalesProviderX, { location, history, match, modales }))
              const instance: ModalesProviderX = component.instance() as ModalesProviderX
              instance.getTestInterface().providerHelper.modalsUpdateCallBack = jest.fn()

              const location1: Location = generateLocation('/newPath', 'key1', { modal: true, modalGroup: 'group' })
              component.setProps({ location: location1, history: generateHistory(location1, 'PUSH') })

              const location2: Location = generateLocation('/newPath2', 'key2', { modal: true, modalGroup: 'group' })
              component.setProps({ location: location2, history: generateHistory(location2, 'PUSH') })

              const location3: Location = generateLocation('/newPath3', 'key3', { modal: true })
              component.setProps({ location: location3, history: generateHistory(location3, 'PUSH') })

              const location4: Location = generateLocation('/newPath4', 'key4', { modal: true, modalGroup: 'group2' })
              component.setProps({ location: location4, history: generateHistory(location4, 'PUSH') })

              const location5: Location = generateLocation('/newPath5', 'key5', { modal: true, modalGroup: 'group2' })
              component.setProps({ location: location5, history: generateHistory(location5, 'PUSH') })

              const newLocation = location1
              component.setProps({ location: newLocation, history: generateHistory(newLocation, 'POP') })

              const testInterface: ProviderTestInterface = instance.getTestInterface()

              expect(testInterface.historyIndex).toEqual(1)
              expect(testInterface.historyOrder).toEqual([testInterface.intialId, 'key1', 'key2', 'key3', 'key4', 'key5'])
              expect(testInterface.baseLocation).toBe(location)
              expect(testInterface.providerHelper.modals).toMatchObject([{ id: 5, type: 'route', location: newLocation }])
            })
          })

          describe('and is in front of the current location', (): void => {
            it('launches the new modal', (): void => {
              const location: Location = generateLocation()
              const history: History = generateHistory(location)
              const match: Match = generateMatch()
              const modales: Modales = new Modales()

              const component: ShallowWrapper = shallow(React.createElement(ModalesProviderX, { location, history, match, modales }))
              const instance: ModalesProviderX = component.instance() as ModalesProviderX
              instance.getTestInterface().providerHelper.modalsUpdateCallBack = jest.fn()

              const location1: Location = generateLocation('/newPath', 'key1', { modal: true })
              component.setProps({ location: location1, history: generateHistory(location1, 'PUSH') })

              const location2: Location = generateLocation('/newPath2', 'key2', { modal: true })
              component.setProps({ location: location2, history: generateHistory(location2, 'PUSH') })

              const location3 = location1
              component.setProps({ location: location3, history: generateHistory(location3, 'POP') })

              const newLocation = location2
              component.setProps({ location: newLocation, history: generateHistory(newLocation, 'POP') })

              jest.runAllTimers()

              const testInterface: ProviderTestInterface = instance.getTestInterface()

              expect(testInterface.historyIndex).toEqual(2)
              expect(testInterface.historyOrder).toEqual([testInterface.intialId, 'key1', 'key2'])
              expect(testInterface.baseLocation).toBe(location)
              expect(testInterface.providerHelper.modals).toMatchObject([
                { id: 0, type: 'route', location: location1 },
                { id: 2, type: 'route', location: newLocation }
              ])
            })

            describe('and the incoming modal is in the same group', (): void => {
              it('replece the modal with the new content', (): void => {
                const location: Location = generateLocation()
                const history: History = generateHistory(location)
                const match: Match = generateMatch()
                const modales: Modales = new Modales()

                const component: ShallowWrapper = shallow(React.createElement(ModalesProviderX, { location, history, match, modales }))
                const instance: ModalesProviderX = component.instance() as ModalesProviderX
                instance.getTestInterface().providerHelper.modalsUpdateCallBack = jest.fn()

                const location1: Location = generateLocation('/newPath', 'key1', { modal: true, modalGroup: 'group' })
                component.setProps({ location: location1, history: generateHistory(location1, 'PUSH') })

                const location2: Location = generateLocation('/newPath2', 'key2', { modal: true, modalGroup: 'group' })
                component.setProps({ location: location2, history: generateHistory(location2, 'PUSH') })

                const location3 = location1
                component.setProps({ location: location3, history: generateHistory(location3, 'POP') })

                const newLocation = location2
                component.setProps({ location: newLocation, history: generateHistory(newLocation, 'POP') })

                jest.runAllTimers()

                const testInterface: ProviderTestInterface = instance.getTestInterface()

                expect(testInterface.historyIndex).toEqual(2)
                expect(testInterface.historyOrder).toEqual([testInterface.intialId, 'key1', 'key2'])
                expect(testInterface.baseLocation).toBe(location)
                expect(testInterface.providerHelper.modals).toMatchObject([{ id: 4, type: 'route', location: newLocation }])
              })
            })
          })

          describe('and the incoming modal is in a group in front some modals', (): void => {
            it('launches all the modals in between (rebuild)', (): void => {
              const location: Location = generateLocation()
              const history: History = generateHistory(location)
              const match: Match = generateMatch()
              const modales: Modales = new Modales()

              const component: ShallowWrapper = shallow(React.createElement(ModalesProviderX, { location, history, match, modales }))
              const instance: ModalesProviderX = component.instance() as ModalesProviderX
              instance.getTestInterface().providerHelper.modalsUpdateCallBack = jest.fn()

              const location1: Location = generateLocation('/newPath', 'key1', { modal: true, modalGroup: 'group' })
              component.setProps({ location: location1, history: generateHistory(location1, 'PUSH') })

              const location2: Location = generateLocation('/newPath2', 'key2', { modal: true, modalGroup: 'group' })
              component.setProps({ location: location2, history: generateHistory(location2, 'PUSH') })

              const location3: Location = generateLocation('/newPath3', 'key3', { modal: true })
              component.setProps({ location: location3, history: generateHistory(location3, 'PUSH') })

              const location4: Location = generateLocation('/newPath4', 'key4', { modal: true, modalGroup: 'group2' })
              component.setProps({ location: location4, history: generateHistory(location4, 'PUSH') })

              const location5: Location = generateLocation('/newPath5', 'key5', { modal: true, modalGroup: 'group2' })
              component.setProps({ location: location5, history: generateHistory(location5, 'PUSH') })

              const location6 = location1
              component.setProps({ location: location6, history: generateHistory(location6, 'POP') })

              const newLocation = location5
              component.setProps({ location: newLocation, history: generateHistory(newLocation, 'POP') })

              const testInterface: ProviderTestInterface = instance.getTestInterface()

              expect(testInterface.historyIndex).toEqual(5)
              expect(testInterface.historyOrder).toEqual([testInterface.intialId, 'key1', 'key2', 'key3', 'key4', 'key5'])
              expect(testInterface.baseLocation).toBe(location)
              expect(testInterface.providerHelper.modals).toMatchObject([
                { id: 6, type: 'route', location: location2 },
                { id: 7, type: 'route', location: location3 },
                { id: 8, type: 'route', location: newLocation }
              ])
            })
          })
        })
      })

      describe('A new location REPLACE has come form props', (): void => {
        describe('and the incoming location is not a modal', (): void => {
          it('just replaces the base location with thew newone, and force dissmisses all modals', (): void => {
            const location: Location = generateLocation()
            const history: History = generateHistory(location)
            const match: Match = generateMatch()
            const modales: Modales = new Modales()

            const component: ShallowWrapper = shallow(React.createElement(ModalesProviderX, { location, history, match, modales }))
            const instance: ModalesProviderX = component.instance() as ModalesProviderX
            instance.getTestInterface().providerHelper.modalsUpdateCallBack = jest.fn()

            const location1: Location = generateLocation('/newPath', 'key1', { modal: true })
            component.setProps({ location: location1, history: generateHistory(location1, 'PUSH') })

            const newLocation: Location = generateLocation('/newPath2', 'key2')
            component.setProps({ location: newLocation, history: generateHistory(newLocation, 'REPLACE') })

            const testInterface: ProviderTestInterface = instance.getTestInterface()

            expect(testInterface.historyOrder).toEqual([testInterface.intialId, 'key2'])
            expect(testInterface.baseLocation).toBe(instance.props.location)
            expect(testInterface.historyIndex).toEqual(1)
            expect(testInterface.providerHelper.modals).toEqual([])
          })
        })

        describe('and the incoming location is yes a modal', (): void => {
          it('replaces the modal as if just replacing routes', (): void => {
            const location: Location = generateLocation()
            const history: History = generateHistory(location)
            const match: Match = generateMatch()
            const modales: Modales = new Modales()

            const component: ShallowWrapper = shallow(React.createElement(ModalesProviderX, { location, history, match, modales }))
            const instance: ModalesProviderX = component.instance() as ModalesProviderX
            instance.getTestInterface().providerHelper.modalsUpdateCallBack = jest.fn()

            const location1: Location = generateLocation('/newPath', 'key1', { modal: true })
            component.setProps({ location: location1, history: generateHistory(location1, 'PUSH') })

            const newLocation: Location = generateLocation('/newPath2', 'key2', { modal: true })
            component.setProps({ location: newLocation, history: generateHistory(newLocation, 'REPLACE') })

            const testInterface: ProviderTestInterface = instance.getTestInterface()

            expect(testInterface.historyOrder).toEqual([testInterface.intialId, 'key2'])
            expect(testInterface.baseLocation).toBe(location)
            expect(testInterface.historyIndex).toEqual(1)
            expect(testInterface.providerHelper.modals).toMatchObject([{ id: 1, type: 'route', location: newLocation }])
          })

          describe('and the incoming location is in the same modalgroup', (): void => {
            it('replaces the modal content', (): void => {
              const location: Location = generateLocation()
              const history: History = generateHistory(location)
              const match: Match = generateMatch()
              const modales: Modales = new Modales()

              const component: ShallowWrapper = shallow(React.createElement(ModalesProviderX, { location, history, match, modales }))
              const instance: ModalesProviderX = component.instance() as ModalesProviderX
              instance.getTestInterface().providerHelper.modalsUpdateCallBack = jest.fn()

              const location1: Location = generateLocation('/newPath', 'key1', { modal: true, modalGroup: 'group' })
              component.setProps({ location: location1, history: generateHistory(location1, 'PUSH') })

              const newLocation: Location = generateLocation('/newPath2', 'key2', { modal: true, modalGroup: 'group' })
              component.setProps({ location: newLocation, history: generateHistory(newLocation, 'REPLACE') })

              const testInterface: ProviderTestInterface = instance.getTestInterface()

              expect(testInterface.historyOrder).toEqual([testInterface.intialId, 'key2'])
              expect(testInterface.baseLocation).toBe(location)
              expect(testInterface.historyIndex).toEqual(1)
              expect(testInterface.providerHelper.modals).toMatchObject([{ id: 1, type: 'route', location: newLocation }])
            })
          })

          describe('and the incoming location is in a different modalgroup', (): void => {
            it('leaves the previous modal but with the previous route in the previous group, and launches a new for the replacement group', (): void => {
              const location: Location = generateLocation()
              const history: History = generateHistory(location)
              const match: Match = generateMatch()
              const modales: Modales = new Modales()

              const component: ShallowWrapper = shallow(React.createElement(ModalesProviderX, { location, history, match, modales }))
              const instance: ModalesProviderX = component.instance() as ModalesProviderX
              instance.getTestInterface().providerHelper.modalsUpdateCallBack = jest.fn()

              const location1: Location = generateLocation('/newPath', 'key1', { modal: true, modalGroup: 'group' })
              component.setProps({ location: location1, history: generateHistory(location1, 'PUSH') })

              const location2: Location = generateLocation('/newPath2', 'key2', { modal: true, modalGroup: 'group' })
              component.setProps({ location: location2, history: generateHistory(location2, 'PUSH') })

              const newLocation: Location = generateLocation('/newPath3', 'key3', { modal: true, modalGroup: 'group2' })
              component.setProps({ location: newLocation, history: generateHistory(newLocation, 'REPLACE') })

              const testInterface: ProviderTestInterface = instance.getTestInterface()

              expect(testInterface.historyOrder).toEqual([testInterface.intialId, 'key1', 'key3'])
              expect(testInterface.baseLocation).toBe(location)
              expect(testInterface.historyIndex).toEqual(2)
              expect(testInterface.providerHelper.modals).toMatchObject([
                { id: 2, type: 'route', location: location1 },
                { id: 3, type: 'route', location: newLocation }
              ])
            })
          })
        })
      })
    })
  })
})
