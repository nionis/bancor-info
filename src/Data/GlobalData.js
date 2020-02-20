import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import fetchTotals from '../bancor/totals'

export function useGlobalData() {
  dayjs.extend(utc)
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
