import deriveItem from '../../converters/transform/deriveItem'
import toAltPrices from '../../converters/transform/toAltPrices'

export default async ({ USDBBNT: USDBBNT_data, ETHBNT: ETHBNT_data, ETHUSDB: ETHUSDB_data }) => {
  const USDBBNT = deriveItem({
    smartToken: USDBBNT_data[0].smartToken,
    tokenBalances: USDBBNT_data[0].tokenBalances,
    tokenSwapTotals: USDBBNT_data[0].tokenSwapTotals
  })
  USDBBNT.quoteSymbol = USDBBNT.quote.symbol

  const ETHBNT = deriveItem({
    smartToken: ETHBNT_data[0].smartToken,
    tokenBalances: ETHBNT_data[0].tokenBalances,
    tokenSwapTotals: ETHBNT_data[0].tokenSwapTotals
  })
  ETHBNT.quoteSymbol = ETHBNT.quote.symbol

  const ETHUSDB = deriveItem({
    smartToken: ETHUSDB_data[0].smartToken,
    tokenBalances: ETHUSDB_data[0].tokenBalances,
    tokenSwapTotals: ETHUSDB_data[0].tokenSwapTotals
  })
  ETHUSDB.quoteSymbol = ETHUSDB.quote.symbol

  return {
    USDBBNT: {
      id: USDBBNT_data[0].id,
      ...USDBBNT,
      ...toAltPrices({
        item: USDBBNT,
        USDBBNT,
        ETHBNT,
        ETHUSDB
      })
    },
    ETHBNT: {
      id: ETHBNT_data[0].id,
      ...ETHBNT,
      ...toAltPrices({
        item: ETHBNT,
        USDBBNT,
        ETHBNT,
        ETHUSDB
      })
    },
    ETHUSDB: {
      id: ETHUSDB_data[0].id,
      ...ETHUSDB,
      ...toAltPrices({
        item: ETHUSDB,
        USDBBNT,
        ETHBNT,
        ETHUSDB
      })
    }
  }
}
