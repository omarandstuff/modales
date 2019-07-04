import React from 'react'
import { Link } from 'react-router-dom'
import modales from '../modales'
import BigModal from './BigModal'
import { ModalBackground } from 'modales'

import './Home.css'

export default class Home extends React.Component {
  private handleShowModal(background?: ModalBackground): void {
    modales.launchModal(<BigModal />, background)
  }

  render(): React.ReactNode {
    return (
      <div className="home">
        <h1>Modales Examples</h1>
        <section>
          <p>Modales manages how modals are stacked and also how modals route style are stacked as well</p>
        </section>
        <h2>Custom modals</h2>
        <section>
          <p>Custom modals will show whatever you set as the Component</p>
          <button onClick={this.handleShowModal.bind(this, 'translucent')}>Show modal</button>
        </section>
        <h2>Route modals</h2>
        <section>
          <p>Route modals will show the Route configured for the path visited</p>
          <p>For this you need to configure a react router Link state to have modal: true</p>
          <Link to={{ pathname: '/modal', state: { modal: true } }}>Visit modal route</Link>
        </section>
        <h2>Group Route modals</h2>
        <section>
          <p>
            If you pass a group name into a link state, you are basically telling Modales to handlde the route modal as a sigle entity no matter how many
            different routes you visit in the modal they will render without any additional animation so it givis the feeling of navigation even in modal mode.
          </p>
          <p>Additionally you can use replace in links of the same group to give the modal an easy way to go back without revisiting all routes.</p>
          <Link to={{ pathname: '/groupmodal/A', state: { modal: true, modalGroup: 'modales' } }}>Visit modal route group</Link>
        </section>
        <h2>Transparent and Blured backgrounds</h2>
        <section>
          <p>By default all modals background will be "translucent" but you can chouse between additional types</p>
          <button onClick={this.handleShowModal.bind(this, 'transparent')}>Show transparent background modal</button>
          <button onClick={this.handleShowModal.bind(this, 'blured')}>Show blured background modal</button>
        </section>
      </div>
    )
  }
}
