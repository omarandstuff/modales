import React from 'react'
import modales from '../modales'
import MidModal from './MidModal'

import './ModalRoute.css'

export default class ModalRoute extends React.Component {
  private handleShowModal(): void {
    modales.launchModal(<MidModal />, (event: MouseEvent): boolean => true, (event: KeyboardEvent): boolean => true)
  }

  render(): React.ReactNode {
    return (
      <div className="modal-route">
        <h1>This is meant to be shown as modal for /modal</h1>
        <section>
          <p>Read the route location state if you need to know if you are in modal mode</p>
        </section>
        <h2>Custom modales</h2>
        <section>
          <p>You can open custom modals over route modals</p>
          <button onClick={this.handleShowModal.bind(this)}>Show modal</button>
        </section>
      </div>
    )
  }
}
