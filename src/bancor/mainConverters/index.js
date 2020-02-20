import { client } from '../../apollo/client'
import QUERY from './query'
import transform from './transform'
import { registries } from '../addresses'

let promise

export default async () => {
  if (promise) return promise

  const USDBBNT_converter = '0xe03374cacf4600f56bddbdc82c07b375f318fc5c'
  const ETHBNT_converter = '0xd3ec78814966ca1eb4c923af4da86bf7e6c743ba'
  const ETHUSDB_converter = '0x886f00bc5feb7ec1b1c18441c4dc6dcd341d0e69'

  promise = client
    .query({
      query: QUERY,
      variables: {
        currentConverterRegistry_in: registries,
        USDBBNT: USDBBNT_converter,
        ETHBNT: ETHBNT_converter,
        ETHUSDB: ETHUSDB_converter
      },
      fetchPolicy: 'cache-first'
    })
    .then(response => {
      return response.data
    })
    .then(async data => {
      const result = await transform(data)

      return result
    })

  return promise
}
