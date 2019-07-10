import * as React from 'react'
import { shallow, ShallowWrapper } from 'enzyme'

import ModalesViewer, { ModalViewerProps } from '../src/ModalViewer'

jest.useFakeTimers()

const listeners = []
const realEventListener: typeof document.addEventListener = document.addEventListener
const realRemoveAddEventListener: typeof document.addEventListener = document.removeEventListener

function callListeners() {
  listeners.forEach((listener: jest.Mock) => {
    listener({ key: 'Escape' })
  })
}

beforeAll((): void => {
  // @ts-ignore
  // We don't really need to recreate types here
  document.addEventListener = (_event: string, callBack: jest.Mock): void => {
    listeners.push(callBack)
  }
})

afterAll((): void => {
  document.addEventListener = realEventListener
  document.removeEventListener = realRemoveAddEventListener
})

describe('ModalesScene', (): void => {
  describe('Did mount', (): void => {
    it('it keeps track of the last instantiated and only reacts to mouse and scape events for the top one', (): void => {
      const component1OnOutsideClick = jest.fn()
      const component1OnScape = jest.fn()
      const compoent1: ShallowWrapper<ModalViewerProps> = shallow(
        React.createElement(ModalesViewer, { modalId: 0, onOutsideClick: component1OnOutsideClick, onScape: component1OnScape })
      )

      compoent1.find('.background').simulate('click')
      callListeners()

      expect(component1OnOutsideClick.mock.calls.length).toEqual(1)
      expect(component1OnScape.mock.calls.length).toEqual(1)

      const component2OnOutsideClick = jest.fn()
      const component2OnScape = jest.fn()
      const compoent2: ShallowWrapper<ModalViewerProps> = shallow(
        React.createElement(ModalesViewer, { modalId: 1, onOutsideClick: component2OnOutsideClick, onScape: component2OnScape })
      )

      compoent2.find('.background').simulate('click')
      callListeners()

      expect(component1OnOutsideClick.mock.calls.length).toEqual(1)
      expect(component1OnScape.mock.calls.length).toEqual(1)
      expect(component2OnOutsideClick.mock.calls.length).toEqual(1)
      expect(component2OnScape.mock.calls.length).toEqual(1)

      const component3OnOutsideClick = jest.fn()
      const component3OnScape = jest.fn()
      const compoent3: ShallowWrapper<ModalViewerProps> = shallow(
        React.createElement(ModalesViewer, { modalId: 2, onOutsideClick: component3OnOutsideClick, onScape: component3OnScape })
      )

      compoent3.find('.background').simulate('click')
      callListeners()

      expect(component1OnOutsideClick.mock.calls.length).toEqual(1)
      expect(component1OnScape.mock.calls.length).toEqual(1)
      expect(component2OnOutsideClick.mock.calls.length).toEqual(1)
      expect(component2OnScape.mock.calls.length).toEqual(1)
      expect(component3OnOutsideClick.mock.calls.length).toEqual(1)
      expect(component3OnScape.mock.calls.length).toEqual(1)
    })
  })
})
