import gql from 'graphql-tag'
import { Liquidity, Volume } from '../fragments'

export default ({ blockNumber }) => gql`
  ${Liquidity}
  ${Volume}

  query chart(
    $currentConverterRegistry_in: [String!],
    $converterId: String!
  ) {
    converters(
      where: {
        currentConverterRegistry_in: $currentConverterRegistry_in
        id: $converterId
      }
      block: { number: ${blockNumber} }
    ) {
      ...Liquidity
      ...Volume
    }
  }
`
