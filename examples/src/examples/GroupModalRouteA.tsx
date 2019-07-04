import React from 'react'
import { Link } from 'react-router-dom'

import './GroupModalRouteA.css'

export default class GroupModalRouteA extends React.Component {
  render(): React.ReactNode {
    return (
      <div className="group-modal-route">
        <h1>This is a group modal route A</h1>
        <section>
          <p>You can visit as many routes in the same group, and you can dissmis the modal just by going back</p>
        </section>
        <Link replace to={{ pathname: '/groupmodal/B', state: { modal: true, modalGroup: 'modales' } }}>Visit group modal route B</Link>
      </div>
    )
  }
}
