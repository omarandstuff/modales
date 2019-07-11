<h1 align="center">
  <img src="https://raw.githubusercontent.com/omarandstuff/modales/master/media/modales-logo.png" alt="Modales" title="Modales" width="512">
</h1>

[![npm version](https://badge.fury.io/js/modales.svg)](https://www.npmjs.com/package/modales)
[![Build Status](https://travis-ci.org/omarandstuff/modales.svg?branch=master)](https://travis-ci.org/omarandstuff/modales)
[![Maintainability](https://api.codeclimate.com/v1/badges/89605c0247aaa26ccf35/maintainability)](https://codeclimate.com/github/omarandstuff/modales/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/89605c0247aaa26ccf35/test_coverage)](https://codeclimate.com/github/omarandstuff/modales/test_coverage)

Modales provides a high level interface to manage modals and `Route` modals inside your React application. Modales is not a/(part of a) CSS library so modals content will look just as you like them to look; Modales will just display a modal in the center of the screen with the content you provide which also takes into account content that is bigger that the view and will provide scroll bars to it.

Modales uses [react-router](https://github.com/ReactTraining/react-router) to successfully manage route modales, it also provided extra tools to navigate.

## Install

```sh
npm install modales

yarn add modales
```

## Getting staterd

You will need a Modales instance to connect, this will connect with the `ModalesProvider`.

```js
// modales.js

import Modales from 'modales'

const configuration = { blurEnabled: true, routeModalsEnabled: true }
const modales = new Modales(configuration)

export default modales
```

Typescript:

```ts
// modales.ts

import Modales, { ModalesConfiguration } from 'modales'

const configuration: ModalesConfiguration = { blurEnabled: true, routeModalsEnabled: true }
const modales: Modales = new Modales(configuration)

export default modales
```

Then we need to use the `ModalesProvider` component to wrap your app and enable the modals display. You should also wrap the app with the `react-router` Router

```js
// App.js
import React from 'react'
import { BrowserRouter, Route } from 'react-router-dom'
import { ModalesProvider } from 'modales'

// Modales instance
import modales from './modales'

export default class App extends React.Component {
  render() {
    return (
      <div className="app">
        <BrowserRouter>
          <ModalesProvider modales={modales}>
            <Route exact path="/" component={SomeComponent}></Route>
          </ModalesProvider>
        </BrowserRouter>
      </div>
    )
  }
}
```

## Navigate to a modal route

Use react-router as you normally do just set the state of any route to contain the property modal as true.

```js
<Link to={{ pathname: '/modal', state: { modal: true } }}>Visit modal route</Link>
```

### Groups

If you want to give the user a feeling like navigating inside the route modal, something like [IMDB](https://www.imdb.com/title/tt6320628/mediaviewer/rm952737537) when you click on the picture and navigate between them and when you go back no matter how many pictures you navigate it will take you to the movie page.

For this we have `modalGroups` so when you navigate to a new route in the same modal group it will just change the content of the modal with the new route.

Additionally use replace to make the effect of going back we talked early.

```js
<Link replace to={{ pathname: '/modal', state: { modal: true, modalGroup: 'pictures' } }}>
  Visit modal route
</Link>
```

### Background

You can choose between 3 types of backgrounds `transparent | translucent | blurred`, just pass the background prop into the state.


```js
<Link replace to={{ pathname: '/modal', state: { modal: true, background: 'blurred' } }}>
  Visit modal route
</Link>
```

## Custom modals

Use the Modales instance to launch modals with a particular content. Optionally you can also provided the kind of background and a `onOutsideClick` callback and a `onScape` one, to handle if you really want the modal to be closed (Probably launch another modal asking "are you sure?" to the user).

```js
//anyfile.js
import modales from './modales'

// Return true if you actually want the modal to be closed
function onOutsideClick(event) {
  if (somethig) {
    return true
  }
}

// Return true if you actually want the modal to be closed
function onScape(event) {
  if (somethig) {
    return true
  }
}

modales.launchModal(<SomeModalConetent props />, 'transparent', onOutsideClick, onScape)
```

Typescript:

```ts
//anyfile.ts
import modales, { ModalBackground } from './modales'

// Return true if you actally want the modal to be closed
function onOutsideClick(event: MouseEvent): boolean {
  if (somethig) {
    return true
  }
}

// Return true if you actally want the modal to be closed
function onScape(event: KeyboardEvent): boolean {
  if (somethig) {
    return true
  }
}

const background: ModalBackground = 'transparent'

modales.launchModal(<SomeModalConetent props />, background, onOutsideClick, onScape)
```

## Router Ref

Modales comes with a useful reference to the router so you can call route actions from your modales instance.

```js
//anyfile.js
import modales from './modales'

modales.router.push('/path', { modal: true })
modales.router.goBack()
```

## Manually Pop a custom modal

If you really need to pop the top modal without depending `onOutsideClick` and `onScape` events you can use the modal instance to do so.

```js
//anyfile.js
import modales from './modales'

modales.launchModal(<SomeModalConetent props />)

setTimeOut(() => {
  modales.popModal()
}, 2000)
```

WARNING: do not use this for a route modal, route modals depend on the navigation history so you can only dismiss a route modal by navigating back or to another non modal route.

## Contributions

PRs are welcome

## Lisence

MIT
