import symbols from './symbols'
import fetchMainConverters from '../mainConverters'
import { exchange } from '../converters/transform/toAltPrices'

let promise

export default async () => {
  if (promise) return promise

  promise = Promise.resolve()
    .then(() => {
      const combinations = symbols.reduce((result, symbol) => {
        symbol = symbol.toLowerCase()

        result.push(symbol)
        result.push(`eos${symbol}`)
        result.push(`${symbol}-eos`)
        result.push(`eth${symbol}`)
        result.push(`${symbol}-eth`)

        return result
      }, [])

      return Promise.all([
        fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${combinations}&vs_currencies=usd`).then(res =>
          res.json()
        ),
        fetchMainConverters()
      ])
    })
    .then(([cg, mainConverters]) => {
      const USDBBNT = mainConverters.USDBBNT
      const ETHBNT = mainConverters.ETHBNT
      const ETHUSDB = mainConverters.ETHUSDB

      return Object.entries(cg).reduce((result, [symbol, item]) => {
        if (typeof item.usd === 'undefined') return result

        const priceUSDB = String(item.usd)
        const priceETH = exchange({
          v: priceUSDB,
          from: 'USDB',
          to: 'ETH',
          USDBBNT,
          ETHBNT,
          ETHUSDB
        })

        const pair = `${symbol.toUpperCase()}USDB`

        result.set(
          pair,
          fakeConverter({
            symbol: symbol.toUpperCase(),
            pair,
            priceUSDB,
            priceETH
          })
        )

        return result
      }, new Map())
    })

  return promise
}

const fakeConverter = ({ symbol, pair, priceUSDB, priceETH }) => ({
  id: '0x0000000000000000000000000000000000000000',
  base: '0x0000000000000000000000000000000000000000',
  baseSymbol: symbol,
  baseName: symbol,
  baseLiquidity: '0',
  baseDecimals: 18,
  baseIsUSDB: false,
  baseIsETH: false,
  baseIsBNT: false,
  quote: '0x0000000000000000000000000000000000000000',
  quoteSymbol: 'USDB',
  quoteName: 'Bancor Network Token',
  quoteLiquidity: '0',
  quoteDecimals: 18,
  quoteIsUSDB: true,
  quoteIsETH: false,
  quoteIsBNT: false,
  pair: pair,
  price: priceUSDB,
  oldPrice: '0',
  liquidity: '0',
  oldLiquidity: '0',
  volume: '0',
  oldVolume: '0',
  volume24Hr: '0',
  volumeChange24hr: '0',
  priceChange24hr: '0',
  liquidity24Hr: '0',
  liquidityChange24hr: '0',
  priceBNT: '0',
  liquidityBNT: '0',
  volumeBNT: '0',
  volume24HrBNT: '0',
  oldPriceBNT: '0',
  oldLiquidityBNT: '0',
  oldVolumeBNT: '0',
  priceUSDB: priceUSDB,
  liquidityUSDB: '0',
  volumeUSDB: '0',
  volume24HrUSDB: '0',
  oldPriceUSDB: '0',
  oldLiquidityUSDB: '0',
  oldVolumeUSDB: '0',
  priceETH: priceETH,
  liquidityETH: '0',
  volumeETH: '0',
  volume24HrETH: '0',
  oldPriceETH: '0',
  oldLiquidityETH: '0',
  oldVolumeETH: '0',
  liquidityUSDBInUnit: '0',
  liquidityETHInUnit: '0',
  liquidityBNTInUnit: '0',
  volumeUSDBInUnit: '0',
  volumeETHInUnit: '0',
  volumeBNTInUnit: '0',
  volume24HrUSDBInUnit: '0',
  volume24HrETHInUnit: '0',
  volume24HrBNTInUnit: '0',
  quoteLiquidityInUnit: '0',
  baseLiquidityInUnit: '0'
})
