// config/auth.ts
import { AuthConfig } from '@ioc:Adonis/Addons/Auth'

const authConfig: AuthConfig = {
  guard: 'api',
  guards: {
    /*
    |--------------------------------------------------------------------------
    | API Guard
    |--------------------------------------------------------------------------
    |
    | API guard uses API tokens for maintaining user login state. It uses the
    | `user` provider for fetching user details.
    |
    */
    api: {
      driver: 'oat',
      tokenProvider: {
        type: 'api',
        driver: 'database',
        table: 'api_tokens',
        foreignKey: 'user_id',
      },
      provider: {
        driver: 'lucid',
        identifierKey: 'id',
        uids: ['email'],
        model: () => import('App/Models/User'),
      },
    },

    /*
    |--------------------------------------------------------------------------
    | JWT Guard
    |--------------------------------------------------------------------------
    |
    | JWT guard uses JWT tokens for maintaining user login state.
    |
    */
    jwt: {
      driver: 'jwt',
      publicKey: '',
      privateKey: '',
      persistJwt: false,
      jwtDefaultExpire: '10m',
      refreshTokenDefaultExpire: '10d',
      tokenProvider: {
        driver: 'database',
        table: 'api_tokens',
        foreignKey: 'user_id',
      },
      provider: {
        driver: 'lucid',
        identifierKey: 'id',
        uids: ['email'],
        model: () => import('App/Models/User'),
      },
    },
  },
}

export default authConfig