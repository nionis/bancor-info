import gql from 'graphql-tag'

export default ({ oneDaysTimestamp, twoDaysTimestamp }) => gql`
  query totals(
    $currentConverterRegistry_in: [String!],
    $first: Int!,
    $skip: Int!
  ) {
    swapsOneDays: swaps(
      first: $first,
      skip: $skip,
      where: {
        timestamp_gte: ${oneDaysTimestamp}
      }
    ) {
      id
    }

    swapsTwoDays: swaps(
      first: $first,
      skip: $skip,
      where: {
        timestamp_lt: ${oneDaysTimestamp}
        timestamp_gte: ${twoDaysTimestamp}
      }
    ) {
      id
    }
  }
`
