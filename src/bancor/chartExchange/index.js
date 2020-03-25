import { client } from '../../apollo/client'
import Query from './query'
import { registries } from '../addresses'
import { getBlocksByTimestamps, timestampsFromTo, dayjs } from '../utils'
import deriveItem from '../converters/transform/deriveItem'
import toAltPrices from '../converters/transform/toAltPrices'
import toUnit from '../converters/transform/toUnit'
import fetchMainConverters from '../mainConverters'

const promises = {}

export default async ({ converterId }) => {
  if (promises[converterId]) return promises[converterId]

  promises[converterId] = Promise.resolve().then(async () => {
    const to = dayjs.utc().startOf('week')
    const from = dayjs.utc(to).subtract(1, 'month')

    const timestamps = timestampsFromTo(from, to)

    const blockNumbers = await getBlocksByTimestamps({
      timestamps
    })

    return Promise.all(
      blockNumbers.map((blockNumber, index) => {
        return client
          .query({
            query: Query({ blockNumber }),
            variables: {
              currentConverterRegistry_in: registries,
              converterId
            },
            fetchPolicy: 'cache-first'
          })
          .then(response => {
            return {
              blockNumber,
              timestamp: timestamps[index],
              converters: response.data.converters
            }
          })
      })
    ).then(async segments => {
      const mainConverters = await fetchMainConverters({ step: 100 })
      const USDBBNT = mainConverters.USDBBNT
      const ETHBNT = mainConverters.ETHBNT
      const ETHUSDB = mainConverters.ETHUSDB

      return segments.map(({ blockNumber, timestamp, converters }) => {
        const [converter] = converters
        if (!converter) return undefined

        const noTokenBalances = typeof converter.tokenBalances === 'undefined' || converter.tokenBalances.length === 0
        const noTokenSwapTotals =
          typeof converter.tokenSwapTotals === 'undefined' || converter.tokenSwapTotals.length === 0
        const noSmartToken = typeof converter.smartToken === 'undefined'
        const invalidConverter = noTokenBalances || noTokenSwapTotals || noSmartToken
        if (invalidConverter) return undefined

        const item = deriveItem({
          smartToken: converter.smartToken,
          tokenBalances: converter.tokenBalances,
          tokenSwapTotals: converter.tokenSwapTotals
        })
        item.quoteSymbol = item.quote.symbol

        const withPrices = {
          ...item,
          ...toAltPrices({
            item,
            USDBBNT,
            ETHBNT,
            ETHUSDB
          })
        }

        const withUnits = {
          ...withPrices,
          liquidityUSDBInUnit: toUnit(withPrices.liquidityUSDB, withPrices.quote.decimals),
          liquidityETHInUnit: toUnit(withPrices.liquidityETH, withPrices.quote.decimals),
          liquidityBNTInUnit: toUnit(withPrices.liquidityBNT, withPrices.quote.decimals),
          volumeUSDBInUnit: toUnit(withPrices.volumeUSDB, withPrices.quote.decimals),
          volumeETHInUnit: toUnit(withPrices.volumeETH, withPrices.quote.decimals),
          volumeBNTInUnit: toUnit(withPrices.volumeBNT, withPrices.quote.decimals)
        }

        return {
          blockNumber,
          timestamp,
          item: withUnits
        }
      })
    })
  })

  return await promises[converterId]
}
