import BigNumber from 'bignumber.js'
import toUnit from './toUnit'

BigNumber.config({ EXPONENTIAL_AT: 18 })

export default ({ base, quote }) => {
  const price = new BigNumber(toUnit(quote.balance, quote.decimals)).div(toUnit(base.balance, base.decimals))

  if (price.isNaN()) return '0'
  return price.toString()
}
