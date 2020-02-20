import BigNumber from 'bignumber.js'
import { tokens } from '../../addresses'

BigNumber.config({ EXPONENTIAL_AT: 18 })

export const USDBToETH = (v, p) => new BigNumber(v).dividedBy(p).toString()
export const USDBToBNT = (v, p) => new BigNumber(v).multipliedBy(p).toString()
export const USDBToUSDB = (v, p) => v
export const ETHToUSDB = (v, p) => new BigNumber(v).multipliedBy(p).toString()
export const ETHToBNT = (v, p) => new BigNumber(v).multipliedBy(p).toString()
export const ETHToETH = (v, p) => v
export const BNTToUSDB = (v, p) => new BigNumber(v).dividedBy(p).toString()
export const BNTToETH = (v, p) => new BigNumber(v).dividedBy(p).toString()
export const BNTToBNT = (v, p) => v

export const exchange = ({ v, USDBBNT, ETHBNT, ETHUSDB, from, to }) => {
  if (from === 'USDB') {
    if (to === 'ETH') {
      return USDBToETH(v, ETHUSDB.price)
    } else if (to === 'BNT') {
      return USDBToBNT(v, USDBBNT.price)
    } else {
      return USDBToUSDB(v)
    }
  } else if (from === 'ETH') {
    if (to === 'USDB') {
      return ETHToUSDB(v, ETHUSDB.price)
    } else if (to === 'BNT') {
      return ETHToBNT(v, ETHBNT.price)
    } else {
      return ETHToETH(v)
    }
  } else if (from === 'BNT') {
    if (to === 'USDB') {
      return BNTToUSDB(v, USDBBNT.price)
    } else if (to === 'ETH') {
      return BNTToETH(v, ETHBNT.price)
    } else {
      return BNTToBNT(v)
    }
  }
}

export default ({ USDBBNT, ETHBNT, ETHUSDB, item }) => {
  const { quoteSymbol } = item

  const keys = ['price', 'liquidity', 'volume', 'volume24Hr', 'oldPrice', 'oldLiquidity', 'oldVolume']

  return Object.keys(tokens).reduce((result, currency) => {
    keys.forEach(key => {
      const v = item[key]
      if (typeof v === 'undefined') return

      result[`${key}${currency}`] = exchange({
        v: item[key],
        USDBBNT,
        ETHBNT,
        ETHUSDB,
        from: quoteSymbol,
        to: currency
      })
    })

    return result
  }, {})
}
