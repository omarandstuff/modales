import * as React from 'react'
import { ModalBackground } from './Modales.types'

import './ModalViewer.css'

export type ModalViewerProps = {
  modalId: number
  background?: ModalBackground
  actAsBlur?: boolean
  blurEnabled?: boolean
  closed?: boolean
  onOutsideClick?: (event: Event) => void
  onScape?: (event: Event) => void
  withOutInitialAnimation?: boolean
} & Partial<DefaultProps>

type DefaultProps = {
  background: ModalBackground
}

export default class ModalViewer extends React.Component<ModalViewerProps> {
  static defaultProps: DefaultProps = {
    background: 'translucent'
  }

  static selfStack: number[] = []

  constructor(props: ModalViewerProps) {
    super(props)

    // Kepp track of the modal being on top so the scape event is only relevant to it
    ModalViewer.selfStack.push(props.modalId)

    this.handleKeyDown = this.handleKeyDown.bind(this)
    document.addEventListener('keydown', this.handleKeyDown)
  }

  public componentWillUnmount() {
    ModalViewer.selfStack.pop()
    document.removeEventListener('keydown', this.handleKeyDown)
  }

  private hanldeContentClick(event: MouseEvent) {
    event.stopPropagation()
  }

  private handleOnClick(event: MouseEvent) {
    if (!this.props.closed) {
      this.props.onOutsideClick && this.props.onOutsideClick(event)
    }
  }

  private handleKeyDown(event: KeyboardEvent) {
    const topID = ModalViewer.selfStack[ModalViewer.selfStack.length - 1]

    // Scape should only work on the top modal
    if (event.key === 'Escape' && topID === this.props.modalId) {
      this.props.onScape && this.props.onScape(event)
    }
  }

  public render() {
    const background = this.props.background === 'blurred' ? (this.props.blurEnabled ? 'blurred' : 'translucent') : this.props.background
    const classNames = [
      'modal-viewer',
      this.props.closed ? 'closed' : null,
      this.props.actAsBlur && this.props.blurEnabled ? 'blurified' : null,
      this.props.withOutInitialAnimation ? 'static-init' : null,
      background
    ]
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()

    return (
      <div className={classNames}>
        <div className="background" onClick={this.handleOnClick.bind(this)}>
          <div className="wrapper">
            <div className="content" onClick={this.hanldeContentClick.bind(this)}>
              {this.props.children}
            </div>
          </div>
        </div>
      </div>
    )
  }
}
