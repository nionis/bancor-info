import BigNumber from 'bignumber.js'
import toUnit from '../../converters/transform/toUnit'

BigNumber.config({ EXPONENTIAL_AT: 18 })

const deriveTotals = converters => {
  const convertersList = Array.from(converters.values())
  const keys = ['liquidity', 'volume', 'oldLiquidity', 'oldVolume']
  const currencies = ['USDB', 'ETH', 'BNT']

  const totals = convertersList.reduce((result, converter) => {
    keys.forEach(key => {
      currencies.forEach(currency => {
        const k = `${key}${currency}`
        if (typeof result[k] === 'undefined') {
          result[k] = new BigNumber(0).toString()
        }

        // ignore pseudo converters
        if (converter.isOnlyToken) return

        result[k] = new BigNumber(result[k]).plus(converter[k]).toString()
      })
    })

    return result
  }, {})

  return totals
}

export default async ({ response, converters }) => {
  const totals = deriveTotals(converters)

  // VOLUME
  const volume24hrUSDB = new BigNumber(totals.volumeUSDB).minus(totals.oldVolumeUSDB).toString()
  const volume24hrUSDBInUnit = toUnit(volume24hrUSDB, 18)
  const volume24hrETH = new BigNumber(totals.volumeETH).minus(totals.oldVolumeETH).toString()
  const volume24hrETHInUnit = toUnit(volume24hrETH, 18)
  const volume24hrBNT = new BigNumber(totals.volumeBNT).minus(totals.oldVolumeBNT).toString()
  const volume24hrBNTInUnit = toUnit(volume24hrBNT, 18)

  // get volume change %
  const volumeChange24hr = new BigNumber(totals.volumeUSDB)
    .multipliedBy(100)
    .div(totals.oldVolumeUSDB)
    .minus(100)
    .toFixed(2)
    .toString()

  // LIQUIDITY
  const liquidityUSDBInUnit = toUnit(totals.liquidityUSDB, 18)
  const liquidityETHInUnit = toUnit(totals.liquidityETH, 18)
  const liquidityBNTInUnit = toUnit(totals.liquidityBNT, 18)

  // get volume change %
  const liquidityChange24hr = new BigNumber(totals.liquidityUSDB)
    .multipliedBy(100)
    .div(totals.oldLiquidityUSDB)
    .minus(100)
    .toFixed(2)
    .toString()

  // TXS
  const txs = response.swapsOneDays.length
  const txsOld = response.swapsTwoDays.length
  const txs24hr = txs - txsOld

  // get txs change %
  const txsChange24hr = new BigNumber(txs)
    .multipliedBy(100)
    .div(txsOld)
    .minus(100)
    .toFixed(2)
    .toString()

  return {
    volume24hrBNT,
    volume24hrBNTInUnit,
    volume24hrUSDB,
    volume24hrUSDBInUnit,
    volume24hrETH,
    volume24hrETHInUnit,
    txs,
    txsOld,
    txs24hr,
    volumeChange24hr,
    txsChange24hr,
    liquidityUSDB: totals.liquidityUSDB,
    liquidityETH: totals.liquidityETH,
    liquidityBNT: totals.liquidityBNT,
    liquidityUSDBInUnit,
    liquidityETHInUnit,
    liquidityBNTInUnit,
    liquidityChange24hr
  }
}
