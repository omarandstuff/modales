import { Location, History } from 'history'

export default class RouterRef {
  private currectLocation: Location = null
  private historyRef: History = null

  constructor(location: Location, history: History) {
    this.currectLocation = location
    this.historyRef = history
  }

  block(prompt?: string | boolean | History.TransitionPromptHook): void {
    this.historyRef.block(prompt)
  }

  isModalLocation(location?: Location): boolean {
    const actualLocation = location || this.currectLocation
    return actualLocation.state && actualLocation.state.modal
  }

  go(n: number): void {
    this.historyRef.go(n)
  }

  goBack(): void {
    this.historyRef.goBack()
  }

  goForward(): void {
    this.historyRef.goForward()
  }

  push(path: string, state?: {}): void {
    this.historyRef.push(path, state)
  }

  replace(path: string, state: {}): void {
    this.historyRef.replace(path, state)
  }
}
