import ProviderHelper from './ProviderHelper'
import { Location, History } from 'history'
import RouterRef from './RouterRef'
import { ModalesConfiguration, ModalBackground, Modal } from './Modales.types'

/**
 * Modales will handle modals and routes that act like modals, providing a high level
 * interface and a tight interaction with react-router
 *
 * @param {ModalesConfiguration} [config] of how modales will behave
 *
 */

export default class Modales {
  public router: RouterRef = null

  private providerHelper: ProviderHelper = null
  private configuration: ModalesConfiguration = null

  public constructor(config?: ModalesConfiguration) {
    this.configuration = config || {}
  }

  /**
   * Do not use this method manually is meant to be used by the modales provider to connect the instance
   *
   * @param {ProviderHelper} newProviderHelper the provider helper owned by the provider
   *
   */
  public connectWithProvider(newProviderHelper: ProviderHelper): void {
    this.providerHelper = newProviderHelper

    this.providerHelper.defaultBackground = this.configuration.defaultBackground || this.providerHelper.defaultBackground
    this.providerHelper.blurEnabled = this.configuration.blurEnabled === undefined || this.configuration.blurEnabled
    this.providerHelper.routeModalsEnabled = this.configuration.routeModalsEnabled === undefined || this.configuration.routeModalsEnabled
  }

  /**
   * Do not use this method manually is meant to be used by the modales provider to connect the router methods
   *
   * @param {Location} location react router location
   * @param {History} history react router history
   *
   */
  public connectWithRouter(location: Location, history: History): void {
    this.router = new RouterRef(location, history)
  }

  /**
   * Launch a new modal with the contents desired
   *
   * @param {React.ReactNode | React.ReactNode[]} content React element to be presented
   * @param {(event: MouseEvent) => boolean} onOutsideClick callback for when the user press outiside the modal
   * @param {(event: KeyboardEvent) => boolean} onScape callback for when the user press the space key
   * @param {ModalBackground} background background style
   *
   */
  public launchModal(
    content: React.ReactNode | React.ReactNode[],
    background?: ModalBackground,
    onOutsideClick?: (event: MouseEvent) => boolean,
    onScape?: (event: KeyboardEvent) => boolean
  ): Modal {
    return this.providerHelper.launchModal(content, background, onOutsideClick, onScape)
  }

  /**
   * Manually pop the top modal
   */
  public popModal(): void {
    // We can not just pop a modal that is a route we nned to go back and let the provider take care
    if (this.providerHelper.modals[this.providerHelper.modals.length - 1].type === 'route') {
      this.router.goBack()
    } else {
      this.providerHelper.popModal()
    }
  }
}
