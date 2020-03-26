import React from 'react'
import BancorConversionWidget from 'bancor-conversion-widget'
import SvelteComponent from './SvelteComponent'
import ErrorBoundary from './ErrorBoundary'

const Widget = (...props) => {
  return (
    <ErrorBoundary>
      <SvelteComponent this={BancorConversionWidget} {...props} />
    </ErrorBoundary>
  )
}

export default Widget
