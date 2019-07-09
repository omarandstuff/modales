import { Location } from 'history'
import ProviderHelper from '../../src/ProviderHelper'
import { ModalesProvider } from '../../src/ModalesProvider'

export interface ProviderTestInterface {
  baseLocation?: Location
  intialId?: string
  historyIndex?: number
  historyOrder?: string[]
  historyMap?: { [key: string]: Location }
  lastLocation?: Location
  providerHelper?: ProviderHelper
}

export default class ModalesProviderX extends ModalesProvider {
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
