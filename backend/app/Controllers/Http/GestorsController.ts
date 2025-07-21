// app/Controllers/Http/GestorController.ts
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Gestor from 'App/Models/Gestor'
import Database from '@ioc:Adonis/Lucid/Database'
import Candidato from 'App/Models/Candidato'
import Reuniao from 'App/Models/Reuniao'
import Mail from '@ioc:Adonis/Addons/Mail'

export default class GestorController {
  // Função auxiliar para enviar emails de cancelamento de reuniões do gestor
  private async enviarEmailsCancelamentoGestor(gestorId: number, motivo: string) {
    try {
      // Buscar reuniões pendentes onde o gestor participa
      const reunioes = await Reuniao.query()
        .where('gestor_id', gestorId)
        .where('status', 'Pendente')
        .preload('candidato', (candidatoQuery) => {
          candidatoQuery.preload('user')
        })
        .preload('gestor', (gestorQuery) => {
          gestorQuery.preload('user')
        })

      // Enviar emails para cada reunião
      for (const reuniao of reunioes) {
        // Email para o candidato
        await Mail.send((message) => {
          message
            .to(reuniao.candidato.user.email)
            .from('enzo.henrique@quaestum.com.br', 'Portal de Talentos')
            .subject('Reunião Cancelada - Portal de Talentos')
            .html(`
      <h2>Reunião Cancelada</h2>
      <p>Olá, ${reuniao.candidato.user.nome}!</p>
      <p>Infelizmente a reunião agendada foi cancelada devido ao seguinte motivo:</p>
      <p><strong>Motivo:</strong> ${motivo}</p>
      <p><strong>Detalhes da reunião cancelada:</strong></p>
      <ul>
        <li><strong>Data:</strong> ${reuniao.data.toFormat('dd/MM/yyyy HH:mm')}</li>
        <li><strong>Gestor:</strong> ${reuniao.gestor.user.nome}</li>
        <li><strong>Empresa:</strong> ${reuniao.gestor.NomeEmpresa}</li>
      </ul>
      <p>Pedimos desculpas pelo inconveniente. Você pode agendar uma nova reunião através do portal.</p>
      <p>Atenciosamente,<br>Equipe do Portal de Talentos</p>
    `)
        })

        // Email para o gestor
        await Mail.send((message) => {
          message
            .to(reuniao.gestor.user.email)
            .from('enzo.henrique@quaestum.com.br', 'Portal de Talentos')
            .subject('Reunião Cancelada - Portal de Talentos')
            .html(`
      <h2>Reunião Cancelada</h2>
      <p>Olá, ${reuniao.gestor.user.nome}!</p>
      <p>Infelizmente a reunião agendada foi cancelada devido ao seguinte motivo:</p>
      <p><strong>Motivo:</strong> ${motivo}</p>
      <p><strong>Detalhes da reunião cancelada:</strong></p>
      <ul>
        <li><strong>Data:</strong> ${reuniao.data.toFormat('dd/MM/yyyy HH:mm')}</li>
        <li><strong>Candidato:</strong> ${reuniao.candidato.user.nome}</li>
        <li><strong>Empresa:</strong> ${reuniao.gestor.NomeEmpresa}</li>
      </ul>
      <p>Pedimos desculpas pelo inconveniente. Você pode agendar uma nova reunião através do portal.</p>
      <p>Atenciosamente,<br>Equipe do Portal de Talentos</p>
    `)
        })
      }
    } catch (emailError) {
      console.error('Erro ao enviar emails de cancelamento:', emailError)
      // Não falha a exclusão se o email falhar
    }
  }

  public async index({ response }: HttpContextContract) {
    const gestores = await Gestor.query()
      .preload('user')

    return response.ok({
      gestores
    })
  }

  public async show({ params, response }: HttpContextContract) {
    const gestor = await Gestor.query()
      .where('id', params.id)
      .preload('user')
      .firstOrFail()

    return response.ok({
      gestor
    })
  }

  public async editGestor({ request, response, auth }: HttpContextContract) {
    const user = auth.use('api').user!
    const { nome_empresa, cnpj } = request.only(['nome_empresa', 'cnpj'])

    console.log('Body recebido:', request.all());

    if (!nome_empresa || !cnpj) {
      return response.badRequest({
        message: 'Nome da empresa e CNPJ são obrigatórios.'
      })
    }

    const gestor = await Gestor.query().where('users_id', user.id).first()
    if (!gestor) {
      return response.notFound({ message: 'Gestor não encontrado para este usuário.' })
    }

    gestor.NomeEmpresa = nome_empresa
    gestor.cnpj = cnpj
    await gestor.save()

    return response.ok({
      message: 'Gestor atualizado com sucesso',
      gestor: {
        id: gestor.id,
        nome_empresa: gestor.NomeEmpresa,
        cnpj: gestor.cnpj
      }
    })
  }

  public async criarPerfilGestor({ request, auth, response }: HttpContextContract) {
    const user = auth.use('api').user!;
    const { nome_empresa, cnpj } = request.only(['nome_empresa', 'cnpj']);

    if (!nome_empresa || !cnpj) {
      return response.badRequest({ message: 'Nome da empresa e CNPJ são obrigatórios.' });
    }

    // Verifica se já existe
    const existe = await Gestor.query().where('users_id', user.id).first();
    if (existe) {
      return response.badRequest({ message: 'Perfil de gestor já existe.' });
    }

    const gestor = await Gestor.create({
      usersId: user.id,
      NomeEmpresa: nome_empresa,
      cnpj,
    });

    // Atualiza role_atual se quiser
    user.role_atual = 'gestor';
    await user.save();

    return response.ok({ message: 'Perfil de gestor criado com sucesso.', gestor });
  }

  public async deleteGestor({ auth, response }: HttpContextContract) {
    const user = auth.use('api').user!;
    const gestor = await Gestor.query().where('users_id', user.id).first();
    if (!gestor) {
      return response.notFound({ message: 'Gestor não encontrado para este usuário.' });
    }

    // Enviar emails de cancelamento antes de cancelar as reuniões
    await this.enviarEmailsCancelamentoGestor(gestor.id, 'perfil de gestor excluído');

    // Cancelar reuniões pendentes onde o gestor participa
    await Database
      .from('reunioes')
      .where('gestor_id', gestor.id)
      .where('status', 'Pendente')
      .update({ status: 'Cancelada' });

    await gestor.delete(); // Isso remove o gestor

    // Verificar se o usuário tem perfil de candidato
    const candidato = await Candidato.query().where('users_id', user.id).first();
    if (candidato) {
      user.role_atual = 'candidato';
    } else {
      user.role_atual = '';
    }
    await user.save();

    return response.ok({ message: 'Gestor removido com sucesso.' });
  }
}