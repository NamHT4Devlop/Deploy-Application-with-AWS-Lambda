import Axios from 'axios'
import jsonwebtoken from 'jsonwebtoken'
import {createLogger} from '../../utils/logger.mjs'

const logger = createLogger('auth')

const jwksUrl = 'https://dev-f5qtnfhtqkqkbuyw.us.auth0.com/.well-known/jwks.json'

async function getPublicKey() {
    const response = await Axios.get(jwksUrl);
    const key = response.data.keys[0].x5c[0];
    const beginCert = '-----BEGIN CERTIFICATE-----\n';
    const endCert = '\n-----END CERTIFICATE-----';
    return `${beginCert}${key}${endCert}`;
}

export async function handler(event) {
    try {
        const jwtToken = await verifyToken(event.authorizationToken)

        return {
            principalId: jwtToken.sub,
            policyDocument: {
                Version: '2012-10-17',
                Statement: [
                    {
                        Action: 'execute-api:Invoke',
                        Effect: 'Allow',
                        Resource: '*'
                    }
                ]
            }
        }
    } catch (e) {
        logger.error('User not authorized', {error: e.message})

        return {
            principalId: 'user',
            policyDocument: {
                Version: '2012-10-17',
                Statement: [
                    {
                        Action: 'execute-api:Invoke',
                        Effect: 'Deny',
                        Resource: '*'
                    }
                ]
            }
        }
    }
}

async function verifyToken(authHeader) {
    const token = getToken(authHeader)

    try {
        const publicKey = await getPublicKey()
        const verifiedPayload = jsonwebtoken.verify(token, publicKey, {algorithms: ['RS256']})
        return verifiedPayload
    } catch (error) {
        logger.error('Failed to verify JWT token', {error: error.message});
        throw new Error('Token is invalid')
    }
}

function getToken(authHeader) {
    if (!authHeader) throw new Error('No authentication header')

    if (!authHeader.toLowerCase().startsWith('bearer '))
        throw new Error('Invalid authentication header')
    const split = authHeader.split(' ')
    const token = split[1]
    logger.info('Authorization header parts:', {parts: split});
    logger.info('Extracted token:', {token: token});
    return token
}
