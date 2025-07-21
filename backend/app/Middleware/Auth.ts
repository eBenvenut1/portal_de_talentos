  import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

  export default class AuthGuard {
    async handle({ auth, request, response }: HttpContextContract, next: () => Promise<void>) {
      try {
        // Usa explicitamente o guard api
        await auth.use('api').authenticate()

        const user = auth.use('api').user!
        const body = request.body()

        request.updateBody({
          ...body,
          authUser: {
            ...(body.authUser || {}),
            id: user.id,
          }
        })
        console.debug('[AuthMiddleware] headers:', request.headers());

        await next()
      } catch (error) {
        return response.unauthorized({
          message: 'Token inválido ou expirado',
        })
      }
    }
  }