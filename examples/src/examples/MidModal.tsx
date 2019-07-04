import React from 'react'
import modales from '../modales'

import './MidModal.css'

export default class MidModal extends React.Component {
  private handleCloseModal(): void {
    modales.popModal()
  }

  private handleStackAnother(): void {
    modales.launchModal(<h1>Modal</h1>, (event: MouseEvent): boolean => true, (event: KeyboardEvent): boolean => true)
  }

  render(): React.ReactNode {
    return (
      <div className="mid-modal">
        <h1>Medium Modal</h1>
        <section>
          <p>This is an exaple of an arbitrary Medium Modal that you can create</p>
        </section>
        <section>
          <button onClick={this.handleCloseModal.bind(this)}>Close Modal</button>
          <button onClick={this.handleStackAnother.bind(this)}>Stack another Modal</button>
        </section>
      </div>
    )
  }
}
