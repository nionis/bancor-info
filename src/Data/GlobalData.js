import { useEffect, useState } from 'react'
import fetchTotals from '../bancor/totals'

export function useGlobalData() {
  const [globalData, setGlobalData] = useState()

  useEffect(() => {
    const fetchGlobalData = async function() {
      const totals = await fetchTotals({ step: 1000 })
      setGlobalData(totals)
    }

    fetchGlobalData()
  }, [])

  return globalData
}
