import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import BigNumber from 'bignumber.js'
import { client } from '../../apollo/client'
import Totals from './query'
import transform from './transform'
import { getBlocksByTimestamps, fetchAll } from '../utils'
import fetchConverters from '../converters'
import Web3 from '../Web3'

dayjs.extend(utc)
BigNumber.config({ EXPONENTIAL_AT: 18 })

export default async ({ step = 1000 }) => {
  const utcCurrentTime = dayjs()
  const oneDaysTimestamp = utcCurrentTime.subtract(1, 'day').unix()
  const twoDaysTimestamp = utcCurrentTime.subtract(2, 'day').unix()

  return Promise.all([
    fetchAll({
      query: ({ first, skip }) => {
        return client.query({
          query: Totals({ oneDaysTimestamp, twoDaysTimestamp }),
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
    fetchConverters({ step: 100 })
  ]).then(async ([totalsResponse, convertersResult]) => {
    const result = await transform({
      response: totalsResponse,
      converters: convertersResult
    })

    return result
  })
}
