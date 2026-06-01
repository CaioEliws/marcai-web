import { useQuery } from '@tanstack/react-query'
import { businessApi } from '../api/businessApi'
import { businessQueryKeys } from './businessQueryKeys'

export function useCurrentBusinessQuery() {
  return useQuery({
    queryKey: businessQueryKeys.current(),
    queryFn: businessApi.getCurrent,
  })
}
