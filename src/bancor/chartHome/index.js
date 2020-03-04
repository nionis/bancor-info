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

      const data = {
        bntLiquidity: results[1],
        usdbLiquidity: results[2],
        bntTotal_volume: results[3],
        usdbTotal_volume: results[4]
      }

      return {
        mainConverters,
        data
      }
    })
    .then(transform)

  return promise
}
