import { getBlocksByTimestamps } from './utils'

export const ticker24HourVars = async ({ web3, exchangeAddr, timestamp }) => {
  const [blockNumber] = await getBlocksByTimestamps({ web3, timestamps: [timestamp] })

  return {
    exchangeAddr,
    blockNumber
  }
}

export const ticker24HourQuery = (result, timestamp) => {
  try {
    // const data = extractTokenData(result.data.token)

    result.data.exchangeHistoricalDatas = []
    // result.data.exchangeHistoricalDatas = [
    //   {
    //     id: data.id,
    //     timestamp,
    //     exchangeAddress: data.id,
    //     tradeVolumeEth: data.tradeVolumeEth,
    //     tradeVolumeToken: data.tradeVolumeToken,
    //     tradeVolumeUSD: data.tradeVolumeUSD,
    //     tokenPriceUSD: data.priceUSD,
    //     price: data.price,
    //     ethBalance: data.ethBalance,
    //     totalTxsCount: data.totalTxsCount
    //   }
    // ]
  } catch (error) {
    console.error(error)
    result.data.exchangeHistoricalDatas = []
  }

  return result
}
