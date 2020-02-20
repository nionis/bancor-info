import { tokens } from '../../addresses'

const { USDB, ETH, BNT } = tokens

export default ({ tokenBalances, smartToken }) => {
  const tokens = []

  // get price, liquidity
  tokenBalances.forEach(tokenBalance => {
    const address = tokenBalance.token.id

    // skip converter's smart token
    if (address === smartToken.id) {
      return
    }

    // set values
    const balance = tokenBalance.balance
    const name = tokenBalance.token.name
    const symbol = tokenBalance.token.symbol
    const decimals = tokenBalance.token.decimals
    const isUSDB = address === USDB
    const isETH = address === ETH
    const isBNT = address === BNT

    // must include these keys
    if ([name, symbol].every(v => !!v)) {
      tokens.push({
        address,
        symbol,
        name,
        balance,
        decimals,
        isUSDB,
        isETH,
        isBNT
      })
    }
  })

  return tokens
}
