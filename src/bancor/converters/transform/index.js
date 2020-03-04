import BigNumber from 'bignumber.js'
import toUnit from './toUnit'
import toAltPrices from './toAltPrices'
import deriveItem from './deriveItem'
import { tokens } from '../../addresses'

const mergeConverters = (now, aDayOld) => {
  return now.map(converter => {
    const oldConverter = aDayOld.find(c => c.id === converter.id)

    converter.oldTokenBalances = oldConverter ? oldConverter.tokenBalances : []
    converter.oldTokenSwapTotals = oldConverter ? oldConverter.tokenSwapTotals : []

    return converter
  })
}

const deriveItems = converters => {
  return converters.reduce((result, converter) => {
    const noTokenBalances = converter.tokenBalances.length === 0 || converter.oldTokenBalances.length === 0
    const noTokenSwapTotals = converter.tokenSwapTotals.length === 0 || converter.oldTokenSwapTotals.length === 0
    const noSmartToken = typeof converter.smartToken === 'undefined'
    const invalidConverter = noTokenBalances || noTokenSwapTotals || noSmartToken

    if (invalidConverter) return result

    const { smartToken, tokenBalances, oldTokenBalances, tokenSwapTotals, oldTokenSwapTotals } = converter

    const derivedItems = deriveItem({
      smartToken,
      tokenBalances,
      tokenSwapTotals
    })
    if (!deriveItems) return result

    const derivedOldItems = deriveItem({
      smartToken,
      tokenBalances: oldTokenBalances,
      tokenSwapTotals: oldTokenSwapTotals
    })
    if (!derivedOldItems) return result

    const { base, quote, liquidity, volume, price } = derivedItems

    if (![tokens.BNT, tokens.USDB].includes(quote.address)) return result

    const { liquidity: oldLiquidity, volume: oldVolume, price: oldPrice } = derivedOldItems

    // get liquidity 24hr
    const liquidity24Hr = new BigNumber(liquidity).minus(oldLiquidity).toString()
    // get liquidity change %
    const liquidityChange24hr = new BigNumber(liquidity)
      .multipliedBy(100)
      .div(oldLiquidity)
      .minus(100)
      .toFixed(2)
      .toString()

    // get volume 24hr
    const volume24Hr = new BigNumber(volume).minus(oldVolume).toString()
    // get volume change %
    const volumeChange24hr = new BigNumber(volume)
      .multipliedBy(100)
      .div(oldVolume)
      .minus(100)
      .toFixed(2)
      .toString()

    // get price change %
    const priceChange24hr = new BigNumber(price)
      .multipliedBy(100)
      .div(oldPrice)
      .minus(100)
      .toFixed(2)
      .toString()

    // update result
    const item = {
      id: converter.id,
      base: base.address,
      baseSymbol: base.symbol,
      baseName: base.name,
      baseLiquidity: base.balance,
      baseDecimals: base.decimals,
      baseIsUSDB: base.isUSDB,
      baseIsETH: base.isETH,
      baseIsBNT: base.isBNT,
      quote: quote.address,
      quoteSymbol: quote.symbol,
      quoteName: quote.name,
      quoteLiquidity: quote.balance,
      quoteDecimals: quote.decimals,
      quoteIsUSDB: quote.isUSDB,
      quoteIsETH: quote.isETH,
      quoteIsBNT: quote.isBNT,
      pair: `${base.symbol}${quote.symbol}`,
      price,
      oldPrice,
      liquidity,
      oldLiquidity,
      volume,
      oldVolume,
      volume24Hr,
      volumeChange24hr,
      priceChange24hr,
      liquidity24Hr,
      liquidityChange24hr
    }

    // if duplicate is found, pick one with highest liquidity
    if (result.has(item.pair)) {
      const current = result.get(item.pair)

      if (new BigNumber(current.liquidity).gt(item.liquidity)) {
        return result
      }
    }

    // if no price don't add
    if (new BigNumber(item.price).isZero()) {
      return result
    }

    result.set(item.pair, item)

    return result
  }, new Map())
}

const addExtra = (map, mainConverters) => {
  const USDBBNT = mainConverters.USDBBNT
  const ETHBNT = mainConverters.ETHBNT
  const ETHUSDB = mainConverters.ETHUSDB

  return Array.from(map.values()).reduce((result, item) => {
    // add prices
    const withPrices = {
      ...item,
      ...toAltPrices({
        USDBBNT,
        ETHBNT,
        ETHUSDB,
        item
      })
    }

    // add units
    const withUnits = {
      ...withPrices,
      liquidityUSDBInUnit: toUnit(withPrices.liquidityUSDB, withPrices.quoteDecimals),
      liquidityETHInUnit: toUnit(withPrices.liquidityETH, withPrices.quoteDecimals),
      liquidityBNTInUnit: toUnit(withPrices.liquidityBNT, withPrices.quoteDecimals),
      volumeUSDBInUnit: toUnit(withPrices.volumeUSDB, withPrices.quoteDecimals),
      volumeETHInUnit: toUnit(withPrices.volumeETH, withPrices.quoteDecimals),
      volumeBNTInUnit: toUnit(withPrices.volumeBNT, withPrices.quoteDecimals),
      volume24HrUSDBInUnit: toUnit(withPrices.volume24HrUSDB, withPrices.quoteDecimals),
      volume24HrETHInUnit: toUnit(withPrices.volume24HrETH, withPrices.quoteDecimals),
      volume24HrBNTInUnit: toUnit(withPrices.volume24HrBNT, withPrices.quoteDecimals),
      quoteLiquidityInUnit: toUnit(withPrices.quoteLiquidity, withPrices.quoteDecimals),
      baseLiquidityInUnit: toUnit(withPrices.baseLiquidity, withPrices.baseDecimals)
    }

    result.set(withUnits.pair, withUnits)

    return result
  }, new Map())
}

const transform = ({ response, mainConverters }) => {
  // merge new and old data
  const converters = mergeConverters(response.now, response.aDayOld)

  // map by converter id
  const items = addExtra(deriveItems(converters), mainConverters)

  return items
}

export default transform
