import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { client } from '../../apollo/client'
import { CONVERTERS, ConvertersOld } from './queries'
import transform from './transform'
import { getBlocksByTimestamps, fetchAll } from '../utils'
import { registries } from '../addresses'
import mainConverters from '../mainConverters'

dayjs.extend(utc)
let promise

export default async ({ step = 100 }) => {
  if (promise) return promise

  promise = Promise.resolve().then(async () => {
    const utcCurrentTime = dayjs()
    const utcOneDayBack = utcCurrentTime.subtract(1, 'day')
    const timestamp = utcOneDayBack.unix()

    const [oldBlock] = await getBlocksByTimestamps({
      web3: window.web3,
      timestamps: [timestamp]
    })

    const fetchAllConverters = () => {
      return fetchAll({
        query: ({ first, skip }) => {
          return client.query({
            query: CONVERTERS,
            variables: {
              first,
              skip,
              registries: registries
            },
            fetchPolicy: 'cache-first'
          })
        },
        length: result => {
          return result.data.converters.length
        },
        merge: results => {
          return results.reduce((all, result) => {
            return all.concat(result.data.converters)
          }, [])
        },
        step
      })
    }

    const fetchAllConvertersOld = () => {
      return fetchAll({
        query: ({ first, skip }) => {
          return client.query({
            query: ConvertersOld({ btd: oldBlock }),
            variables: {
              first,
              skip,
              registries: registries
            },
            fetchPolicy: 'cache-first'
          })
        },
        length: result => {
          return result.data.converters.length
        },
        merge: results => {
          return results.reduce((all, result) => {
            return all.concat(result.data.converters)
          }, [])
        },
        step
      })
    }

    return Promise.all([fetchAllConverters(), fetchAllConvertersOld(), mainConverters()]).then(
      async ([convertersResponse, convertersOldResponse, mainConvertersResult]) => {
        const result = transform({
          response: {
            now: convertersResponse,
            aDayOld: convertersOldResponse
          },
          mainConverters: mainConvertersResult
        })

        console.log('converters', result)
        return result
      }
    )
  })

  return promise
}
