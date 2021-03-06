import * as React from 'react'
import { shallow, ShallowWrapper } from 'enzyme'

import ModalesScene, { ModalesSceneProps } from '../src/ModalesScene'
import ProviderHelper from '../src/ProviderHelper'
import generateLocation from './helpers/generateLocation'

jest.useFakeTimers()

beforeEach((): void => {})

describe('ModalesScene', (): void => {
  describe('Did mount', (): void => {
    it('sets the provider modalsUpdateCallBack to react to modals changes', (): void => {
      const providerHelper: ProviderHelper = new ProviderHelper()

      expect(providerHelper.modalsUpdateCallBack).toBeNull()
      shallow(React.createElement(ModalesScene, { providerHelper }))
      expect(providerHelper.modalsUpdateCallBack).not.toBeNull()
    })
  })

  describe('modalsUpdateCallBack', (): void => {
    it('react to modal changes and stack as spected', (): void => {
      const providerHelper: ProviderHelper = new ProviderHelper()

      const component: ShallowWrapper<ModalesSceneProps> = shallow(React.createElement(ModalesScene, { providerHelper }))

      providerHelper.launchRouteModal(generateLocation(), 'Content', jest.fn(), jest.fn(), false)
      let derivedProps: ModalesSceneProps = component.props()

      expect(derivedProps.children[1].length).toEqual(1)
      expect(derivedProps.children[1][0].props).toMatchObject({ background: 'blurred' })
      expect(derivedProps.className).toEqual('modales-scene')

      providerHelper.launchModal('Content', 'transparent', jest.fn(), jest.fn())
      derivedProps = component.props()

      expect(derivedProps.children[1].length).toEqual(2)
      expect(derivedProps.children[1][0].props).toMatchObject({ background: 'blurred' })
      expect(derivedProps.children[1][1].props).toMatchObject({ background: 'transparent' })
      expect(derivedProps.className).toEqual('modales-scene')

      providerHelper.launchModal('Content', 'translucent', jest.fn(), jest.fn())
      derivedProps = component.props()

      expect(derivedProps.children[1].length).toEqual(3)
      expect(derivedProps.children[1][0].props).toMatchObject({ background: 'blurred' })
      expect(derivedProps.children[1][1].props).toMatchObject({ background: 'transparent' })
      expect(derivedProps.children[1][2].props).toMatchObject({ background: 'translucent' })
      expect(derivedProps.className).toEqual('modales-scene')
    })

    describe('modals are being close', (): void => {
      it('setsthem as close, pass the time and then they are gone', (): void => {
        const providerHelper: ProviderHelper = new ProviderHelper()

        const component: ShallowWrapper<ModalesSceneProps> = shallow(React.createElement(ModalesScene, { providerHelper }))

        providerHelper.launchRouteModal(generateLocation('', '', { background: 'blurred' }), 'Content', jest.fn(), jest.fn(), false)
        providerHelper.launchModal('Content', 'transparent', jest.fn(), jest.fn())
        providerHelper.launchModal('Content', 'blurred', jest.fn(), jest.fn())

        providerHelper.clearModals()

        let derivedProps: ModalesSceneProps = component.props()

        expect(derivedProps.children[1].length).toEqual(3)
        expect(derivedProps.children[1][0].props).toMatchObject({ closed: true })
        expect(derivedProps.children[1][1].props).toMatchObject({ closed: true })
        expect(derivedProps.children[1][2].props).toMatchObject({ closed: true })

        jest.runAllTimers()

        derivedProps = component.props()

        expect(derivedProps.children[1].length).toEqual(0)
      })
    })
  })
})
