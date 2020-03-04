import BN from 'bn.js'

const processCsv = text => {
  const lines = text.split(/\r\n|\n/)
  const [, ...valueLines] = lines

  return valueLines.reduce((result, valueLine) => {
    const [timestamp, ...amounts] = valueLine.split(',')
    if (timestamp.length === 0) return result

    const item = {
      timestamp: timestamp,
      total: amounts.reduce((p, c) => p.add(new BN(c)), new BN(0)).toString()
    }

    result.push(item)

    return result
  }, [])
}

const getData = ({ currency, type }) => {
  return fetch(`https://zumzoom.github.io/analytics/bancor/data/${currency}/${type}.csv`)
    .then(res => res.text())
    .then(processCsv)
}

export default getData
