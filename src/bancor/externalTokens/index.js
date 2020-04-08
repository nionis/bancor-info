import symbols from './symbols'
import fetchMainConverters from '../mainConverters'
import { exchange } from '../converters/transform/toAltPrices'
import { createFakeConverter } from '../utils'

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

        const baseSymbol = symbol.toUpperCase()
        const quoteSymbol = '?'
        const converter = createFakeConverter({
          baseName: baseSymbol,
          baseSymbol,
          quoteSymbol,
          priceUSDB,
          priceETH
        })

        result.set(converter.pair, converter)

        return result
      }, new Map())
    })

  return promise
}
