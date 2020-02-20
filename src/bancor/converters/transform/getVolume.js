import BigNumber from 'bignumber.js'

BigNumber.config({ EXPONENTIAL_AT: 18 })

export default ({ base, quote, tokenSwapTotals }) => {
  const buy =
    tokenSwapTotals.find(swap => {
      return swap.fromToken.id === base.address && swap.toToken.id === quote.address
    }) || {}

  const sell =
    tokenSwapTotals.find(swap => {
      return swap.fromToken.id === quote.address && swap.toToken.id === base.address
    }) || {}

  const volume = new BigNumber(buy.totalAmountPurchased || '0')
    .plus(buy.totalAmountReturned || '0')
    .plus(sell.totalAmountPurchased || '0')
    .plus(sell.totalAmountReturned || '0')
    .div(2)
    .toString()

  return volume
}
