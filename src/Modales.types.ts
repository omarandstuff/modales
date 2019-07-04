import * as React from 'react'
import { Location, History } from 'history'

export type ModalBackground = 'transparent' | 'translucent' | 'blured'

export interface Modal {
  id: number
  background?: ModalBackground
  content: React.ReactNode | React.ReactNode[]
  closed?: boolean
  location?: Location
  onOutsideClick?: (event: MouseEvent) => void
  onScape?: (event: KeyboardEvent) => void
  type: 'route' | 'custom'
  withOutInitialAnimation: boolean
}

export interface Router {
  block(pathname: string, state: {}): void
  isModalLocation(location: Location): boolean
  go(pathname: string, state: {}): void
  goBack(pathname: string, state: {}): void
  goForward(pathname: string, state: {}): void
  push(pathname: string, state: {}): void
  replace(pathname: string, state: {}): void
}

export interface ModalesInstance {
  providerHelper: ProviderHelperInstance
  router: Router
}

export interface ProviderHelperInstance {
  blurEnabled: boolean
  providerCallBack: (modals: Modal[]) => void
  routeModalsEnabled: boolean
  clearModals(modalId?: number, inclusive?: boolean): void
  isModalLocation(location: Location): boolean
  forceClearModals(modalId?: number): void
  launchModal(
    component: React.ReactNode | React.ReactNode[],
    onOutsideClick: (event: MouseEvent) => boolean,
    onScape: (event: KeyboardEvent) => boolean,
    background?: string
  ): Modal
  launchRouteModal(
    location: Location,
    routes: React.ReactNode | React.ReactNode[],
    onOutsideClick: (event: MouseEvent) => void,
    onScape: (event: KeyboardEvent) => void,
    withOutInitialAnimation: boolean
  ): Modal
  popModal(modalId?: number): void
  setRouterBridge(newLocation: Location, historyRef: History): void
}
