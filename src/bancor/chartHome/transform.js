import BigNumber from 'bignumber.js'
import { exchange } from '../converters/transform/toAltPrices'

const transform = ({ mainConverters, data }) => {
  const USDBBNT = mainConverters.USDBBNT
  const ETHBNT = mainConverters.ETHBNT
  const ETHUSDB = mainConverters.ETHUSDB

  const keys = Object.keys(data)
  const lists = Object.values(data)
  const reversedLists = lists.map(l => l.slice(0).reverse())

  const merged = keys.reduce((result, key, i) => {
    const list = reversedLists[i]

    list.forEach(item => {
      const { timestamp, total } = item

      if (!result[timestamp]) {
        result[timestamp] = {
          timestamp,
          liquidityUSDBInUnit: '0',
          liquidityETHInUnit: '0',
          volumeUSDBInUnit: '0',
          volumeETHInUnit: '0'
        }
      }

      const isUSDB = key.includes('usdb')
      const isLiquidity = key.includes('Liquidity')

      let inUSDB = '0'
      let inETH = '0'

      if (isUSDB) {
        inUSDB = total
        inETH = exchange({
          v: total,
          from: 'USDB',
          to: 'ETH',
          USDBBNT,
          ETHBNT,
          ETHUSDB
        })
      } else {
        inUSDB = exchange({
          v: total,
          from: 'BNT',
          to: 'USDB',
          USDBBNT,
          ETHBNT,
          ETHUSDB
        })
        inETH = exchange({
          v: total,
          from: 'BNT',
          to: 'ETH',
          USDBBNT,
          ETHBNT,
          ETHUSDB
        })
      }

      if (isLiquidity) {
        result[timestamp].liquidityUSDBInUnit = new BigNumber(result[timestamp].liquidityUSDBInUnit)
          .plus(inUSDB)
          .toString()
        result[timestamp].liquidityETHInUnit = new BigNumber(result[timestamp].liquidityETHInUnit)
          .plus(inETH)
          .toString()
      } else {
        result[timestamp].volumeUSDBInUnit = new BigNumber(result[timestamp].volumeUSDBInUnit).plus(inUSDB).toString()
        result[timestamp].volumeETHInUnit = new BigNumber(result[timestamp].volumeETHInUnit).plus(inETH).toString()
      }

      return result
    })

    return result
  }, {})

  return Object.values(merged)
}

export default transform
