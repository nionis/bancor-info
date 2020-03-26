import React from 'react'
import styled from 'styled-components'
import dexes from '../constants/dexes'

const Dexes = styled.div`
  display: flex;
  flex-direction: column;
  background: white;
  padding: 50px;
  text-align: center;

  & > .title {
    font-weight: 500;
    margin-bottom: 20px;
  }
`

const Dex = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`

const Link = styled.a`
  font-weight: 500;
  color: #2f80ed;
  text-decoration: none;
`

export default () => {
  return (
    <Dexes>
      <div className="title">Alternative partners</div>
      <div className="exchanges">
        {dexes.map(dex => (
          <Dex key={dex.url}>
            <Link href={`//${dex.url}`} target="_blank">
              {dex.name} ↗
            </Link>
          </Dex>
        ))}
      </div>
      <hr style={{ width: '100%' }} />
      <Link href={`//https://github.com/nionis/bancor-info`} target="_blank">
        add you own ↗
      </Link>
    </Dexes>
  )
}
