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
}

export default class ModalesScene extends React.Component<ModalesSceneProps, ModalesSceneState> {
  private preModalScroll: number = null

  public state: ModalesSceneState = { modals: [] }

  componentDidMount() {
    this.props.providerHelper.modalsUpdateCallBack = this.handleModalsUpdate.bind(this)
  }

  private handleModalsUpdate(modals: Modal[]): void {
    // Keep the body scroll before presenting the first modal
    if (!this.preModalScroll) {
      this.preModalScroll = window.pageYOffset
    }

    const renderedModals = []

    for (let i: number = 0; i < modals.length; i++) {
      const modal: Modal = modals[i]

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

    this.setState({ modals: renderedModals })
  }

  render(): React.ReactNode {
    return (
      <div className="modales-scene">
        {this.props.children || null}
        {this.state.modals}
      </div>
    )
  }
}
