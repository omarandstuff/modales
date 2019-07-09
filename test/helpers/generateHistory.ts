import { Location, History, Action } from 'history'
import generateLocation from './generateLocation'

export default function generateHistory(location?: Location, action?: Action): History {
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
