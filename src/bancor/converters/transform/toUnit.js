import BigNumber from 'bignumber.js'

BigNumber.config({ EXPONENTIAL_AT: 18 })

export default (amount, decimals) => {
  decimals = typeof decimals === 'undefined' ? 18 : decimals

  return new BigNumber(amount).dividedBy(new BigNumber(10).exponentiatedBy(decimals)).toString()
}
