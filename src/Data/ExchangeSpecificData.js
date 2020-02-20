import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import fetchConverters from '../bancor/converters'

export function useExchangeSpecificData(exchangeAddress) {
  dayjs.extend(utc)

  const [exchangeData, setExchangeData] = useState({})

  useEffect(() => {
    const fetchExchangeData = async function(address) {
      const pairs = await fetchConverters({ step: 100 })
      const pair = Array.from(pairs.values()).find(pair => pair.id === address)

      setExchangeData({
        exchangeAddress: pair.id,
        price: pair.priceUSDB,
        invPrice: pair.priceETH,
        priceUSD: pair.priceUSDB,
        tokenAddress: pair.base,
        pricePercentChange: pair.priceChange24hr,
        pricePercentChangeETH: pair.priceChange24hr,
        volumePercentChange: pair.volumeChange24hr,
        volumePercentChangeUSD: pair.volumeChange24hr,
        liquidityPercentChange: pair.liquidityChange24hr,
        liquidityPercentChangeUSD: pair.liquidityChange24hr,
        txsPercentChange: '0',
        ethLiquidity: pair.liquidityETHInUnit,
        usdLiquidity: pair.liquidityUSDBInUnit,
        tradeVolume: pair.volume24HrBNTInUnit,
        tradeVolumeUSD: pair.volume24HrUSDBInUnit,
        oneDayTxs: '0'
      })
    }
    fetchExchangeData(exchangeAddress)
  }, [exchangeAddress])

  return exchangeData
}
