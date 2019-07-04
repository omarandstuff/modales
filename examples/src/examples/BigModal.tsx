import React from 'react'
import modales from '../modales'
import MidModal from './MidModal'

import './BigModal.css'

export default class BigModal extends React.Component {
  private handleCloseModal(): void {
    modales.popModal()
  }

  private handleStackAnother(): void {
    modales.launchModal(<MidModal />, (event: MouseEvent): boolean => true, (event: KeyboardEvent): boolean => true)
  }

  render(): React.ReactNode {
    return (
      <div className="big-modal">
        <h1>Big Modal</h1>
        <section>
          <p>This is an exaple of an arbitrary Big Modal that you can create</p>
        </section>
        <section>
          <button onClick={this.handleCloseModal.bind(this)}>Close Modal</button>
          <button onClick={this.handleStackAnother.bind(this)}>Stack another Modal</button>
        </section>
      </div>
    )
  }
}
