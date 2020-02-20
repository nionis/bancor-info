export default ({ tokens, smartToken }) => {
  const smartTokenSymbol = smartToken.symbol.replace(new RegExp('[^A-Za-z0-9]+', 'gi'), '')

  const [tokenA, tokenB] = tokens
  const [base, quote] = smartTokenSymbol === `${tokenA.symbol}${tokenB.symbol}` ? [tokenA, tokenB] : [tokenB, tokenA]

  return {
    base,
    quote,
    smartTokenSymbol
  }
}
