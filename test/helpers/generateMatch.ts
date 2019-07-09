import { match } from 'react-router'

export default function generateMatch(params?: {}, path?: string, isExact?: boolean, url?: string): match {
  return {
    params: params || {},
    path: path || '',
    isExact: isExact || false,
    url: url || ''
  }
}
