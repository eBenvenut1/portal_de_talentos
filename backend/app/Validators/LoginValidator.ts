// app/Validators/Auth/LoginValidator.ts
import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class LoginValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    email: schema.string({ trim: true }, [
      rules.email(),
      rules.maxLength(60)
    ]),
    senha: schema.string({ trim: true }, [
      rules.minLength(6),
      rules.maxLength(45)
    ])
  })

  public messages: CustomMessages = {
    'email.required': 'O email é obrigatório',
    'email.email': 'Email deve ter um formato válido',
    'email.maxLength': 'Email deve ter no máximo 60 caracteres',
    'senha.required': 'A senha é obrigatória',
    'senha.minLength': 'A senha deve ter pelo menos 6 caracteres',
    'senha.maxLength': 'A senha deve ter no máximo 45 caracteres'
  }
} 