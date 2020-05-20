// using ISO 3166 Alpha-3 code
export const blacklistedCountryCodes = ['USA']
const joinedCountryCodes = blacklistedCountryCodes.join(', ')

export const blacklistedCountryCodeMsg = `Please note that ${joinedCountryCodes} citizens, domiciliaries or users from ${joinedCountryCodes} IPs are not allowed to convert tokens using this interface.`
