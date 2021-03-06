import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { hardcodedExchanges } from '../constants/exchanges'
import TokenLogo from '../components/TokenLogo'
import { directoryQuery } from '../bancor'
import fetchConverters from '../bancor/converters'

const StyledTokenLogo = styled(TokenLogo)`
  margin-left: 0;
  margin-right: 1rem;
  height: 34px;
  width: 34px;
  border-radius: 50%;
  border: 2px solid white;
  background-color: white;
  display: flex;
  align-itmes: center;
  justify-content: center;
`

export function useAllExchanges() {
  const [exchanges, setExchanges] = useState([])

  useEffect(() => {
    const fetchAllExchanges = async function() {
      let exchanges = {}
      let data = []
      try {
        const result = await fetchConverters({
          step: 100
        }).then(directoryQuery)

        data = result.data.exchanges
      } catch (err) {
        console.log('error: ', err)
      }
      data.forEach(exchange => {
        if (exchange.tokenAddress === '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359') {
          exchange.tokenSymbol = 'SAI'
        }
        if (exchange.tokenAddress === '0xf5dce57282a584d2746faf1593d3121fcac444dc') {
          exchange.tokenSymbol = 'cSAI'
          exchange.tokenName = 'Compound SAI'
        }
        exchange.label = buildDirectoryLabel(exchange)
        const logo = <TokenLogo address={exchange.tokenAddress} style={{ height: '20px', width: '20px' }} />
        const logoStyled = <StyledTokenLogo address={exchange.tokenAddress} header={true} size={30} />
        exchange.logo = logo
        exchange.logoStyled = logoStyled
        exchanges[exchange.id] = exchange
      })
      setExchanges(exchanges)
    }
    fetchAllExchanges()
  }, [])
  return exchanges
}

// build the label for dropdown
const buildDirectoryLabel = exchange => {
  let { id, tokenAddress, tokenSymbol, poolSymbol, index } = exchange
  const exchangeAddress = id

  // custom handling for UI
  if (tokenSymbol === null) {
    if (hardcodedExchanges.hasOwnProperty(exchangeAddress.toUpperCase())) {
      tokenSymbol = hardcodedExchanges[exchangeAddress.toUpperCase()].symbol
    } else {
      tokenSymbol = 'unknown'
    }
  }

  let label = `${tokenSymbol}:${poolSymbol}`
  if (index > 0) {
    label = `${label}:${index + 1}`
  }

  return {
    label,
    value: exchangeAddress,
    tokenAddress: tokenAddress
  }
}
