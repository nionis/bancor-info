import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { infuraKey } from '../constants/credentials'
import { isAddress } from '../helpers'

dayjs.extend(utc)

export { dayjs }
export const hexToNumber = str => parseInt(str, 16)
export const numberToHex = n => `0x${n.toString(16)}`

export const getBlockNumber = async () => {
  return fetch(`https://mainnet.infura.io/v3/${infuraKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_blockNumber', params: [] })
  })
    .then(res => res.json())
    .then(res => {
      return hexToNumber(res.result)
    })
}

export const getBlock = async blockNumber => {
  return fetch(`https://mainnet.infura.io/v3/${infuraKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_getBlockByNumber',
      params: [numberToHex(blockNumber), true],
      id: 1
    })
  })
    .then(res => res.json())
    .then(res => {
      return {
        hash: res.result.hash,
        number: hexToNumber(res.result.number),
        timestamp: hexToNumber(res.result.timestamp)
      }
    })
}

export const getBlocksByTimestamps = async ({ timestamps }) => {
  // decreasing average block size will decrease precision and also
  // decrease the amount of requests made in order to find the closest
  // block
  let averageBlockTime = 17 * 1.5

  // get current block number
  const currentBlockNumber = await getBlockNumber()
  const currentBlock = await getBlock(currentBlockNumber, currentBlockNumber)

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

export const getTokenLogo = ({ address, blockchain = 'ethereum' }) => {
  address = isAddress(address)
  blockchain = blockchain.toLowerCase()

  return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${blockchain}/assets/${address}/logo.png`
}
