import BigNumber from 'bignumber.js'

BigNumber.config({ EXPONENTIAL_AT: 18 })

export default ({ quote }) => {
  return new BigNumber(quote.balance).multipliedBy(2).toString()
}
