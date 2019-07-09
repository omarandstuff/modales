import { Location } from 'history'

export default function generateLocation(pathname?: string, key?: string, state?: {}): Location {
  return {
    key: key,
    pathname: pathname || '',
    state: state || {},
    search: '',
    hash: ''
  }
}
