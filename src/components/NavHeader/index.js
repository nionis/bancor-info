import React, { useEffect, useState } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { Box } from 'rebass'
import styled from 'styled-components'
import { isMobile } from 'react-device-detect'
import { useMedia } from 'react-use'
import Title from '../Title'
import Select from '../Select'
import CurrencySelect from '../CurrencySelect'
import Panel from '../Panel'
import Popup from '../Popup'
import Dexes from '../Dexes'

const Header = styled(Panel)`
  display: grid;
  width: 100%;
  grid-template-columns: 1fr 1fr;
  justify-content: space-between;
  align-items: center;
  padding: 24px;

  @media (max-width: 40em) {
    padding: 18px;
  }
`

const Button = styled(Box)`
  &:hover {
    background-color: #2f80edab;
    cursor: pointer;
  }

  display: flex;
  justify-content: center;
  align-items: center;
  height: 38px;
  width: 100px;
  color: white;
  background-color: #2f80ed;
  border-radius: 32px;
  font-weight: 500;
  font-size: 16px;
`

const TokenSelect = styled(Select)`
  width: 180px;

  @media screen and (max-width: 40em) {
    width: 160px;
  }
`

const NavRight = styled.div`
  display: grid;
  justify-items: end;
  align-items: center;
  grid-template-columns: auto 130px 180px;
  grid-column-gap: 16px;

  @media screen and (max-width: 40em) {
    grid-template-columns: auto auto 160px;
  }
`

const LinkText = styled(Link)`
  font-weight: 500;
  color: white;
  margin-left: 1em;
  opacity: ${props => (props.selected ? 0 : 0.6)};
  text-decoration: none;

  @media screen and (max-width: 40em) {
    display: none;
  }
`

const NavLeft = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`

const FrameBorder = styled.div`
  border-radius: 26px;
  margin-bottom: 20px;
  overflow: hidden;
`

export default function NavHeader({ exchanges, setCurrencyUnit, currencyUnit }) {
  // for now exclude broken tokens
  const [filteredDirectory, setDirectory] = useState([])
  const [capEth, setCapEth] = useState(true)
  const [popupVisible, setPopupVisibility] = useState(false)

  // filter out exchange with low liquidity
  useEffect(() => {
    setDirectory([])
    if (exchanges) {
      let fd = []
      Object.keys(exchanges).map(key => {
        let item = exchanges[key]
        if (parseFloat(item.ethBalance) > (capEth ? 0.5 : 0)) {
          if (isMobile && item.label.label.length > 5) {
            item.label.label = item.label.label.slice(0, 5) + '...'
          }
          item.label.logo = item.logo
          item.label.ethBalance = item.ethBalance
          fd.push(item.label)
        }
        return true
      })
      setDirectory(fd)
    }
  }, [exchanges, capEth])

  const belowLarge = useMedia('(max-width: 40em)')
  const history = useHistory()

  return (
    <>
      <Header bg={['transparent', 'transparent']}>
        <NavLeft>
          <Title />
          <LinkText to="/" selected={window.location.pathname === '/home'}>
            Back to Home
          </LinkText>
        </NavLeft>
        <NavRight>
          <Button onClick={() => setPopupVisibility(true)}>convert</Button>
          <CurrencySelect setCurrencyUnit={setCurrencyUnit} currencyUnit={currencyUnit} />
          <TokenSelect
            options={filteredDirectory}
            setCapEth={setCapEth}
            capEth={capEth}
            tokenSelect={true}
            placeholder={belowLarge ? 'Tokens' : 'Find token'}
            onChange={select => {
              history.push('/exchange/' + select.value)
            }}
          />
        </NavRight>
      </Header>
      {popupVisible ? (
        <Popup onClose={() => setPopupVisibility(false)}>
          <FrameBorder>
            <Dexes />
          </FrameBorder>
        </Popup>
      ) : null}
    </>
  )
}
