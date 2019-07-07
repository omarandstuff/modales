import * as React from 'react'
import { shallow, mount, render } from 'enzyme'
import { Location, History, Action } from 'history'
import { match } from 'react-router'

import Modales from '../src/Modales'
import ProviderHelper from '../src/ProviderHelper'
import { ModalesProvider } from '../src/ModalesProvider'

function generateLocation(pathname?: string, state?: {}): Location {
  return {
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

type ProviderTestInterface = {
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
  constructor(props) {
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
      const location = generateLocation()
      const history = generateHistory(location)
      const match = generateMatch()
      const modales = new Modales()

      const element = React.createElement(ModalesProviderX, { location, history, match, modales: modales })
      const wrapper = shallow(element)

      expect(element.props.location.key).toEqual(providerTestInterface.intialId)
    })
  })
})