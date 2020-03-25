import { useEffect, useState } from 'react'
import fetchChartExchange from '../bancor/chartExchange'

export function useChart(exchangeAddress, daysToQuery) {
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    const fetchChartData = async function(exchangeAddress, daysToQuery) {
      daysToQuery = '1month'

      try {
        // const utcEndTime = dayjs.utc()
        // let utcStartTime
        // switch (daysToQuery) {
        //   case 'all':
        //     utcStartTime = utcEndTime.subtract(1, 'year').startOf('year')
        //     break
        //   case '3months':
        //     utcStartTime = utcEndTime.subtract(3, 'month')
        //     break
        //   case '1month':
        //     utcStartTime = utcEndTime.subtract(1, 'month')
        //     break
        //   case '1week':
        //   default:
        //     utcStartTime = utcEndTime.subtract(7, 'day').startOf('day')
        //     break
        // }
        // let startTime = utcStartTime.unix() - 1 // -1 because we filter on greater than in the query
        let data = []

        const results = await fetchChartExchange({
          converterId: exchangeAddress
        })

        results.forEach(result => {
          data.push({
            date: result.timestamp + 60 * 60 * 24,
            dayString: result.timestamp + 60 * 60 * 24,
            ethVolume: result.item.volumeETHInUnit,
            usdVolume: result.item.volumeUSDBInUnit,
            ethLiquidity: result.item.liquidityETHInUnit,
            usdLiquidity: result.item.liquidityUSDBInUnit,
            ethBalance: result.item.liquidityETHInUnit,
            tokenBalance: result.item.liquidityInUnit,
            tokenPriceUSD: result.item.priceUSDB,
            ethPerToken: result.item.priceETH,
            tokensPerUSD: result.item.priceUSDB,
            tokensPerEth: result.item.priceETH
          })
        })

        data = data.sort((a, b) => (parseInt(a.date) > parseInt(b.date) ? 1 : -1))

        setChartData(data)
      } catch (err) {
        console.log('error: ', err)
      }
    }

    fetchChartData(exchangeAddress, daysToQuery)
  }, [exchangeAddress, daysToQuery])

  return chartData
}
