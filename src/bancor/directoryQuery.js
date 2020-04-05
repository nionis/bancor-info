export const directoryQuery = map => {
  const exchanges = Array.from(map.values()).reduce((result, item) => {
    const data = {
      id: item.id,
      tokenSymbol: item.baseSymbol,
      tokenName: item.baseName,
      tokenDecimals: item.baseDecimals,
      tokenAddress: item.base,
      ethBalance: item.liquidityETHInUnit,
      poolSymbol: item.quoteSymbol,
      poolName: item.quoteName,
      poolDecimals: item.quoteDecimals,
      poolAddress: item.quote,
      index: item.index
    }

    result[data.id] = data

    return result
  }, {})

  return {
    data: {
      exchanges: Object.values(exchanges)
    }
  }
}
