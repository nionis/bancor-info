import gql from 'graphql-tag'
import { Liquidity, Volume } from '../fragments'

export const CONVERTERS = gql`
  ${Liquidity}
  ${Volume}
  query converters($first: Int!, $skip: Int!, $registries: [String!]) {
    converters(first: $first, skip: $skip, where: { currentContractRegistry_in: $registries }) {
      ...Liquidity
      ...Volume
    }
  }
`

export const ConvertersOld = ({ btd }) => gql`
  ${Liquidity}
  ${Volume}
  query converters($first: Int!, $skip: Int!, $registries: [String!]) {
    converters(first: $first, skip: $skip, where: { currentContractRegistry_in: $registries }, block: { number: ${btd} }) {
      ...Liquidity
      ...Volume
    }
  }
`
