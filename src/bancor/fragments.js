import gql from 'graphql-tag'

export const Liquidity = gql`
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
`

export const Volume = gql`
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
`
