import { getWeb3 } from '../helpers'

let web3

export default () => {
  if (!web3) {
    web3 = getWeb3()
  }

  return web3
}
