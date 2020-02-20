import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import BigNumber from 'bignumber.js'
import { client } from '../../apollo/client'
import Totals from './query'
import transform from './transform'
import { getBlocksByTimestamps, fetchAll } from '../utils'
import fetchConverters from '../converters'

dayjs.extend(utc)
BigNumber.config({ EXPONENTIAL_AT: 18 })

export default async ({ step = 1000 }) => {
  const utcCurrentTime = dayjs()
  const utcOneDaysBack = utcCurrentTime.subtract(1, 'day')
  const utcTwoDaysBack = utcCurrentTime.subtract(2, 'day')

  const timestampOneDaysBack = utcOneDaysBack.unix()
  const timestampTwoDaysBack = utcTwoDaysBack.unix()

  const [oneDaysBlock, twoDaysBlock] = await getBlocksByTimestamps({
    web3: window.web3,
    timestamps: [timestampOneDaysBack, timestampTwoDaysBack]
  })

  return Promise.all([
    fetchAll({
      query: ({ first, skip }) => {
        return client.query({
          query: Totals({ oneDaysBlock, twoDaysBlock }),
          variables: {
            first,
            skip
          },
          fetchPolicy: 'cache-first'
        })
      },
      length: result => {
        const oneDaysLength = result.data.transactionsOneDays.length
        const twoDaysLength = result.data.transactionsTwoDays.length

        if (oneDaysLength > twoDaysLength) return oneDaysLength
        return twoDaysLength
      },
      merge: results => {
        return results.reduce(
          (all, result) => {
            all.transactionsOneDays = all.transactionsOneDays.concat(result.data.transactionsOneDays)
            all.transactionsTwoDays = all.transactionsTwoDays.concat(result.data.transactionsTwoDays)

            return all
          },
          {
            transactionsOneDays: [],
            transactionsTwoDays: []
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
