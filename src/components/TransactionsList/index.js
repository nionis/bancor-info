import React, { useState, useEffect } from 'react'
import { useMedia } from 'react-use'
import LocalLoader from '../LocalLoader'
import { Box, Flex, Text } from 'rebass'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { useSwaps } from '../../Data/SwapsData'
import Link from '../Link'
import { Divider } from '../../components'
import { urls, formatTime, Big, formattedNum } from '../../helpers'

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
  grid-template-columns: 100px 1fr 1fr;
  grid-template-areas: 'action value Time';
  padding: 0 6px;

  > * {
    justify-content: flex-end;
    width: 100%;

    &:first-child {
      justify-content: flex-start;
      text-align: left;
      width: 100px;
    }
  }

  @media screen and (min-width: 40em) {
    max-width: 1280px;
    display: grid;
    grid-gap: 1em;
    grid-template-columns: 180px 1fr 1fr 1fr;
    grid-template-areas: 'action value Account Time';

    > * {
      justify-content: flex-end;
      width: 100%;

      &:first-child {
        justify-content: flex-start;
        width: 180px;
      }
    }
  }

  @media screen and (min-width: 64em) {
    max-width: 1280px;
    display: grid;
    padding: 0 24px;
    grid-gap: 1em;
    grid-template-columns: 1.2fr 1fr 1fr 1fr 1fr 1fr;
    grid-template-areas: 'action value ethAmount tokenAmount Account Time';
  }
`

const ListWrapper = styled.div`
  @media screen and (max-width: 40em) {
    padding-right: 1rem;
    padding-left: 1rem;
  }
`

const CustomLink = styled(Link)`
  margin-left: 0px;
`

const ClickableText = styled(Text)`
  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
  user-select: none;
`

const EmptyTxWrapper = styled.div`
  width: 100%;
  display: flex;
  height: 80px;
  align-items: center;
  justify-content: center;
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

const SORT_FIELD = {
  TIME: 'timestamp',
  USD_VALUE: 'usdAmount',
  ETH_VALUE: 'ethAmount',
  TOKEN_VALUE: 'tokenAmount'
}

// @TODO rework into virtualized list
function TransactionsList({ tokenSymbol, exchangeAddress, price, priceUSD, txFilter, accountInput }) {
  const [txs, setTxs] = useState([])

  const [swaps, SetSwaps] = useState([])

  const [adds, SetAdds] = useState([])

  const [removes, SetRemoves] = useState([])

  const [filteredTxs, SetFilteredTxs] = useState([])

  const [page, setPage] = useState(1)

  const [maxPage, setMaxPage] = useState(1)

  const TXS_PER_PAGE = 10

  const [loading, setLoading] = useState(true)

  const [sortDirection, setSortDirection] = useState(true)

  const [sortedColumn, setSortedColumn] = useState(SORT_FIELD.TIME)

  const swapsData = useSwaps(exchangeAddress)

  useEffect(() => {
    setMaxPage(1)
    setPage(1)
  }, [exchangeAddress])

  useEffect(() => {
    let extraPages = 1
    if (accountInput !== '') {
      let foundAccounts = []
      for (let x = 0; x < txs.length; x++) {
        if (
          txs[x].user
            .toString()
            .toUpperCase()
            .search(accountInput.toUpperCase()) > -1
        ) {
          foundAccounts.push(txs[x])
        }
      }
      SetFilteredTxs(foundAccounts)
      if (foundAccounts.length % TXS_PER_PAGE === 0) {
        extraPages = 0
      }
      setMaxPage(Math.floor(foundAccounts.length / TXS_PER_PAGE) + extraPages)
    } else {
      SetFilteredTxs(txs)
      if (txs.length % TXS_PER_PAGE === 0) {
        extraPages = 0
      }
      setMaxPage(Math.floor(txs.length / TXS_PER_PAGE) + extraPages)
    }
  }, [accountInput, txs])

  function sortTxs(field) {
    if (field === SORT_FIELD.USD_VALUE) {
      field = SORT_FIELD.ETH_VALUE
    }
    let newTxs = filteredTxs
      .slice()
      .sort((a, b) =>
        parseFloat(a[field]) > parseFloat(b[field]) ? (sortDirection ? -1 : 1) * -1 : (sortDirection ? -1 : 1) * 1
      )
    SetFilteredTxs(newTxs)
    setPage(1)
  }

  useEffect(() => {
    setSortDirection(true)
    switch (txFilter) {
      case 'Add':
        SetFilteredTxs(adds)
        setMaxPage(Math.floor(adds.length / TXS_PER_PAGE) + 1)
        setPage(1)
        break
      case 'Remove':
        SetFilteredTxs(removes)
        setMaxPage(Math.floor(removes.length / TXS_PER_PAGE) + 1)
        setPage(1)
        break
      case 'Swaps':
        SetFilteredTxs(swaps)
        setMaxPage(Math.floor(swaps.length / TXS_PER_PAGE) + 1)
        setPage(1)
        break
      default:
        SetFilteredTxs(txs)
        setMaxPage(Math.floor(txs.length / TXS_PER_PAGE) + 1)
        setPage(1)
        break
    }
  }, [txFilter, adds, removes, swaps, txs])

  /**
   *  Fetch the overall and 24hour data for each exchange
   *
   * Update when exhcange changes
   *
   * Store results in categorized arrays for faster sorting
   *
   */
  useEffect(() => {
    setPage(1)
    setLoading(true)

    if (!swapsData) return

    const items = swapsData.swapsOneDays.map(swap => {
      return {
        tx: swap.id,
        value: swap.value,
        ethAmount: swap.ethAmount,
        tokenAmount: swap.tokenAmount,
        user: swap.trader.id,
        timestamp: swap.timestamp,
        event: 'Token Swap',
        from: swap.fromToken.symbol,
        to: swap.toToken.symbol
      }
    })

    setTxs(items)
    SetFilteredTxs(items)
    SetSwaps(items)
    SetAdds([])
    SetRemoves([])
    setLoading(false)
    setMaxPage(Math.floor(items.length / TXS_PER_PAGE) + 1)
  }, [swapsData])

  function getTransactionType(event, from, to) {
    switch (event) {
      case 'AddLiquidity':
        return 'Add ETH and ' + from
      case 'RemoveLiquidity':
        return 'Remove ETH and ' + from
      case 'Token Swap':
        return 'Swap ' + from + ' for ' + to
      case 'EthPurchase':
        return 'Swap ' + from + ' for ETH'
      case 'TokenPurchase':
        return 'Swap ETH for ' + from

      default:
        return ''
    }
  }

  const belowMedium = useMedia('(max-width: 64em)')

  const belowSmall = useMedia('(max-width: 40em)')

  const TransactionItem = ({ transaction, tokenSymbol }) => {
    return (
      <DashGrid style={{ height: '60px' }}>
        <DataText area={'action'} color="text" fontWeight="500">
          <CustomLink ml="3" color="button" external href={urls.showTransaction(transaction.tx.split('-')[0])}>
            {getTransactionType(transaction.event, transaction.from, transaction.to)}
          </CustomLink>
        </DataText>
        <DataText area={'value'}>{price && priceUSD ? '$' + formattedNum(Big(transaction.value), true) : ''}</DataText>
        {!belowMedium ? (
          <>
            <DataText area={'ethAmount'}>{formattedNum(Big(transaction.ethAmount))}</DataText>
            <DataText area={'tokenAmount'}>{formattedNum(Big(transaction.tokenAmount))}</DataText>
          </>
        ) : (
          ''
        )}
        {!belowSmall ? (
          <DataText area={'Account'}>
            <Link ml="3" color="button" external href={'https://etherscan.io/address/' + transaction.user}>
              {transaction.user.slice(0, 6) + '...' + transaction.user.slice(38, 42)}
            </Link>
          </DataText>
        ) : (
          ''
        )}
        <DataText area={'Time'}>{formatTime(transaction.timestamp)}</DataText>
      </DashGrid>
    )
  }

  return (
    <ListWrapper>
      <DashGrid center={true} style={{ height: '60px' }}>
        <Flex alignItems="center">
          <Text color="text" area={'action'}>
            Transactions (24h)
          </Text>
        </Flex>
        <Flex alignItems="center">
          <ClickableText
            area={'value'}
            color="textDim"
            onClick={e => {
              setSortedColumn(SORT_FIELD.USD_VALUE)
              setSortDirection(!sortDirection)
              sortTxs(SORT_FIELD.USD_VALUE)
            }}
          >
            Value {sortedColumn === SORT_FIELD.USD_VALUE ? (!sortDirection ? '↑' : '↓') : ''}
          </ClickableText>
        </Flex>
        {!belowMedium ? (
          <>
            <Flex alignItems="center">
              <ClickableText
                area={'ethAmount'}
                color="textDim"
                onClick={e => {
                  setSortedColumn(SORT_FIELD.ETH_VALUE)
                  setSortDirection(!sortDirection)
                  sortTxs(SORT_FIELD.ETH_VALUE)
                }}
              >
                ETH Amount {sortedColumn === SORT_FIELD.ETH_VALUE ? (!sortDirection ? '↑' : '↓') : ''}
              </ClickableText>
            </Flex>
            <Flex alignItems="center">
              <ClickableText
                area={'tokenAmount'}
                color="textDim"
                onClick={e => {
                  setSortedColumn(SORT_FIELD.TOKEN_VALUE)
                  setSortDirection(!sortDirection)
                  sortTxs(SORT_FIELD.TOKEN_VALUE)
                }}
              >
                Token Amount {sortedColumn === SORT_FIELD.TOKEN_VALUE ? (!sortDirection ? '↑' : '↓') : ''}
              </ClickableText>
            </Flex>
          </>
        ) : (
          ''
        )}
        {!belowSmall ? (
          <Flex alignItems="center">
            <Text area={'Account'} color="textDim">
              Account
            </Text>
          </Flex>
        ) : (
          ''
        )}
        <Flex alignItems="center">
          <ClickableText
            area={'time'}
            color="textDim"
            onClick={e => {
              setSortedColumn(SORT_FIELD.TIME)
              setSortDirection(!sortDirection)
              sortTxs(SORT_FIELD.TIME)
            }}
          >
            Time {sortedColumn === SORT_FIELD.TIME ? (!sortDirection ? '↑' : '↓') : ''}
          </ClickableText>
        </Flex>
      </DashGrid>
      <Divider />
      <List p={0}>
        {!loading && txs && filteredTxs.length === 0 ? (
          <EmptyTxWrapper>No transactions in last 24 hours</EmptyTxWrapper>
        ) : (
          ''
        )}
        {loading ? (
          <LocalLoader />
        ) : (
          filteredTxs.slice(TXS_PER_PAGE * (page - 1), page * TXS_PER_PAGE).map((tx, index) => {
            return (
              <div key={index}>
                <TransactionItem key={index} transaction={tx} tokenSymbol={tokenSymbol} />
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
      </PageButtons>
    </ListWrapper>
  )
}

TransactionsList.defaultProps = {
  transactions: []
}

TransactionsList.propTypes = {
  transactions: PropTypes.array.isRequired
}

export default TransactionsList
