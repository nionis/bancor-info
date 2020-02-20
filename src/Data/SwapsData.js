import { useEffect, useState } from 'react'
import fetchSwaps from '../bancor/swaps'

export function useSwaps(converterUsed) {
  const [swapsData, setSwapsData] = useState()

  useEffect(() => {
    const fetchSwapsData = async function() {
      const swaps = await fetchSwaps({ step: 500, converterUsed })
      setSwapsData(swaps)
    }

    fetchSwapsData()
  }, [converterUsed])

  return swapsData
}
