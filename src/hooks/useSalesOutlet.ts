import { useOutletContext } from 'react-router-dom'
import type { SalesApi } from './useLocalSales'

export function useSalesOutlet(): SalesApi {
  return useOutletContext<SalesApi>()
}
