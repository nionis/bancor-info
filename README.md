# Bancor Network Info

Transaction and liquidity pool stats for [Bancor](https://www.bancor.network/).

Check it out live: [https://bancor-network.info/](https://bancor-network.info/).

This is a fan made fork of [uniswap's](https://uniswap.info/) network info page, PR's are welcome!

### Table of Contents

- [Bancor Network Info](#bancor-network-info)
    - [Table of Contents](#table-of-contents)
    - [Development](#development)
          - [Installing dependencies](#installing-dependencies)
          - [Running locally](#running-locally)
    - [Become a partner](#become-a-partner)
    - [Contributing](#contributing)
          - [Opinion](#opinion)

### Development

###### Installing dependencies

```bash
yarn
```

###### Running locally

```bash
yarn start
```

### Become a partner

1. fork this project
2. add your information in this [file](/src/constants/dexes.js)
3. submit a PR

### Contributing

Before contributing, here is a quick run down on how it's implemented.

This is a fork on an existing project, from the get go I wanted to implement it in a way in which it minimizes changes to the original source code, that resulted in containing most of the changes [here](./src/bancor).
It goes without saying that since we are forking an existing project, we are constaint by it's implementation (unless we are willing to refactor), this includes from adding typescript to improving performance.

The original source code uses a single endpoint to pull the data required, while this is also possible with bancor's endpoint in some extend, it still lacks about 50% of the required data. This is where things get a bit tricky and we start using different API endpoints, unfortunately we have to derive some of the data required on our own, meaning we have to do some data processing on the client.
Last but not least, at the time of making, subgraph was experiencing a bug where you couldn't query in a single call data at block N and block N-1 (it would give you only data for block N).

###### Opinion

I would like to see performance improved, so any PR's in that direction are more than welcome, here is how I would go about it:

1. improve subgraph endpoint
2. use updated endpoint on client & remove dead code
3. lazy load bunch of stuff
