const processCsv = text => {
  const lines = text.split(/\r\n|\n/)
  const [keyLines, ...valueLines] = lines
  const keys = keyLines.split(',')

  return valueLines.reduce((result, valueLine) => {
    const values = valueLine.split(',')

    keys.forEach((key, index) => {
      if (!result[key]) result[key] = []
      result[key].push(values[index])
    })

    return result
  }, {})
}

const getData = ({ currency, type }) => {
  return fetch(`https://zumzoom.github.io/analytics/bancor/data/${currency}/${type}.csv`)
    .then(res => res.text())
    .then(processCsv)
}

export default getData
