import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import fetchChartHome from '../bancor/chartHome'

export function useUniswapHistory(daysToQuery) {
  dayjs.extend(utc)
  const [uniswapData, setUniswapData] = useState([])
  useEffect(() => {
    const fetchChartData = async function(daysToQuery) {
      try {
        // current time
        const utcEndTime = dayjs.utc()

        let utcStartTime
        // go back, go way way back
        switch (daysToQuery) {
          case 'all':
            utcStartTime = utcEndTime.subtract(1, 'year').startOf('year')
            break
          case '3months':
            utcStartTime = utcEndTime.subtract(3, 'month')
            break
          case '1month':
            utcStartTime = utcEndTime.subtract(1, 'month')
            break
          case '1week':
          default:
            utcStartTime = utcEndTime.subtract(7, 'day').startOf('day')
            break
        }
        const utcStartTimeTimestamp = utcStartTime.unix() * 1e3

        const data = await fetchChartHome()
          .then(list => {
            const sliced = []

            for (const item of list) {
              if (dayjs(Number(item.timestamp)).isBefore(utcStartTimeTimestamp)) {
                break
              }

              sliced.unshift(item)
            }

            return sliced
          })
          .then(data => {
            return data.map(item => ({
              dayString: item.timestamp / 1e3,
              ethVolume: parseFloat(item.volumeETHInUnit),
              usdVolume: parseFloat(item.volumeUSDBInUnit),
              dailyEthVolume: parseFloat(item.volumeETHInUnit),
              dailyUSDVolume: parseFloat(item.volumeUSDBInUnit),
              usdLiquidity: parseFloat(item.liquidityUSDBInUnit),
              ethLiquidity: parseFloat(item.liquidityETHInUnit),
              txCount: 0
            }))
          })

        setUniswapData(data) // remove first value
      } catch (err) {
        console.log('error: ', err)
      }
    }
    fetchChartData(daysToQuery)
  }, [daysToQuery])

  return uniswapData
}
