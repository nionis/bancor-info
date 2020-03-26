import React, { useEffect, useState } from 'react'
import { darken } from 'polished'
import Vibrant from 'node-vibrant'
import { hex } from 'wcag-contrast'
import { ExchangePage } from '../components/ExchangePage'
import LocalLoader from '../components/LocalLoader'
import { useExchangeSpecificData } from '../Data/ExchangeSpecificData'
import { useChart } from '../Data/ChartData'
import { useSwaps } from '../Data/SwapsData'
import { setThemeColor } from '../helpers'
import { getTokenLogo } from '../bancor/utils'

export const ExchangeWrapper = function({
  address,
  exchanges,
  currencyUnit,
  historyDaysToQuery,
  setHistoryDaysToQuery
}) {
  const exchangeData = useExchangeSpecificData(address)
  const swapsData = useSwaps(address)

  const chartData = useChart(address, historyDaysToQuery)

  const [logo, setLogo] = useState('')

  const [currentData, setCurrentData] = useState({})

  useEffect(() => {
    let updateData = {}

    updateData.tokenName = exchangeData.baseName
    updateData.tokenSymbol = exchangeData.baseSymbol
    updateData.tokenAddress = exchangeData.base
    updateData.poolSymbol = exchangeData.quoteSymbol
    updateData.exchangeAddress = exchangeData.exchangeAddress
    updateData.price = exchangeData.price
    updateData.invPrice = exchangeData.invPrice
    updateData.priceUSD = exchangeData.priceUSD
    updateData.pricePercentChange = exchangeData.pricePercentChange
    updateData.pricePercentChangeETH = exchangeData.pricePercentChangeETH
    updateData.volumePercentChange = exchangeData.volumePercentChangeETH
    updateData.volumePercentChangeUSD = exchangeData.volumePercentChangeUSD
    updateData.liquidityPercentChange = exchangeData.liquidityPercentChangeETH
    updateData.liquidityPercentChangeUSD = exchangeData.liquidityPercentChangeUSD
    updateData.txsPercentChange = exchangeData.txsPercentChange
    updateData.ethLiquidity = exchangeData.ethLiquidity
    updateData.usdLiquidity = exchangeData.usdLiquidity
    updateData.tradeVolume = exchangeData.tradeVolume
    updateData.tradeVolumeUSD = exchangeData.tradeVolumeUSD
    updateData.oneDayTxs = exchangeData.oneDayTxs
    setCurrentData(updateData)
  }, [exchangeData])

  useEffect(() => {
    setCurrentData({}) // reset data for UI
    if (exchanges.hasOwnProperty(address)) {
      let tokenAddress = exchanges[address].tokenAddress
      const path = getTokenLogo({
        address: tokenAddress,
        blockchain: address.startsWith('0x') ? 'ethereum' : 'eos'
      })

      Vibrant.from(path).getPalette((err, palette) => {
        if (palette && palette.Vibrant) {
          let detectedHex = palette.Vibrant.hex
          let AAscore = hex(detectedHex, '#FFF')
          while (AAscore < 3) {
            detectedHex = darken(0.01, detectedHex)
            AAscore = hex(detectedHex, '#FFF')
          }
          setThemeColor(detectedHex)
        }
      })
    } else {
      setThemeColor('#333333')
    }
  }, [address, exchanges])

  useEffect(() => {
    if (exchanges.hasOwnProperty(address)) {
      setLogo(exchanges[address].logoStyled)
    }
  }, [exchanges, address])

  return exchangeData ? (
    <ExchangePage
      currencyUnit={currencyUnit}
      exchangeAddress={currentData.exchangeAddress}
      chartData={chartData}
      swapsData={swapsData}
      logo={logo}
      historyDaysToQuery={historyDaysToQuery}
      setHistoryDaysToQuery={setHistoryDaysToQuery}
      tokenName={currentData.tokenName}
      symbol={currentData.tokenSymbol}
      poolSymbol={currentData.poolSymbol}
      tokenAddress={currentData.tokenAddress}
      tradeVolume={currentData.tradeVolume}
      tradeVolumeUSD={currentData.tradeVolumeUSD}
      oneDayTxs={currentData.oneDayTxs}
      ethLiquidity={currentData.ethLiquidity}
      usdLiquidity={currentData.usdLiquidity}
      price={currentData.price}
      invPrice={currentData.invPrice}
      priceUSD={currentData.priceUSD}
      pricePercentChange={currentData.pricePercentChange}
      pricePercentChangeETH={currentData.pricePercentChangeETH}
      volumePercentChange={currentData.volumePercentChange}
      volumePercentChangeUSD={currentData.volumePercentChangeUSD}
      liquidityPercentChange={currentData.liquidityPercentChange}
      liquidityPercentChangeUSD={currentData.liquidityPercentChangeUSD}
      txsPercentChange={currentData.txsPercentChange}
    />
  ) : (
    <LocalLoader />
  )
}
