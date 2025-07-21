// app/Validators/Profile/UpdateProfileValidator.ts
import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class UpdateProfileValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    // Dados do usuário
    nome: schema.string.optional({ trim: true }, [
      rules.maxLength(45),
      rules.minLength(2)
    ]),
    email: schema.string.optional({ trim: true }, [
      rules.email(),
      rules.maxLength(60),
      rules.unique({ 
        table: 'users', 
        column: 'email',
        whereNot: { id: this.ctx.auth?.user?.id || 0 }
      })
    ]),
    
    // Dados do gestor
    nome_empresa: schema.string.optional({ trim: true }, [
      rules.maxLength(100),
      rules.minLength(2)
    ]),
    cnpj: schema.string.optional({ trim: true }, [
      rules.regex(/^\d{14}$/)
    ]),
    
    // Dados do candidato
    cep: schema.string.optional({ trim: true }, [
      rules.maxLength(45),
      rules.regex(/^\d{5}-?\d{3}$/)
    ]),
    endereco: schema.string.optional({ trim: true }, [
      rules.maxLength(45)
    ]),
    telefone: schema.string.optional({ trim: true }, [
      rules.maxLength(11),
      rules.regex(/^\d{10,11}$/)
    ])
  })

  public messages: CustomMessages = {
    'nome.minLength': 'O nome deve ter pelo menos 2 caracteres',
    'nome.maxLength': 'O nome deve ter no máximo 45 caracteres',
    'email.email': 'Email deve ter um formato válido',
    'email.maxLength': 'Email deve ter no máximo 60 caracteres',
    'email.unique': 'Este email já está em uso',
    'nome_empresa.minLength': 'O nome da empresa deve ter pelo menos 2 caracteres',
    'nome_empresa.maxLength': 'O nome da empresa deve ter no máximo 100 caracteres',
    'cnpj.regex': 'O CNPJ deve conter 14 dígitos numéricos',
    'cep.maxLength': 'CEP deve ter no máximo 45 caracteres',
    'cep.regex': 'CEP deve ter o formato válido (00000-000)',
    'endereco.maxLength': 'Endereço deve ter no máximo 45 caracteres',
    'telefone.maxLength': 'Telefone deve ter no máximo 11 caracteres',
    'telefone.regex': 'Telefone deve conter apenas números (10 ou 11 dígitos)'
  }
}