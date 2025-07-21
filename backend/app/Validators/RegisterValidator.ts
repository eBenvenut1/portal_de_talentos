
import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class RegisterValidator {
  constructor(protected ctx: HttpContextContract) { }

  public schema = schema.create({
    nome: schema.string({ trim: true }, [
      rules.maxLength(45),
      rules.minLength(2)
    ]),
    email: schema.string({ trim: true }, [
      rules.email(),
      rules.maxLength(60),
      rules.unique({ table: 'users', column: 'email' })
    ]),
    senha: schema.string({ trim: true }, [
      rules.minLength(6),
      rules.maxLength(45),
      rules.confirmed('senha_confirmation')
    ]),
    senha_confirmation: schema.string({ trim: true }),
    tipo_usuario: schema.enum(['candidato', 'gestor'] as const),

    //Campo especifico para candidatos
    cep: schema.string.optional({ trim: true }, [
      rules.maxLength(8),
      rules.minLength(8),
      rules.requiredWhen('tipo_usuario', '=', 'candidato')
    ]),
    telefone: schema.string.optional({ trim: true }, [
      rules.minLength(9),
      rules.maxLength(11),
      rules.requiredWhen('tipo_usuario', '=', 'candidato')
    ]),

    endereco: schema.string.optional({ trim: true }, [
      rules.minLength(3),
      rules.maxLength(70),
      // rules.requiredWhen('tipo_usuario', '=', 'candidato')
    ]),

    // Campo específico para gestores
    nome_empresa: schema.string.optional({ trim: true }, [
      rules.maxLength(100),
      rules.minLength(2),
      rules.requiredWhen('tipo_usuario', '=', 'gestor')
    ]),
    cnpj: schema.string.optional({ trim: true }, [
      rules.regex(/^\d{14}$/),
      rules.requiredWhen('tipo_usuario', '=', 'gestor')
    ]),
    dnasc: schema.date.optional({}, [
      rules.requiredWhen('tipo_usuario', '=', 'candidato')
    ]),

    formacoes: schema.array.optional().members(
      schema.object().members({
        curso: schema.string({ trim: true }),
        instituicao: schema.string({ trim: true }),
        conclusao: schema.date.optional(),
        data_inicio: schema.date.optional()
      })

    ),
    habilidades: schema.array.optional([
      rules.requiredWhen('tipo_usuario', '=', 'candidato')
    ]).members(
      schema.number([
        rules.exists({ table: 'habilidades', column: 'id' })
      ])
    ),

  })



  public messages: CustomMessages = {
    'nome.required': 'O nome é obrigatório',
    'nome.minLength': 'O nome deve ter pelo menos 2 caracteres',
    'nome.maxLength': 'O nome deve ter no máximo 45 caracteres',
    'email.required': 'O email é obrigatório',
    'email.email': 'Email deve ter um formato válido',
    'email.maxLength': 'Email deve ter no máximo 60 caracteres',
    'email.unique': 'Este email já está em uso',
    'senha.required': 'A senha é obrigatória',
    'senha.minLength': 'A senha deve ter pelo menos 6 caracteres',
    'senha.maxLength': 'A senha deve ter no máximo 45 caracteres',
    'senha.confirmed': 'A confirmação da senha não confere',
    'senha_confirmation.required': 'A confirmação da senha é obrigatória',
    'tipo_usuario.required': 'O tipo de usuário é obrigatório',
    'tipo_usuario.enum': 'Tipo de usuário deve ser candidato ou gestor',
    'nome_empresa.required': 'O nome da empresa é obrigatório para gestores',
    'nome_empresa.minLength': 'O nome da empresa deve ter pelo menos 2 caracteres',
    'nome_empresa.maxLength': 'O nome da empresa deve ter no máximo 100 caracteres',
    'cnpj.required': 'O CNPJ é obrigatório para gestores',
    'cnpj.regex': 'O CNPJ deve conter 14 dígitos numéricos',
    'telefone.required': 'O numero de telefone é obrigatório para candidatos',
    'telefone.minLength': 'O numero de telefone deve ter pelo menos 9 caracteres',
    'telefone.maxLength': 'O numero de telefone deve ter no máximo 11 caracteres',
    'cep.required': 'O numero de cep é obrigatório para candidatos',
    'cep.minLength': 'O numero de cep deve ter pelo menos 8 caracteres',
    'cep.maxLength': 'O numero de cep deve ter no máximo 8 caracteres',
    'endereco.required': 'O endereço é obrigatório para candidatos',
    'endereco.minLength': 'O endereço deve ter pelo menos 3 caracteres',
    'endereco.maxLength': 'O endereço deve ter no máximo 45 caracteres',
    'dnasc.required': 'A data de nascimento é obrigatória para candidatos',
    'dnasc.date': 'A data de nascimento deve ter um formato válido',
    'habilidades.array': 'As habilidades devem ser enviadas como um array',
    'habilidades.required': 'As habilidades são obrigatórias para candidatos',
    'habilidades.*.number': 'Cada habilidade deve ser um ID numérico',
    'habilidades.*.exists': 'Habilidade não encontrada no banco de dados',
    'formacoes.array': 'As formações devem ser enviadas como um array',
    'formacoes.*.curso.required': 'O curso é obrigatório',
    'formacoes.*.instituicao.required': 'A instituição é obrigatória',
    'formacoes.*.conclusao.date': 'A data de conclusão deve ter um formato válido'
  }
}