import BigNumber from 'bignumber.js'
import getPair from './getPair'
import getPrice from './getPrice'
import getTokens from './getTokens'
import getVolume from './getVolume'
import getLiquidity from './getLiquidity'

const deriveItem = ({ smartToken, tokenBalances, tokenSwapTotals }) => {
  const tokens = getTokens({ tokenBalances, smartToken })

  if (tokens.length < 2) {
    return undefined
  }

  const { base, quote } = getPair({ tokens, smartToken })

  // get liquidity
  const liquidity = getLiquidity({ quote })
  if (new BigNumber(liquidity).isZero()) {
    return undefined
  }

  // get volume
  const volume = getVolume({ base, quote, tokenSwapTotals })

  // get price
  const price = getPrice({ base, quote })

  return {
    tokens,
    base,
    quote,
    liquidity,
    volume,
    price
  }
}

export default deriveItem
