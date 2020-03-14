import fetcher from './fetcher'
import transform from './transform'
import fetchMainConverters from '../mainConverters'

let promise

export default async () => {
  if (promise) return promise

  promise = Promise.all([
    fetchMainConverters(),
    fetcher({
      currency: 'bnt',
      type: 'liquidity'
    }),
    fetcher({
      currency: 'usdb',
      type: 'liquidity'
    }),
    fetcher({
      currency: 'bnt',
      type: 'total_volume'
    }),
    fetcher({
      currency: 'usdb',
      type: 'total_volume'
    })
  ])
    .then(results => {
      const mainConverters = results[0]

      const datapoints = {
        bntLiquidity: {
          currency: 'bnt',
          type: 'liquidity',
          data: results[1]
        },
        usdbLiquidity: {
          currency: 'usdb',
          type: 'liquidity',
          data: results[2]
        },
        bntVolume: {
          currency: 'bnt',
          type: 'volume',
          data: results[3]
        },
        usdbVolume: {
          currency: 'usdb',
          type: 'volume',
          data: results[4]
        }
      }

      return {
        mainConverters,
        datapoints
      }
    })
    .then(transform)

  return promise
}
