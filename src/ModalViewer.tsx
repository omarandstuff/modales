import * as React from 'react'

import './ModalViewer.css'

type Props = {
  modalId: number
  actAsBlur: boolean
  blurEnabled: boolean
  closed: boolean
  onOutsideClick: (event: Event) => void
  onScape: (event: Event) => void
  withOutInitialAnimation: boolean
} & Partial<DefaultProps>

type DefaultProps = {
  background: 'transparent' | 'translucent' | 'blured'
}

export default class ModalViewer extends React.Component<Props> {
  static defaultProps: DefaultProps = {
    background: 'translucent'
  }

  static selfStack: number[] = []

  constructor(props: Props) {
    super(props)

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
    const background = this.props.background === 'blured' ? (this.props.blurEnabled ? 'blured' : 'translucent') : this.props.background
    const classNames = [
      'modal-viewer',
      this.props.closed ? 'closed' : null,
      this.props.actAsBlur && this.props.blurEnabled ? 'blurified' : null,
      this.props.withOutInitialAnimation ? 'static-init' : null,
      background
    ]
      .join(' ')
      .replace(/\s+/g, ' ')

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
