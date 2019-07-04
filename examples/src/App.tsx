import React from 'react'
import './App.css'
import { BrowserRouter, Route } from 'react-router-dom'
import { ModalesProvider } from 'modales'
import Home from './examples/Home'
import ModalRoute from './examples/ModalRoute'
import GroupModalRouteA from './examples/GroupModalRouteA'
import GroupModalRouteB from './examples/GroupModalRouteB'

import modales from './modales'

export default class App extends React.Component {
  render(): React.ReactNode {
    return (
      <div className="app">
        <BrowserRouter>
          <ModalesProvider modales={modales} debuggMode>
            <Route exact path="/" component={Home}></Route>
            <Route exact path="/modal" component={ModalRoute}></Route>
            <Route exact path="/groupmodal/A" component={GroupModalRouteA}></Route>
            <Route exact path="/groupmodal/B" component={GroupModalRouteB}></Route>
          </ModalesProvider>
        </BrowserRouter>
      </div>
    )
  }
}
