import BigNumber from 'bignumber.js'
import { exchange } from '../converters/transform/toAltPrices'

const dataToTotal = data => {
  const currencies = Object.keys(data).filter(key => key !== 'timestamp')

  return data.timestamp.reduce((result, timestamp, index) => {
    currencies.forEach(currency => {
      if (!result[timestamp]) {
        result[timestamp] = '0'
      }

      result[timestamp] = new BigNumber(result[timestamp]).plus(data[currency][index]).toString()
    })

    return result
  }, {})
}

const transform = ({ mainConverters, datapoints }) => {
  const USDBBNT = mainConverters.USDBBNT
  const ETHBNT = mainConverters.ETHBNT
  const ETHUSDB = mainConverters.ETHUSDB

  // turn to totals
  const totalsByDatapoint = Object.entries(datapoints).reduce((result, [name, datapoint]) => {
    result[name] = {
      ...datapoint,
      data: dataToTotal(datapoint.data)
    }
    return result
  }, {})

  const totals = Object.values(totalsByDatapoint).reduce((result, o) => {
    const isUSDB = o.currency === 'usdb'
    const isLiquidity = o.type === 'liquidity'

    Object.entries(o.data).forEach(([timestamp, total]) => {
      // multiply liquidity to match our owns
      // @TODO: use proper API to get matched results
      total = new BigNumber(total).multipliedBy(1.63).toString()

      let inUSDB = '0'
      let inETH = '0'

      if (!result[timestamp]) {
        result[timestamp] = {
          liquidityUSDBInUnit: '0',
          liquidityETHInUnit: '0',
          volumeUSDBInUnit: '0',
          volumeETHInUnit: '0'
        }
      }

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
    })

    return result
  }, {})

  return totals
}

export default transform
