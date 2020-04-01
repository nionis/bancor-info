import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 1;

  @media screen and (max-width: 440px) {
    padding-top: 20px;
  }
`

const CloseIcon = styled.div`
  position: absolute;
  color: white;
  font-size: 30px;
  top: 20px;
  right: 20px;

  &:hover {
    cursor: pointer;
  }
`

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
`

const Popup = ({ onClose, children }) => {
  return (
    <Wrapper>
      <CloseIcon onClick={onClose}>✕</CloseIcon>
      <Container
        onClick={event => {
          const left = event.target.getBoundingClientRect().left

          if (left === 0) {
            onClose()
          }
        }}
      >
        {children}
      </Container>
    </Wrapper>
  )
}

export default Popup
