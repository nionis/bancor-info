import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import BigNumber from 'bignumber.js'
import { tokens } from './addresses'

dayjs.extend(utc)

export { dayjs }

export const toUniswap = map => {
  const bntOnly = Array.from(map.values()).filter(item => {
    return item.quote === tokens.BNT
  })

  const x = bntOnly.reduce((result, item) => {
    const USDB = map.get(`${item.baseSymbol}USDB`) || {}
    const preferUSDB = new BigNumber(USDB.liquidityBNTInUnit).gt(item.liquidityBNTInUnit)
    const preferred = preferUSDB ? USDB : item

    if (new BigNumber(preferred.liquidity).isZero()) {
      return result
    }

    result.push({
      id: preferred.base,
      tokenAddress: preferred.base,
      tokenName: preferred.baseName,
      tokenSymbol: preferred.baseSymbol,
      tokenDecimals: preferred.baseDecimals,
      price: preferred.priceETH,
      priceUSD: USDB.priceUSDB || preferred.priceUSDB,
      ethBalance: preferred.liquidityETHInUnit,
      tradeVolumeEth: preferred.volumeETHInUnit,
      tradeVolumeToken: '0',
      tradeVolumeUSD: USDB.volumeUSDBInUnit || preferred.volumeUSDBInUnit,
      volume24HrInUnit: preferred.volume24HrInUnit,
      tokenBalance: preferred.baseLiquidityInUnit,
      totalTxsCount: '0'
    })

    return result
  }, [])

  return x
}

const getBlockNumber = web3 => {
  return new Promise((resolve, reject) => {
    web3.eth.getBlockNumber((error, result) => {
      if (error) return reject(error)
      return resolve(result)
    })
  })
}

const getBlock = (web3, blockNumber) => {
  return new Promise((resolve, reject) => {
    web3.eth.getBlock(blockNumber, (error, result) => {
      if (error) return reject(error)
      return resolve(result)
    })
  })
}

export const getBlocksByTimestamps = async ({ web3, timestamps }) => {
  // decreasing average block size will decrease precision and also
  // decrease the amount of requests made in order to find the closest
  // block
  let averageBlockTime = 17 * 1.5

  // get current block number
  const currentBlockNumber = await getBlockNumber(web3)
  const currentBlock = await getBlock(web3, currentBlockNumber)

  return timestamps.map(timestamp => {
    if (timestamp > currentBlock.timestamp) return currentBlock
    const decreaseBlocks = parseInt((currentBlock.timestamp - timestamp) / averageBlockTime)

    return currentBlockNumber - decreaseBlocks
  })
}

export const fetchAll = async ({ query, length, merge, step = 200, ...rest }) => {
  let first = step
  let skip = 0
  let fetching = true
  let results = []

  while (fetching) {
    const result = await query({
      first,
      skip,
      ...rest
    })

    results.push(result)

    skip = skip + step

    if (length(result) < step) {
      fetching = false
    }
  }

  return merge(results)
}

export const timestampsFromTo = (from, to) => {
  const end = to
  const start = from
  let cursor = end

  let timestamps = []

  while (cursor.subtract(1, 'week').isAfter(start)) {
    timestamps.push(cursor.unix())

    cursor = cursor.subtract(1, 'week')
  }

  return timestamps
}
