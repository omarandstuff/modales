import * as React from 'react'
import { Switch } from 'react-router-dom'
import { Modal } from './Modales.types'
import ProviderHelper from './ProviderHelper'
import ModalViewer from './ModalViewer'

export type ModalesSceneProps = {
  className?: string
  children?: React.ReactNode | React.ReactNode[]
  providerHelper: ProviderHelper
}

type ModalesSceneState = {
  modals: Modal[]
  blurred: boolean
}

export default class ModalesScene extends React.Component<ModalesSceneProps, ModalesSceneState> {
  private preModalScroll: number = null

  state = { modals: [], blurred: false }

  componentDidMount() {
    this.props.providerHelper.modalsUpdateCallBack = this.handleModalsUpdate.bind(this)
  }

  private handleModalsUpdate(modals: Modal[]): void {
    let blurComponentBeneathModals: boolean = false

    // Keep the body scroll before presenting the first modal
    if (!this.preModalScroll) {
      this.preModalScroll = window.pageYOffset
    }

    const renderedModals = []

    // We need to first check if there is a modal that will make the body be blurred
    // Just onece only one blurred modal on the top and we blur the body
    for (let i: number = 0; i < modals.length; i++) {
      const nextModal: Modal = modals[i]

      blurComponentBeneathModals = this.shouldBlurBeneathModal(nextModal)

      if (blurComponentBeneathModals) break
    }

    for (let i: number = 0; i < modals.length; i++) {
      const modal: Modal = modals[i]
      let actAsBlur: boolean = false

      // Now we need to now if this modal is being blurred by another modal at some level
      for (let j: number = i + 1; j < modals.length; j++) {
        const nextModal: Modal = modals[j]

        actAsBlur = this.shouldBlurBeneathModal(nextModal)

        if (actAsBlur) break
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

    this.setState({ modals: renderedModals, blurred: blurComponentBeneathModals && this.props.providerHelper.blurEnabled })
  }

  private shouldBlurBeneathModal(modal: Modal): boolean {
    if (modal.type === 'route') {
      const blurWasSet: boolean = modal.location.state && modal.location.state.background === 'blurred'

      if (!modal.closed && blurWasSet) {
        return true
      }
    } else if (modal.type === 'custom') {
      if (!modal.closed && modal.background === 'blurred') {
        return true
      }
    }
  }

  render(): React.ReactNode {
    const classNames = ['modales-scene', this.state.blurred ? ' blurred' : null]
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()

    return (
      <div className={classNames}>
        {this.props.children || null}
        {this.state.modals}
      </div>
    )
  }
}
