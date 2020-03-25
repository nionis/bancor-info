import BigNumber from 'bignumber.js'

BigNumber.config({ EXPONENTIAL_AT: 18 })

const deriveVolume = ({ tokenSwapTotals, base, from, to }) => {
  const volumes = tokenSwapTotals.filter(swap => {
    return swap.fromToken.id === from.address && swap.toToken.id === to.address
  })

  const totalVolume = volumes.reduce(
    (result, swap) => {
      result.totalAmountPurchased = new BigNumber(result.totalAmountPurchased)
        .plus(swap.totalAmountPurchased || '0')
        .toString()
      result.totalAmountReturned = new BigNumber(result.totalAmountReturned)
        .plus(swap.totalAmountReturned || '0')
        .toString()

      return result
    },
    {
      totalAmountPurchased: '0',
      totalAmountReturned: '0'
    }
  )

  return totalVolume
}

export default ({ base, quote, tokenSwapTotals }) => {
  const buyVolume = deriveVolume({ tokenSwapTotals, base, from: base, to: quote })
  const sellVolume = deriveVolume({ tokenSwapTotals, base, from: quote, to: base })

  const rate = new BigNumber(buyVolume.totalAmountPurchased).dividedBy(buyVolume.totalAmountReturned)
  const validRate = rate.isPositive() && !rate.isZero() && rate.isFinite()

  let volume = new BigNumber(0).plus(buyVolume.totalAmountReturned).plus(sellVolume.totalAmountPurchased)

  if (validRate) {
    volume = volume.plus(
      new BigNumber(buyVolume.totalAmountPurchased).plus(sellVolume.totalAmountReturned).dividedBy(rate)
    )
  }

  return volume.toString()
}
