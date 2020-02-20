import { toUniswap } from './utils'

export const overviewPageQuery = map => {
  const exchanges = toUniswap(map)

  return {
    data: {
      exchanges
    }
  }
}
