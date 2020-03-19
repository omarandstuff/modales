import * as React from 'react'
import { Location } from 'history'

export type ModalBackground = 'transparent' | 'translucent' | 'blurred'

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

export interface ModalesConfiguration {
  defaultBackground?: ModalBackground
  blurEnabled?: boolean
  routeModalsEnabled?: boolean
}
