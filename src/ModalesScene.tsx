import * as React from 'react'
import { Switch } from 'react-router-dom'
import { Modal } from './Modales.types'
import ProviderHelper from './ProviderHelper'
import ModalViewer from './ModalViewer'

type ModalesSceneProps = {
  children?: React.ReactNode | React.ReactNode[]
  providerHelper: ProviderHelper
}

type ModalesSceneState = {
  modals: Modal[]
  blured: boolean
}

export default class ModalesScene extends React.Component<ModalesSceneProps, ModalesSceneState> {
  private preModalScroll: number = null

  state = { modals: [], blured: false }

  componentDidMount() {
    this.props.providerHelper.modalsUpdateCallBack = this.handleModalsUpdate.bind(this)
  }

  private handleModalsUpdate(modals: Modal[]) {
    let blurComponentBeneathModals: boolean = false

    if (!this.preModalScroll) {
      this.preModalScroll = window.pageYOffset
    }

    const renderedModals = []

    for (let i: number = 0; i < modals.length; i++) {
      const modal: Modal = modals[i]

      if (i === 0) {
        for (let j = i; j < modals.length; j++) {
          const nextModal: Modal = modals[j]

          if (!nextModal.closed) {
            blurComponentBeneathModals = this.shouldBlurBeneathModal(nextModal)
            break
          }
        }
      }
      let actAsBlur: boolean = false

      for (let j: number = i + 1; j < modals.length; j++) {
        const nextModal: Modal = modals[j]

        if (!nextModal.closed) {
          actAsBlur = this.shouldBlurBeneathModal(nextModal)
          break
        }
      }

      if (modal.type === 'route') {
        renderedModals.push(
          <ModalViewer
            modalId={modal.id}
            key={`modal${modal.id}`}
            blurEnabled={this.props.providerHelper.blurEnabled}
            background={modal.location.state.background}
            onOutsideClick={modal.onOutsideClick}
            onScape={modal.onScape}
            closed={modal.closed}
            actAsBlur={actAsBlur}
            withOutInitialAnimation={modal.withOutInitialAnimation}
          >
            <Switch location={modal.location}>{modal.content}</Switch>
          </ModalViewer>
        )
      } else if (modal.type === 'custom') {
        renderedModals.push(
          <ModalViewer
            modalId={modal.id}
            key={`modal${modal.id}`}
            blurEnabled={this.props.providerHelper.blurEnabled}
            background={modal.background}
            onOutsideClick={modal.onOutsideClick}
            onScape={modal.onScape}
            closed={modal.closed}
            actAsBlur={actAsBlur}
            withOutInitialAnimation={modal.withOutInitialAnimation}
          >
            {modal.content}
          </ModalViewer>
        )
      }
    }

    if (renderedModals.length === 0) {
      document.body.classList.remove('modal-viewing')
      document.documentElement.classList.remove('modal-viewing')

      /*  Premodal Scroll
       *
       * Mobile explorers seems like they don't care about the css
       * overflow: hidden, so they just keep scrolling the body.
       * for now we don't care cause the app is mean to work in desktop
       * and in mobile using the actual app but I will keep this just in
       * case, also this makes safary flickering, also wen using blur
       * chrome seems to don't care for fixed positions anymore
       *
       * this will restore the scroll after restoring the body top
       * window.scrollTo(0, this._preModalScroll)
       * this._preModalScroll = null
       * document.body.removeAttribute('style')
       *
       */
    } else {
      /*  Premodal Scroll
       *
       * modal-viewing style makes body position fixed so it losses its scroll
       * position we keep safe that position until we remove all modals
       * document.body.style.top = `${-this._preModalScroll}px`
       * document.body.scrolling = 'no'
       *
       */

      document.body.classList.add('modal-viewing')
      document.documentElement.classList.add('modal-viewing')
    }

    this.setState({ modals: renderedModals, blured: blurComponentBeneathModals && this.props.providerHelper.blurEnabled })
  }

  private shouldBlurBeneathModal(modal: Modal) {
    if (modal) {
      if (modal.type === 'route') {
        const blurWasSet: boolean = modal.location.state && modal.location.state.background === 'blured'

        if (!modal.closed && blurWasSet) {
          return true
        }
      } else if (modal.type === 'custom') {
        if (!modal.closed && modal.background === 'blured') {
          return true
        }
      }
    }
  }

  render() {
    const classNames = ['modales-scene', this.state.blured ? ' blured' : null].join(' ').replace(/\s+/g, ' ')

    return (
      <div className={classNames}>
        {this.props.children || null}
        {this.state.modals}
      </div>
    )
  }
}
