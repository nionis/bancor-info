import gql from 'graphql-tag'

export default ({ oneDaysBlock, twoDaysBlock }) => gql`
  query totals(
    $currentConverterRegistry_in: [String!],
    $first: Int!,
    $skip: Int!
  ) {
    transactionsOneDays: transactions(
      first: $first,
      skip: $skip,
      where: {
        blockNumber_gte: ${oneDaysBlock}
      }
    ) {
      id
    }

    transactionsTwoDays: transactions(
      first: $first,
      skip: $skip,
      where: {
        blockNumber_lt: ${oneDaysBlock}
        blockNumber_gte: ${twoDaysBlock}
      }
    ) {
      id
    }
  }
`
