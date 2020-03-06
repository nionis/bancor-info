import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { client } from '../../apollo/client'
import { CONVERTERS, ConvertersOld } from './queries'
import transform from './transform'
import { getBlocksByTimestamps, fetchAll } from '../utils'
import { registries } from '../addresses'
import fetchMainConverters from '../mainConverters'
import fetchExternalTokens from '../externalTokens'
import Web3 from '../Web3'

dayjs.extend(utc)
let promise

export default async ({ step = 100 }) => {
  if (promise) return promise

  promise = Promise.resolve().then(async () => {
    const utcCurrentTime = dayjs()
    const utcOneDayBack = utcCurrentTime.subtract(1, 'day')
    const timestamp = utcOneDayBack.unix()

    const [oldBlock] = await getBlocksByTimestamps({
      web3: Web3(),
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

    return Promise.all([
      fetchAllConverters(),
      fetchAllConvertersOld(),
      fetchExternalTokens(),
      fetchMainConverters()
    ]).then(async ([convertersResponse, convertersOldResponse, externalTokens, mainConvertersResult]) => {
      const result = transform({
        response: {
          now: convertersResponse,
          aDayOld: convertersOldResponse
        },
        mainConverters: mainConvertersResult
      })

      return new Map([...result, ...externalTokens])
    })
  })

  return promise
}
