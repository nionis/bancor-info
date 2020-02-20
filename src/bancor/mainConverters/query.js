import gql from 'graphql-tag'

export default gql`
  fragment Liquidity on Converter {
    id
    smartToken {
      id
      symbol
      name
      decimals
    }
    tokenBalances {
      token {
        id
        symbol
        name
        decimals
      }
      balance
    }
  }

  fragment Volume on Converter {
    id
    tokenSwapTotals {
      fromToken {
        id
      }
      toToken {
        id
      }
      totalAmountPurchased
      totalAmountReturned
    }
  }

  query converters($currentConverterRegistry_in: [String!], $USDBBNT: String!, $ETHBNT: String!, $ETHUSDB: String!) {
    USDBBNT: converters(where: { currentConverterRegistry_in: $currentConverterRegistry_in, id: $USDBBNT }) {
      ...Liquidity
      ...Volume
    }

    ETHBNT: converters(where: { currentConverterRegistry_in: $currentConverterRegistry_in, id: $ETHBNT }) {
      ...Liquidity
      ...Volume
    }

    ETHUSDB: converters(where: { currentConverterRegistry_in: $currentConverterRegistry_in, id: $ETHUSDB }) {
      ...Liquidity
      ...Volume
    }
  }
`
