import { Location, History } from 'history'

export default class RouterRef {
  private currectLocation: Location = null
  private historyRef: History = null

  public constructor(location: Location, history: History) {
    this.currectLocation = location
    this.historyRef = history
  }

  public block(prompt?: string | boolean | History.TransitionPromptHook): void {
    this.historyRef.block(prompt)
  }

  public isModalLocation(location?: Location): boolean {
    const actualLocation = location || this.currectLocation
    return !!actualLocation.state && !!actualLocation.state.modal
  }

  public go(n: number): void {
    this.historyRef.go(n)
  }

  public goBack(): void {
    this.historyRef.goBack()
  }

  public goForward(): void {
    this.historyRef.goForward()
  }

  public push(path: string, state?: {}): void {
    this.historyRef.push(path, state)
  }

  public replace(path: string, state?: {}): void {
    this.historyRef.replace(path, state)
  }
}
