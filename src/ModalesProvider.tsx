import * as React from 'react'
import { withRouter } from 'react-router'
import { Switch, RouteComponentProps } from 'react-router-dom'
import { Location } from 'history'
import Modales from './Modales'
import { Modal } from './Modales.types'
import ProviderHelper from './ProviderHelper'
import ModalesScene from './ModalesScene'

export interface ModalesProviderProps extends RouteComponentProps {
  children?: React.ReactNode | React.ReactNode[]
  modales: Modales
  debuggMode?: boolean
}

type ModalesProviderState = {
  modals: Modal[]
  blured: boolean
}

export class ModalesProvider extends React.Component<ModalesProviderProps, ModalesProviderState> {
  protected baseLocation: Location = null
  protected intialId: string = `@init${new Date().getTime()}`
  protected historyIndex: number = 0
  protected historyOrder: string[] = []
  protected historyMap: { [key: string]: Location } = {}
  protected lastLocation: Location = this.props.location
  protected providerHelper: ProviderHelper = new ProviderHelper()

  state = { modals: [], blured: false }

  constructor(props: ModalesProviderProps) {
    super(props)

    if (!props.location.key) {
      props.location.key = this.intialId
    }

    if (this.isModal(props.location)) {
      props.location.state.modal = false
    }

    // Connect modales instance
    props.modales.connectWithProvider(this.providerHelper)
    props.modales.connectWithRouter(props.location, props.history)

    this.baseLocation = props.location
    this.historyOrder = [props.location.key]
    this.historyMap[props.location.key] = props.location

    // Debugging
    this.log('*'.repeat(40))
    this.logStats()
    this.log('*'.repeat(40))
  }

  public componentDidUpdate(): void {
    // Scroll to top after a base location changed
    if (this.baseLocation.pathname !== this.lastLocation.pathname) {
      setTimeout(() => {
        window.scrollTo(0, 0)
      }, 10)
    }
    this.lastLocation = this.baseLocation
  }

  public shouldComponentUpdate(nextProps: ModalesProviderProps): boolean {
    const locationProcessed = this.handleHistoryEvent(nextProps)

    if (locationProcessed) {
      nextProps.modales.connectWithRouter(locationProcessed, nextProps.history)
    }

    return !!locationProcessed
  }

  private log(...args: any[]): void {
    if (process.env.NODE_ENV === 'development' && this.props.debuggMode) {
      console.log.apply(null, args)
    }
  }

  private logStats(): void {
    this.log('Base location:', this.baseLocation.key)
    this.log('Index:', this.historyIndex)
    this.log('History Order:', this.historyOrder)
    this.log('History:', this.historyOrder.map((id: string) => this.historyMap[id]))
  }

  private areInTheSameModalGroup(left: Location, right: Location): boolean {
    return (
      left.state &&
      left.state.modalGroup !== undefined &&
      right.state &&
      right.state.modalGroup !== undefined &&
      left.state.modalGroup === right.state.modalGroup
    )
  }

  private handleModalClose(): void {
    this.props.history.goBack()
  }

  private handleHistoryEvent(nextProps: RouteComponentProps<{}> & ModalesProviderProps): Location {
    let { location: newLocation } = nextProps
    const {
      history: { action },
      children
    } = nextProps
    const currentKnown: boolean = this.historyIndex !== -1
    const currentLocationKey: string = currentKnown ? this.historyOrder[this.historyIndex] : this.baseLocation.key
    const currentLocation: Location = currentKnown ? this.historyMap[currentLocationKey] : this.baseLocation

    this.log('='.repeat(40))
    this.log('Action:', action)
    this.log('Current ocation:', currentLocation.key, currentLocation)
    this.log('New location:', newLocation.key, newLocation)
    this.log('~'.repeat(40))

    // We just set base location if route modals are not enabled
    if (!this.providerHelper.routeModalsEnabled) {
      this.providerHelper.forceClearModals()
      this.baseLocation = newLocation
      return newLocation
    }

    // If the new location key is not set we set it as the inital key
    // This happens after visiting the site in a new tab
    if (!newLocation.key) {
      newLocation.key = this.intialId
    }

    // Don't process repetitive events
    if (currentLocation.key === newLocation.key) {
      this.log('~'.repeat(40))
      this.log('Not processed')
      return null
    }

    if (action === 'PUSH') {
      // After a push event all locations after it are lost
      const lostLocations: string[] = this.historyOrder.splice(this.historyIndex + 1, this.historyOrder.length - (this.historyIndex + 1))

      lostLocations.forEach((locationKey: string) => {
        delete this.historyMap[locationKey]
      })

      // If you reload the page and start pushing back and forth in the explorer
      // We can not be sure about the context of these locations so we just set
      // the locationIndex to -1 (See POP event) to known we are in one of them (unknown location)
      // then we push thie new location and use the unknown location as first visited location
      if (this.historyIndex === -1) {
        this.historyOrder.push(this.baseLocation.key)
        this.historyMap[this.baseLocation.key] = this.baseLocation
        this.historyIndex = 0
      }

      this.historyIndex++
      this.historyOrder.push(newLocation.key)
      this.historyMap[newLocation.key] = newLocation

      if (this.isModal(newLocation)) {
        if (this.isModal(currentLocation)) {
          // When we push a modal in the same group as the one on the top
          // We just replace the content so it gives the ilution of navigation
          // in the same modal view
          if (this.areInTheSameModalGroup(currentLocation, newLocation)) {
            const modal: Modal = this.replaceLocationsModals(currentLocation, newLocation, children)

            // If we push a location of the same group we need to tell to all locations sharing
            // modal group to point to the same modal id, so we known we are "navigating"
            // in the same modal
            this.resetLocationModalGroupId(this.historyIndex - 1, 0, newLocation, modal.id)
          } else {
            // It an be the case that there are some custom modals on the top of the current one
            // We need to get rid of them before lauching the new one
            this.providerHelper.forceClearModals(currentLocation.state.modalId, false)

            // If they are not in the same group just lauch a new one
            this.launchModal(newLocation, children)
          }
        } else {
          // If there are not modals just lauch this one
          this.launchModal(newLocation, children)
        }
      } else {
        // If the new location is not a modal (a new page) we need to clear all modals
        // without animations so the user feels like visiting a new page
        this.providerHelper.forceClearModals()
        this.baseLocation = newLocation
      }
    } else if (action === 'POP') {
      // While pressing back and forth in the explorer we need to know id the user
      // is visiting a location that we are keeping track of (known location)
      const knownLocation: Location = this.historyMap[newLocation.key]

      if (knownLocation) {
        const knownLocationIndex: number = this.historyOrder.indexOf(knownLocation.key)

        // We are about to visit a location that is meant to be a modal
        if (this.isModal(knownLocation)) {
          let newBaseLocationIndex: number = null
          let newBaseLocation: Location = null
          let lastBaseLocation: Location = this.baseLocation

          // We don't know if the user went 10 level after of before using the explorer
          // So we need to find a new base location, because we are probaly aboout
          // to lauch a bunch of them and they need to be on the top of a non modal location
          // Iterate in reverse until find something to be beneath all modals
          for (let i: number = knownLocationIndex - 1; i >= 0; i--) {
            newBaseLocationIndex = i
            const baseLocationProspect: Location = this.historyMap[this.historyOrder[i]]

            if (!baseLocationProspect.state || !baseLocationProspect.state.modal) {
              newBaseLocation = baseLocationProspect
              break
            }
          }

          // The new base location found is the same we had before
          // This means we are moving between modals
          if (lastBaseLocation.key === newBaseLocation.key) {
            // If the known location has a modalId it means is already lauched
            // this means the user is going backwards and we need to dismiss all modlas
            // after the known location
            if (knownLocation.state.modalId !== undefined) {
              // if the known location has a modal group then we need to make sure
              // to dismiss modals after this group
              if (knownLocation.state.modalGroup !== undefined) {
                let modalToDismiss: Location = null

                // Try to find something a modal that is not in the same group
                // if it is not in the same group it has its own modal lauched
                for (let i: number = knownLocationIndex + 1; i < this.historyOrder.length; i++) {
                  const modalToDismissProspect: Location = this.historyMap[this.historyOrder[i]]

                  if (!modalToDismissProspect.state) break
                  if (modalToDismissProspect.state.modalId === undefined) break
                  if (!this.areInTheSameModalGroup(modalToDismissProspect, knownLocation)) {
                    modalToDismiss = modalToDismissProspect
                    break
                  }
                }

                // If there are in fact modals after this group
                // we dismiss them and wipe their modalId
                if (modalToDismiss) {
                  this.providerHelper.clearModals(modalToDismiss.state.modalId)

                  this.wipeModalIdFromDismissedModals(knownLocationIndex + 1, this.historyOrder.length)
                }

                // Until this moment we have dissmised all modals after this group
                // but we need to know if there are modals after the known location
                // that share the same group, if it is the case, this "physical" modal
                // has the content of the last location in the group
                const nextLocationFromKnownLocation: Location = this.historyMap[this.historyOrder[knownLocationIndex + 1]]

                // If there are in fact more locations after the known one we need to replace
                // the content of the currently lauched modal
                if (nextLocationFromKnownLocation && this.areInTheSameModalGroup(nextLocationFromKnownLocation, knownLocation)) {
                  // We give the same location for both parameters here because
                  // known location knoes the curremt modal id to force clear
                  // and is used to lauch another one
                  const modal: Modal = this.replaceLocationsModals(knownLocation, knownLocation, children)

                  // After this we tell the whole group which is the new modal id for all of them
                  this.resetLocationModalGroupId(knownLocationIndex - 1, 0, knownLocation, modal.id)
                  this.resetLocationModalGroupId(knownLocationIndex + 1, this.historyOrder.length, knownLocation, modal.id)
                }
              } else {
                // There are not modals in the same group after the known location
                // so we just dissmis everything after knowm modal id
                this.providerHelper.clearModals(knownLocation.state.modalId, false)
                this.wipeModalIdFromDismissedModals(knownLocationIndex + 1, this.historyOrder.length)
              }
            }
          } else {
            // If the user is not visiting a location with a different base location
            // we remove all modals because we don't know what modals are on top
            // of this new base location
            this.providerHelper.forceClearModals()
            this.wipeModalIdFromDismissedModals(0, this.historyOrder.length)
          }

          // We recreate the modals as they were lauched after visiting the base location
          // found for the known location
          this.rebuildModals(newBaseLocationIndex + 1, knownLocationIndex, currentLocation, children)

          this.historyIndex = knownLocationIndex
          this.baseLocation = newBaseLocation
        } else {
          // If the known location is not a modal then is a base location
          // If is the same base location we had we soft dismiss all modals
          // if not we force remove them to give the user the feelong of visiting a new page
          if (this.baseLocation.key === knownLocation.key) {
            this.providerHelper.clearModals()
          } else {
            this.providerHelper.forceClearModals()
          }

          this.wipeModalIdFromDismissedModals(0, this.historyOrder.length)

          // Also we set the new locationa as the new location to keep previous modifications
          // When passing to Modal Scene
          newLocation = knownLocation

          this.historyIndex = knownLocationIndex
          this.baseLocation = knownLocation
        }
      } else {
        // Unkonwn locations can't have modals on the top
        this.providerHelper.forceClearModals()

        this.wipeModalIdFromDismissedModals(0, this.historyOrder.length)

        // Unknown locations can't be modales because we don't know
        // how to build a context arround them
        if (this.isModal(newLocation)) {
          newLocation.state.modal = false
        }

        // Something is outside our history tracking
        // When pressed the back and forth buttons
        // on the explorer after reload the page
        this.historyIndex = -1
        this.baseLocation = newLocation
      }
    } else if (action === 'REPLACE') {
      if (this.isModal(newLocation)) {
        // We can only replace modals locations with modal locations
        // So if the current location is not we handle the replacement as no modal
        if (!this.isModal(currentLocation)) {
          newLocation.state.modal = false

          // We just replace the current location for the new one
          // and set the base location as it
          if (this.historyIndex === -1) {
            this.historyOrder.push(newLocation.key)
            this.historyIndex = 0
          } else {
            delete this.historyMap[currentLocationKey]
            this.historyOrder[this.historyIndex] = newLocation.key
          }
          this.historyMap[newLocation.key] = newLocation
          this.baseLocation = newLocation
        } else {
          // We replace the current location in the history
          // with the new one without setting the base location
          delete this.historyMap[currentLocationKey]
          this.historyOrder[this.historyIndex] = newLocation.key
          this.historyMap[newLocation.key] = newLocation

          // If the curret loction is part of a modal group we need to know
          // if we are visiting something in between
          if (currentLocation.state.modalGroup !== undefined) {
            // If both are in the same modal group we just replace the content of the
            // shared modal and set all the locations in the group with the new modalid
            if (currentLocation.state.modalGroup === newLocation.state.modalGroup) {
              const modal: Modal = this.replaceLocationsModals(currentLocation, newLocation, children)

              this.resetLocationModalGroupId(this.historyIndex - 1, 0, currentLocation, modal.id)
              this.resetLocationModalGroupId(this.historyIndex + 1, this.historyOrder.length, currentLocation, modal.id)
            } else {
              // If the replacement is in a diferent gorup or doesn't belong to any
              // We will:
              // 1.- Replce the content of the already instantiated modal with the content
              //     of a potential previous location in the same group
              // 2.- Launch a new modal for the replacement
              const previousLocationFromCurrentLocation: Location = this.historyMap[this.historyOrder[this.historyIndex - 1]]

              // If we found such previous location in the same group of the location that's being replaced
              // we do what the previous comment said, this leave us with probably two groups
              // between the replacement location
              if (previousLocationFromCurrentLocation && this.areInTheSameModalGroup(previousLocationFromCurrentLocation, currentLocation)) {
                const modal = this.replaceLocationsModals(currentLocation, previousLocationFromCurrentLocation, children)

                this.resetLocationModalGroupId(this.historyIndex - 2, 0, currentLocation, modal.id)
                // Since this part of the modal groups is not in scope (are after the new location)
                // We set them as a not launched modals
                this.resetLocationModalGroupId(this.historyIndex + 1, this.historyOrder.length, this.historyMap[this.historyOrder.length], undefined)
              }

              // Now that we do the trick of the previous group modal we hard lauch the replacement
              this.launchModal(newLocation, children, true)
            }
          } else {
            // If the current modal is not part of a group we just replace for the new one
            this.replaceLocationsModals(currentLocation, newLocation, children)
          }
        }
      } else {
        // If the replacement is not a modal we use it as a new base location
        // and clear the modals
        this.providerHelper.forceClearModals()

        this.wipeModalIdFromDismissedModals(0, this.historyOrder.length)

        // Replace locations can then be a known location now
        if (this.historyIndex === -1) {
          this.historyOrder.push(newLocation.key)
          this.historyIndex = 0
        } else {
          delete this.historyMap[currentLocationKey]
          this.historyOrder[this.historyIndex] = newLocation.key
        }

        this.historyMap[newLocation.key] = newLocation
        this.baseLocation = newLocation
      }
    }

    this.log('~'.repeat(40))
    this.logStats()

    return newLocation
  }

  private isModal(location: Location): boolean {
    return location.state && location.state.modal
  }

  private launchModal(location: Location, children: React.ReactNode | React.ReactNode[], withoutInitialAnimation: boolean = false): Modal {
    const modal: Modal = this.providerHelper.launchRouteModal(
      location,
      children,
      this.handleModalClose.bind(this),
      this.handleModalClose.bind(this),
      withoutInitialAnimation
    )
    location.state.modalId = modal.id

    return modal
  }

  private rebuildModals(from: number, to: number, currentLocation: Location, children: React.ReactNode | React.ReactNode[]): void {
    let lastModalGroup: string = null
    let lastModalGroupLocation: Location = null
    let lastModalGroupLocationIndex: number = null

    // This will be from base location + 1 to known location
    for (let i = from; i <= to; i++) {
      const locationToLaunch: Location = this.historyMap[this.historyOrder[i]]

      // If the location is modal we need to launch it
      if (this.isModal(locationToLaunch)) {
        // But if the prospect belongs to a modal group we need to wait until
        // all locations in the group are iterated to lauch just a modal
        // that they will share, so we just keep track of the last found
        if (locationToLaunch.state.modalGroup !== undefined) {
          if (locationToLaunch.state.modalGroup !== lastModalGroup) {
            // We found a modal that is not in the last grup found so now
            // we can laouch the modal group before the new group
            if (lastModalGroup) {
              this.rebuildModalGroup(currentLocation, lastModalGroupLocation, lastModalGroupLocationIndex, children)

              lastModalGroup = null
              lastModalGroupLocation = null
              lastModalGroupLocationIndex = null
            }

            lastModalGroup = locationToLaunch.state.modalGroup
          }
          lastModalGroupLocation = locationToLaunch
          lastModalGroupLocationIndex = i
          continue
        } else {
          // We found a modal that is not in the last grup found so now
          // we can laouch the modal group before the new "normal" one
          if (lastModalGroup) {
            this.rebuildModalGroup(currentLocation, lastModalGroupLocation, lastModalGroupLocationIndex, children)

            lastModalGroup = null
            lastModalGroupLocation = null
            lastModalGroupLocationIndex = null
          }

          // Now lauch the modal found
          if (locationToLaunch.state.modalId === undefined) {
            this.launchModal(locationToLaunch, children)
          }
        }
      } else {
        // If we reach a location that is not modal we stop looking
        break
      }
    }

    // It can be the case where the last modal found was a grouped one
    // so the for finishes and it does not lauches that last one
    if (lastModalGroup) {
      this.rebuildModalGroup(currentLocation, lastModalGroupLocation, lastModalGroupLocationIndex, children)

      lastModalGroup = null
      lastModalGroupLocation = null
      lastModalGroupLocationIndex = null
    }
  }

  private rebuildModalGroup(
    currentLocation: Location,
    lastModalGroupLocation: Location,
    lastModalGroupLocationIndex: number,
    children: React.ReactNode | React.ReactNode[]
  ): void {
    // If this group is not lauched we just lauch it
    // and set the group modalid
    if (lastModalGroupLocation.state.modalId === undefined) {
      const modal: Modal = this.launchModal(lastModalGroupLocation, children)

      this.resetLocationModalGroupId(lastModalGroupLocationIndex - 1, 0, lastModalGroupLocation, modal.id)
      this.resetLocationModalGroupId(lastModalGroupLocationIndex + 1, this.historyOrder.length, lastModalGroupLocation, modal.id)
    } else if (this.shareTheSameModalId(currentLocation, lastModalGroupLocation)) {
      // This happens when the user is "navigating" backwars proably step by step
      // in the same group so since is already lauched we need to replace the content
      // of this modal with the last found wich is the known location
      const modal: Modal = this.replaceLocationsModals(currentLocation, lastModalGroupLocation, children)

      this.resetLocationModalGroupId(lastModalGroupLocationIndex - 1, 0, lastModalGroupLocation, modal.id)
      this.resetLocationModalGroupId(lastModalGroupLocationIndex + 1, this.historyOrder.length, lastModalGroupLocation, modal.id)
    }
  }

  private replaceLocationsModals(currentLocation: Location, newLocation: Location, children: React.ReactNode | React.ReactNode[]): Modal {
    this.providerHelper.forceClearModals(currentLocation.state.modalId)
    const modal: Modal = this.launchModal(newLocation, children, true)

    return modal
  }

  private resetLocationModalGroupId(from: number, to: number, location: Location, modalId: number): void {
    const reverce = to < from
    for (let i: number = from; reverce ? i >= 0 : i < to; reverce ? i-- : i++) {
      const groupLocationProspect: Location = this.historyMap[this.historyOrder[i]]

      if (!this.areInTheSameModalGroup(groupLocationProspect, location)) {
        break
      } else {
        if (modalId) {
          groupLocationProspect.state.modalId = modalId
        } else {
          delete groupLocationProspect.state.modalId
        }
      }
    }
  }

  private shareTheSameModalId(left: Location, right: Location): boolean {
    return left.state && left.state.modalId && right.state && right.state.modalId && left.state.modalId === right.state.modalId
  }

  private wipeModalIdFromDismissedModals(from: number, to: number): void {
    for (let i: number = from; i < to; i++) {
      const locationToWipe: Location = this.historyMap[this.historyOrder[i]]

      if (locationToWipe.state) {
        delete locationToWipe.state.modalId
      }
    }
  }

  public render(): React.ReactNode {
    return (
      <ModalesScene providerHelper={this.providerHelper}>
        <Switch location={this.baseLocation}>{this.props.children || null}</Switch>
      </ModalesScene>
    )
  }
}

export default withRouter(ModalesProvider)
