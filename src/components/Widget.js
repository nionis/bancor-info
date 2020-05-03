import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import BancorConversionWidget from 'bancor-conversion-widget'
import SvelteComponent from './SvelteComponent'
import Dexes from './Dexes'
import ErrorBoundary from './ErrorBoundary'
import { getCountryCode } from '../bancor/utils'
import { blacklistedCountryCodes, blacklistedCountryCodeMsg } from '../bancor/constants'

const Container = styled.div`
  display: flex;
`

const MessageContainer = styled.div`
  display: flex;
  background: white;
  text-align: center;
  padding: 50px;
  width: 200px;
`

const Widget = props => {
  const [countryCode, setCountryCode] = useState(undefined)

  useEffect(() => {
    async function updateCountryCode() {
      const response = await getCountryCode()
      setCountryCode(response.countryCode)
    }

    updateCountryCode()
  }, [])

  const isBlacklisted = !countryCode ? false : blacklistedCountryCodes.includes(countryCode)

  return (
    <ErrorBoundary>
      <Container>
        {isBlacklisted ? (
          <MessageContainer>
            <p>{blacklistedCountryCodeMsg}</p>
          </MessageContainer>
        ) : (
          <SvelteComponent this={BancorConversionWidget} {...props} />
        )}
        <Dexes style={{ borderLeft: '1px solid black' }} />
      </Container>
    </ErrorBoundary>
  )
}

export default Widget
