import BigNumber from 'bignumber.js'
import { exchange } from '../../converters/transform/toAltPrices'
import { createFakeConverter } from '../../utils'

const createBNTUSDB = (converters, mainConverters) => {
  const USDBBNT = converters.get('USDBBNT')

  const baseSymbol = 'BNT'
  const quoteSymbol = 'USDB'
  const price = new BigNumber(1).dividedBy(USDBBNT.price).toString()
  const oldPrice = new BigNumber(1).dividedBy(USDBBNT.oldPrice).toString()
  // get price change %
  const priceChange24hr = new BigNumber(price)
    .multipliedBy(100)
    .div(oldPrice)
    .minus(100)
    .toFixed(2)
    .toString()

  const { liquidity, volume24Hr } = Array.from(converters.values()).reduce(
    (result, converter) => {
      if (converter.isOnlyToken) {
        return result
      }

      if (converter.quoteIsBNT) {
        const liquidity = exchange({
          v: converter.quoteLiquidity,
          USDBBNT: mainConverters.USDBBNT,
          ETHBNT: mainConverters.ETHBNT,
          ETHUSDB: mainConverters.ETHUSDB,
          from: 'BNT',
          to: 'USDB'
        })
        const volume24Hr = exchange({
          v: converter.volume24Hr,
          USDBBNT: mainConverters.USDBBNT,
          ETHBNT: mainConverters.ETHBNT,
          ETHUSDB: mainConverters.ETHUSDB,
          from: 'BNT',
          to: 'USDB'
        })

        result.liquidity = new BigNumber(result.liquidity).plus(liquidity).toString()
        result.volume24Hr = new BigNumber(result.volume24Hr).plus(volume24Hr).toString()
      }

      return result
    },
    {
      liquidity: '0',
      volume24Hr: '0'
    }
  )

  const converter = createFakeConverter({
    quoteSymbol,
    baseSymbol,
    base: USDBBNT.quote,
    baseName: 'Bancor Network Token',
    price,
    priceChange24hr,
    liquidity,
    volume24Hr
  })

  return converter
}

export default createBNTUSDB
