import { Modal, ModalBackground } from './Modales.types'
import { Location } from 'history'

export default class ProviderHelper {
  public blurEnabled: boolean = true
  public modalsUpdateCallBack: (modals: Modal[]) => void = null
  public routeModalsEnabled: boolean = true
  public modals: Modal[] = []

  private currentID: number = 0

  public clearModals(modalId?: number, inclusive?: boolean): void {
    if (this.modals.length > 0) {
      if (inclusive === false) {
        const modalIndex = this.modals.map(modal => modal.id).indexOf(modalId)

        if (modalIndex !== -1) {
          if (modalIndex + 1 < this.modals.length) {
            this.popModal(this.modals[modalIndex + 1].id)
          }
        } else {
          return // Throw something happened
        }
      } else {
        this.popModal(modalId || this.modals[0].id)
      }
    }
  }

  public isModalLocation(location: Location): boolean {
    const actualLocation = location
    return actualLocation.state && actualLocation.state.modal
  }

  public forceClearModals(modalId?: number): void {
    let modalsFromIndex = 0
    let modalsToRange = this.modals.length

    if (modalId !== undefined) {
      const modalIndex = this.modals.map(modal => modal.id).indexOf(modalId)

      if (modalIndex !== -1) {
        modalsFromIndex = modalIndex
        modalsToRange = this.modals.length - modalsFromIndex
      } else {
        return // should throw, something is wrong
      }
    }

    this.modals.splice(modalsFromIndex, modalsToRange)
    this.modalsUpdateCallBack(this.modals)
  }

  public launchModal(
    content: React.ReactNode | React.ReactNode[],
    background?: ModalBackground,
    onOutsideClick?: (event: MouseEvent) => boolean,
    onScape?: (event: KeyboardEvent) => boolean
  ): Modal {
    const actualOnOutsideClick = (event: MouseEvent): void => {
      if (!onOutsideClick || onOutsideClick(event)) {
        this.popModal()
      }
    }

    const actualOnScape = (event: KeyboardEvent): void => {
      if (!onScape || onScape(event)) {
        this.popModal()
      }
    }

    const modal: Modal = {
      type: 'custom',
      id: this.currentID++,
      background,
      content,
      onOutsideClick: actualOnOutsideClick,
      onScape: actualOnScape,
      withOutInitialAnimation: false
    }

    this.modals.push(modal)
    this.modalsUpdateCallBack(this.modals)

    return modal
  }

  public launchRouteModal(
    location: Location,
    routes: React.ReactNode | React.ReactNode[],
    onOutsideClick: (event: MouseEvent) => void,
    onScape: (event: KeyboardEvent) => void,
    withOutInitialAnimation: boolean
  ): Modal {
    const modal: Modal = { type: 'route', id: this.currentID++, location, content: routes, onOutsideClick, onScape, withOutInitialAnimation }

    this.modals.push(modal)
    this.modalsUpdateCallBack(this.modals)

    return modal
  }

  public popModal(modalId?: number): void {
    let modalsToPopIndex = this.modals.length - 1
    let modalsToPopRange = 1

    if (modalId !== undefined) {
      const modalIndex = this.modals.map(modal => modal.id).indexOf(modalId)

      if (modalIndex !== -1) {
        modalsToPopIndex = modalIndex
        modalsToPopRange = this.modals.length - modalsToPopIndex
      } else {
        return // should throw, something is wrong
      }
    }

    for (let i = modalsToPopIndex; i < this.modals.length; i++) {
      this.modals[i].closed = true
    }
    this.modalsUpdateCallBack(this.modals)

    setTimeout(() => {
      this.modals.splice(modalsToPopIndex, modalsToPopRange)
      this.modalsUpdateCallBack(this.modals)
    }, 350)
  }
}
