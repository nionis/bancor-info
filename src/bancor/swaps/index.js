import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import BigNumber from 'bignumber.js'
import { client } from '../../apollo/client'
import Swaps from './query'
import { fetchAll } from '../utils'
import fetchConverters from '../converters'
import fetchMainConverters from '../mainConverters'
import { exchange } from '../converters/transform/toAltPrices'
import toUnit from '../converters/transform/toUnit'
import { tokens } from '../addresses'

dayjs.extend(utc)
BigNumber.config({ EXPONENTIAL_AT: 18 })

const promises = {}

export default async ({ step = 1000, converterUsed }) => {
  if (promises[converterUsed]) return promises[converterUsed]

  const utcCurrentTime = dayjs()
  const timestampOneDaysBack = utcCurrentTime.subtract(1, 'day').unix()
  const timestampTwoDaysBack = utcCurrentTime.subtract(2, 'day').unix()

  promises[converterUsed] = Promise.all([
    fetchAll({
      query: ({ first, skip }) => {
        return client.query({
          query: Swaps({
            converterUsed,
            oneDaysTimestamp: timestampOneDaysBack,
            twoDaysTimestamp: timestampTwoDaysBack
          }),
          variables: {
            first,
            skip
          },
          fetchPolicy: 'cache-first'
        })
      },
      length: result => {
        const oneDaysLength = result.data.swapsOneDays.length
        const twoDaysLength = result.data.swapsTwoDays.length

        if (oneDaysLength > twoDaysLength) return oneDaysLength
        return twoDaysLength
      },
      merge: results => {
        return results.reduce(
          (all, result) => {
            all.swapsOneDays = all.swapsOneDays.concat(result.data.swapsOneDays)
            all.swapsTwoDays = all.swapsTwoDays.concat(result.data.swapsTwoDays)

            return all
          },
          {
            swapsOneDays: [],
            swapsTwoDays: []
          }
        )
      },
      step
    }),
    fetchMainConverters({ step: 100 }),
    fetchConverters({ step: 100 })
  ]).then(([swaps, mainConverters, converters]) => {
    swaps.swapsOneDays = swaps.swapsOneDays.filter(swap => {
      return converters.get(`${swap.fromToken.symbol}BNT`) || converters.get(`${swap.toToken.symbol}BNT`)
    })
    swaps.swapsTwoDays = swaps.swapsTwoDays.filter(swap => {
      return converters.get(`${swap.fromToken.symbol}BNT`) || converters.get(`${swap.toToken.symbol}BNT`)
    })

    const swapsOneDaysCount = swaps.swapsOneDays.length
    const swapsTwoDaysCount = swaps.swapsTwoDays.length

    const USDBBNT = mainConverters.USDBBNT
    const ETHBNT = mainConverters.ETHBNT
    const ETHUSDB = mainConverters.ETHUSDB

    swaps.swapsOneDays = swaps.swapsOneDays.map(swap => {
      const isQuote = Object.keys(tokens).includes(swap.toToken.symbol)
      const value = swap.amountReturned

      const valueBNT = (() => {
        if (isQuote) {
          return exchange({
            USDBBNT,
            ETHBNT,
            ETHUSDB,
            v: value,
            from: swap.toToken.symbol,
            to: 'BNT'
          })
        } else {
          const converter = converters.get(`${swap.toToken.symbol}BNT`)
          return new BigNumber(value).multipliedBy(converter.price).toString()
        }
      })()

      return {
        ...swap,
        value: toUnit(
          exchange({
            USDBBNT,
            ETHBNT,
            ETHUSDB,
            v: valueBNT,
            from: 'BNT',
            to: 'USDB'
          }),
          ETHUSDB.quote.decimals
        ),
        ethAmount: toUnit(
          exchange({
            USDBBNT,
            ETHBNT,
            ETHUSDB,
            v: valueBNT,
            from: 'BNT',
            to: 'ETH'
          }),
          ETHUSDB.base.decimals
        ),
        tokenAmount: toUnit(value, swap.toToken.decimals)
      }
    })

    // get swaps 24hr
    const swaps24Hr = new BigNumber(swapsOneDaysCount).minus(swapsTwoDaysCount).toString()
    // get swaps change %
    const swapsChange24hr = new BigNumber(swapsOneDaysCount)
      .multipliedBy(100)
      .div(swapsTwoDaysCount)
      .minus(100)
      .toFixed(2)
      .toString()

    return {
      ...swaps,
      swapsOneDaysCount,
      swapsTwoDaysCount,
      swaps24Hr,
      swapsChange24hr
    }
  })

  return await promises[converterUsed]
}
