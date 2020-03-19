import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useMedia } from 'react-use'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import BigNumber from 'bignumber.js'
import fetchConverters from '../../bancor/converters'
import { Box, Flex, Text } from 'rebass'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import TokenLogo from '../TokenLogo'
import { formattedNum } from '../../helpers'
import { Divider } from '../../components'
import Loader from '../../components/Loader'

dayjs.extend(utc)

const PageButtons = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 2em;
  margin-bottom: 2em;
`

const Arrow = styled.div`
  color: #2f80ed;
  opacity: ${props => (props.faded ? 0.3 : 1)};
  padding: 0 20px;
  user-select: none;

  :hover {
    cursor: pointer;
  }
`

const List = styled(Box)`
  -webkit-overflow-scrolling: touch;
`

const DashGrid = styled.div`
  display: grid;
  grid-gap: 1em;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-areas: 'symbol liquidity volume';
  padding: 0 6px;

  > * {
    justify-content: flex-end;
    width: 100%;

    &:first-child {
      justify-content: flex-start;
      width: 100px;
    }
  }

  @media screen and (min-width: 40em) {
    max-width: 1280px;
    display: grid;
    grid-gap: 1em;
    grid-template-columns: 0.8fr 1fr 1fr 1fr;
    grid-template-areas: 'name txs liquidity volume';

    > * {
      justify-content: flex-end;
      width: 100%;

      &:first-child {
        justify-content: flex-start;
        width: 240px;
      }
    }
  }

  @media screen and (min-width: 64em) {
    max-width: 1280px;
    display: grid;
    padding: 0 24px;
    grid-gap: 1em;
    grid-template-columns: 1fr 0.8fr 0.8fr 0.8fr 1fr 1fr 1fr;
    grid-template-areas: 'name symbol pool price volume liquidity txs';
  }
`

const DashGridClickable = styled(DashGrid)`
  :hover {
    // background-color: #f8f8f8;
    // cursor: pointer;
  }
`

const ListWrapper = styled.div`
  @media screen and (max-width: 40em) {
    padding: 0 0.4em;
  }
`

const ClickableText = styled(Text)`
  text-align: right;

  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }

  user-select: none;
`

const DataText = styled(Flex)`
  @media screen and (max-width: 40em) {
    font-size: 14px;
  }

  align-items: center;
  text-align: right;

  & > * {
    font-size: 1em;
  }
`

const LogoBox = styled.div`
  width: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 4px;

  @media screen and (max-width: 40em) {
    margin-right: 6px;
  }
`

const CustomLink = styled(Link)`
  text-decoration: none;

  &:visited {
    color: rgb(47, 128, 237);
  }
`

// @TODO rework into virtualized list
function OverviewList({ currencyUnit }) {
  const [exchanges, setExchanges] = useState([])

  const [filteredTxs, SetFilteredTxs] = useState([])

  const [exchangeData24Hour, setExchangeData24Hour] = useState({})

  const [page, setPage] = useState(1)

  const [maxPage, setMaxPage] = useState(1)

  const TXS_PER_PAGE = 10

  const [loading, setLoading] = useState(true)

  const [sortDirection, setSortDirection] = useState(true)

  const SORT_FIELD = {
    PRICE: 'priceUSDB',
    LIQUIDITY: 'liquidityUSDB',
    TRANSACTIIONS: 'txs',
    VOLUME: 'volume24HrUSDBInUnit',
    SYMBOL: 'baseSymbol',
    PRICE_CHANGE: 'priceChange24hr',
    PRICE_CHANGE_ETH: 'priceChange24hr',
    POOL: 'quoteSymbol'
  }

  const [sortedColumn, setSortedColumn] = useState(SORT_FIELD.LIQUIDITY)

  function getPercentChangeColor(change) {
    if (change === 0) {
      return <span>{change + ' %'}</span>
    }
    if (change < 0) {
      return <span style={{ color: 'red' }}>{change + ' %'}</span>
    }
    return <span style={{ color: 'green' }}>{change + ' %'}</span>
  }

  function sortTxs(field) {
    if (
      // field === SORT_FIELD.VOLUME ||
      // field === SORT_FIELD.PRICE_CHANGE ||
      // field === SORT_FIELD.PRICE_CHANGE_ETH
      field === SORT_FIELD.TRANSACTIIONS
    ) {
      let newTxs = filteredTxs.slice().sort((a, b) => {
        if (!exchangeData24Hour.hasOwnProperty(a.id)) {
          exchangeData24Hour[a.id] = {}
          exchangeData24Hour[a.id].volume = 0
          exchangeData24Hour[a.id].txs = 0
          exchangeData24Hour[a.id].priceChange = 0
          exchangeData24Hour[a.id].priceChangeETH = 0
          setExchangeData24Hour(exchangeData24Hour)
        }
        if (!exchangeData24Hour.hasOwnProperty(b.id)) {
          exchangeData24Hour[b.id] = {}
          exchangeData24Hour[b.id].volume = 0
          exchangeData24Hour[a.id].txs = 0
          exchangeData24Hour[b.id].priceChange = 0
          exchangeData24Hour[a.id].priceChangeETH = 0
          setExchangeData24Hour(exchangeData24Hour)
        }
        return new BigNumber(exchangeData24Hour[a.id][field]).gt(exchangeData24Hour[b.id][field])
          ? (sortDirection ? -1 : 1) * 1
          : (sortDirection ? -1 : 1) * -1
      })
      SetFilteredTxs(newTxs)
      setPage(1)
    } else {
      let newTxs
      if (field === SORT_FIELD.SYMBOL || field === SORT_FIELD.POOL) {
        newTxs = filteredTxs.slice().sort((a, b) => {
          return a[field].toString().toLowerCase() > b[field].toString().toLowerCase()
            ? (sortDirection ? -1 : 1) * -1
            : (sortDirection ? -1 : 1) * 1
        })
      } else {
        newTxs = filteredTxs.slice().sort((a, b) => {
          return new BigNumber(a[field]).gt(b[field]) ? (sortDirection ? -1 : 1) * -1 : (sortDirection ? -1 : 1) * 1
        })
      }
      SetFilteredTxs(newTxs)
      setPage(1)
    }
  }

  useEffect(() => {
    setSortDirection(true)
  }, [exchanges])

  // get top 100 exchanges by liquidity
  useEffect(() => {
    setPage(1)

    async function getTxs() {
      setLoading(true)

      let newExchanges = []
      const step = 100

      const result = await fetchConverters({
        step
      })

      newExchanges = Array.from(result.values()).sort((a, b) => {
        return new BigNumber(b.liquidity).minus(a.liquidity)
      })

      setMaxPage(Math.floor(newExchanges.length / TXS_PER_PAGE))
      SetFilteredTxs(newExchanges)
      setExchanges(newExchanges)
    }

    getTxs()
    setLoading(false)
  }, [])

  const belowMedium = useMedia('(max-width: 64em)')

  const belowSmall = useMedia('(max-width: 40em)')

  const TransactionItem = ({ exchange, id }) => {
    if (exchange.base === '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359') {
      exchange.baseSymbol = 'SAI'
    }
    if (exchange.base === '0xf5dce57282a584d2746faf1593d3121fcac444dc') {
      exchange.baseSymbol = 'cSAI'
      exchange.baseName = 'Compound SAI'
    }
    return (
      <DashGridClickable style={{ height: '60px' }}>
        <Flex alignItems="center" justifyContent="flex-start">
          <div style={{ minWidth: '30px' }}>{id + (page - 1) * TXS_PER_PAGE}</div>
          <LogoBox>
            <TokenLogo size={24} address={exchange.base} style={{ height: '24px', width: '24px' }} />
          </LogoBox>
          {!belowSmall ? (
            <CustomLink
              to={'/exchange/' + exchange.id}
              onClick={() => {
                window.scrollTo(0, 0)
              }}
            >
              <Text color="button" area={'name'} fontWeight="500">
                {exchange.baseName}
              </Text>
            </CustomLink>
          ) : (
            <CustomLink
              to={'/exchange/' + exchange.id}
              onClick={() => {
                window.scrollTo(0, 0)
              }}
            >
              <DataText area={'symbol'} color="button">
                {exchange.baseSymbol}
              </DataText>
            </CustomLink>
          )}
        </Flex>
        {!belowMedium ? (
          <>
            <DataText area={'symbol'}>{exchange.baseSymbol}</DataText>
            <DataText area={'pool'}>{exchange.quoteSymbol}</DataText>
            <DataText area={'price'}>
              {exchange.price && exchange.priceUSDB
                ? currencyUnit === 'USD'
                  ? '$' + formattedNum(exchange.priceUSDB, true)
                  : formattedNum(exchange.priceETH) + ' ETH'
                : ''}
            </DataText>
          </>
        ) : (
          ''
        )}
        <DataText area={'liquidity'}>
          {currencyUnit === 'USD'
            ? '$' + formattedNum(exchange.liquidityUSDBInUnit, true)
            : formattedNum(exchange.liquidityETHInUnit) + ' ETH'}
        </DataText>

        <DataText area={'volume'}>
          {currencyUnit === 'USD'
            ? '$' + formattedNum(exchange.volume24HrUSDBInUnit, true)
            : formattedNum(exchange.volume24HrETHInUnit) + ' ETH'}
        </DataText>
        {!belowSmall ? (
          <DataText area={'txs'}>
            {currencyUnit === 'USD'
              ? getPercentChangeColor(exchange.priceChange24hr)
              : getPercentChangeColor(exchange.priceChange24hr)}
          </DataText>
        ) : (
          ''
        )}
      </DashGridClickable>
    )
  }

  return (
    <ListWrapper>
      <DashGrid center={true} style={{ height: '60px' }}>
        <Flex alignItems="center">
          <Text color="text" area={'name'}>
            Exchanges
          </Text>
        </Flex>
        {!belowMedium ? (
          <>
            <Flex alignItems="center">
              <ClickableText
                area={'liquidity'}
                color="textDim"
                onClick={e => {
                  setSortedColumn(SORT_FIELD.SYMBOL)
                  setSortDirection(!sortDirection)
                  sortTxs(SORT_FIELD.SYMBOL)
                }}
              >
                <Text>Symbol {sortedColumn === SORT_FIELD.SYMBOL ? (!sortDirection ? '↑' : '↓') : ''}</Text>
              </ClickableText>
            </Flex>
            <Flex alignItems="center">
              <ClickableText
                area={'pool'}
                color="textDim"
                onClick={e => {
                  setSortedColumn(SORT_FIELD.POOL)
                  setSortDirection(!sortDirection)
                  sortTxs(SORT_FIELD.POOL)
                }}
              >
                <Text>Pool {sortedColumn === SORT_FIELD.POOL ? (!sortDirection ? '↑' : '↓') : ''}</Text>
              </ClickableText>
            </Flex>
            <Flex alignItems="center">
              <ClickableText
                area={'price'}
                color="textDim"
                onClick={e => {
                  setSortedColumn(SORT_FIELD.PRICE)
                  setSortDirection(!sortDirection)
                  sortTxs(SORT_FIELD.PRICE)
                }}
              >
                Price {sortedColumn === SORT_FIELD.PRICE ? (!sortDirection ? '↑' : '↓') : ''}
              </ClickableText>
            </Flex>
          </>
        ) : (
          ''
        )}
        <Flex alignItems="center">
          <ClickableText
            area={'liquidity'}
            color="textDim"
            onClick={e => {
              setSortedColumn(SORT_FIELD.LIQUIDITY)
              setSortDirection(!sortDirection)
              sortTxs(SORT_FIELD.LIQUIDITY)
            }}
          >
            Liquidity {sortedColumn === SORT_FIELD.LIQUIDITY ? (!sortDirection ? '↑' : '↓') : ''}
          </ClickableText>
        </Flex>
        <Flex alignItems="center">
          <ClickableText
            area={'liquidity'}
            color="textDim"
            onClick={e => {
              setSortedColumn(SORT_FIELD.VOLUME)
              setSortDirection(!sortDirection)
              sortTxs(SORT_FIELD.VOLUME)
            }}
          >
            Volume (24hrs) {sortedColumn === SORT_FIELD.VOLUME ? (sortDirection ? '↑' : '↓') : ''}
          </ClickableText>
        </Flex>
        {!belowSmall ? (
          <Flex alignItems="center">
            <ClickableText
              area={'liquidity'}
              color="textDim"
              onClick={e => {
                setSortedColumn(SORT_FIELD.PRICE_CHANGE)
                setSortDirection(!sortDirection)
                sortTxs(currencyUnit === 'USD' ? SORT_FIELD.PRICE_CHANGE : SORT_FIELD.PRICE_CHANGE_ETH)
              }}
            >
              Price Change (24hrs) {sortedColumn === SORT_FIELD.PRICE_CHANGE ? (sortDirection ? '↑' : '↓') : ''}
            </ClickableText>
          </Flex>
        ) : (
          ''
        )}
      </DashGrid>

      <Divider />
      <List p={0}>
        {loading || exchanges.length === 0 || exchangeData24Hour.length === 0 ? (
          <Loader />
        ) : (
          filteredTxs.slice(TXS_PER_PAGE * (page - 1), page * TXS_PER_PAGE).map((item, index) => {
            return (
              <div key={index}>
                <TransactionItem key={index} exchange={item} id={index + 1} />
                <Divider />
              </div>
            )
          })
        )}
      </List>
      <PageButtons>
        <div
          onClick={e => {
            setPage(page === 1 ? page : page - 1)
          }}
        >
          <Arrow faded={page === 1 ? true : false}>←</Arrow>
        </div>
        {'Page ' + page + ' of ' + maxPage}
        <div
          onClick={e => {
            setPage(page === maxPage ? page : page + 1)
          }}
        >
          <Arrow faded={page === maxPage ? true : false}>→</Arrow>
        </div>
        <i data-feather="circle"></i>
      </PageButtons>
    </ListWrapper>
  )
}

OverviewList.defaultProps = {
  transactions: []
}

OverviewList.propTypes = {
  transactions: PropTypes.array.isRequired
}

export default OverviewList
