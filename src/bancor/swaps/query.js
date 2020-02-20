import gql from 'graphql-tag'

export default ({ converterUsed, oneDaysTimestamp, twoDaysTimestamp }) => gql`
  fragment SwapInfo on Swap {
    id
    fromToken {
      symbol
      decimals
    }
    toToken {
      symbol
      decimals
    }
    trader {
      id
    }
    amountPurchased
    amountReturned
    timestamp
  }

  query swaps(
    $currentConverterRegistry_in: [String!],
    $first: Int!,
    $skip: Int!
  ) {
    swapsOneDays: swaps(
      first: $first
      skip: $skip
      orderBy: timestamp
      orderDirection: desc
      where: {
        converterUsed: "${converterUsed}"
        timestamp_gte: ${oneDaysTimestamp}
      }
    ) {
      ...SwapInfo
    }

    swapsTwoDays: swaps(
      first: $first
      skip: $skip
      orderBy: timestamp
      orderDirection: desc
      where: {
        converterUsed: "${converterUsed}"
        timestamp_lt: ${oneDaysTimestamp}
        timestamp_gte: ${twoDaysTimestamp}
      }
    ) {
      ...SwapInfo
    }
  }
`
