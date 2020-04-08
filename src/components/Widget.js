import React from 'react'
import styled from 'styled-components'
import BancorConversionWidget from 'bancor-conversion-widget'
import SvelteComponent from './SvelteComponent'
import Dexes from './Dexes'
import ErrorBoundary from './ErrorBoundary'

const Container = styled.div`
  display: flex;
`

const Widget = (...props) => {
  return (
    <ErrorBoundary>
      <Container>
        <SvelteComponent this={BancorConversionWidget} {...props} />
        <Dexes style={{ borderLeft: '1px solid black' }} />
      </Container>
    </ErrorBoundary>
  )
}

export default Widget
