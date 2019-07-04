import ProviderHelper from './ProviderHelper'
import { Location, History } from 'history'
import RouterRef from './RouterRef'
import { ModalBackground, Modal } from './Modales.types'

export default class Modales {
  public router: RouterRef = null

  private providerHelper: ProviderHelper = null

  public connectWithProvider(newProviderHelper: ProviderHelper): void {
    this.providerHelper = newProviderHelper
  }

  public connectWithRouter(location: Location, history: History): void {
    this.router = new RouterRef(location, history)
  }

  public launchModal(
    content: React.ReactNode | React.ReactNode[],
    onOutsideClick: (event: MouseEvent) => boolean,
    onScape: (event: KeyboardEvent) => boolean,
    background?: ModalBackground
  ): Modal {
    return this.providerHelper.launchModal(content, onOutsideClick, onScape, background)
  }

  public popModal(modalId?: number): void {
    this.providerHelper.popModal(modalId)
  }
}
