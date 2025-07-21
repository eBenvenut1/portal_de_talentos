// app/Controllers/Http/ReuniaoController.ts
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Reuniao from 'App/Models/Reuniao'
import Gestor from 'App/Models/Gestor'
import { DateTime } from 'luxon'
import Candidato from 'App/Models/Candidato'
import Mail from '@ioc:Adonis/Addons/Mail'

export default class ReuniaoController {

  // Função auxiliar para calcular dias úteis
  private calcularProximosDiasUteis(dias: number): DateTime {
    let data = DateTime.now()
    let diasAdicionados = 0

    while (diasAdicionados < dias) {
      data = data.plus({ days: 1 })
      // 6 = Sábado, 7 = Domingo
      if (data.weekday !== 6 && data.weekday !== 7) {
        diasAdicionados++
      }
    }
    data = data.set({ hour: 14, minute: 0, second: 0, millisecond: 0 })
    return data
  }

  // Função auxiliar para enviar email de cancelamento de reunião
  private async enviarEmailCancelamento(reuniao: any, motivo: string = 'conta excluída') {
    try {
      // Enviar email para o candidato
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

      // Enviar email para o gestor
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
    } catch (emailError) {
      console.error('Erro ao enviar email de cancelamento:', emailError)
      // Não falha o cancelamento se o email falhar
    }
  }


  public async index({ response, auth }: HttpContextContract) {
    const user = auth.use('api').user!
    const candidato = await Candidato.query()
      .where('users_id', user.id)
      .firstOrFail()

    const reunioes = await Reuniao.query()
      .where('candidato_id', candidato.id)
      .preload('gestor', (gestorQuery) => {
        gestorQuery.preload('user')
      })
      .preload('candidato', (candidatoQuery) => {
        candidatoQuery.preload('user')
      })
      .orderByRaw(`
        CASE 
          WHEN status = 'Pendente' THEN 1
          WHEN status = 'Concluido' THEN 2
          WHEN status = 'Cancelada' THEN 3
          ELSE 4
        END
      `)
      .orderBy('data', 'asc')

    return response.ok({
      reunioes
    })
  }

  public async store({ request, response, auth }: HttpContextContract) {
    const user = auth.use('api').user!
    const { gestor_id, candidato_id } = request.only([
      'gestor_id', 'data', 'candidato_id'
    ])


    // Verificar se o gestor existe
    const gestor = await Gestor.findOrFail(gestor_id)


    // Verificar se o candidato existe (se fornecido)
    let candidatoIdParaReuniao = user.id
    if (candidato_id) {
      const candidatoUser = await Candidato.findOrFail(candidato_id)
      candidatoIdParaReuniao = candidatoUser.id
    }

    try {
      const reuniao = await Reuniao.create({
        gestorId: gestor.id,
        candidatoId: candidatoIdParaReuniao, // Mudança: usar candidatoId
        data: this.calcularProximosDiasUteis(3),
        status: "Pendente"
      })

      await reuniao.preload('gestor', (gestorQuery) => {
        gestorQuery.preload('user')
      })
      await reuniao.preload('candidato', (candidatoQuery) => {
        candidatoQuery.preload('user')
      })

      // Enviar email para o candidato
      try {
        await Mail.send((message) => {
          message
            .to(reuniao.candidato.user.email)
            .from('enzo.henrique@quaestum.com.br', 'Portal de Talentos')
            .subject('Reunião Agendada - Portal de Talentos')
            .html(`
      <h2>Reunião Agendada</h2>
      <p>Olá, ${reuniao.candidato.user.nome}!</p>
      <p>Uma reunião foi agendada para você com os seguintes detalhes:</p>
      <ul>
        <li><strong>Data:</strong> ${reuniao.data.toFormat('dd/MM/yyyy HH:mm')}</li>
        <li><strong>Gestor:</strong> ${reuniao.gestor.user.nome}</li>
        <li><strong>Empresa:</strong> ${reuniao.gestor.NomeEmpresa}</li>
      </ul>
      <p>Fique atento ao horário e prepare-se para a reunião!</p>
      <p>Atenciosamente,<br>Equipe do Portal de Talentos</p>
    `)
        })
      } catch (emailError) {
        console.error('Erro ao enviar email:', emailError)
        // Não falha a criação da reunião se o email falhar
      }

      return response.created({
        message: 'Reunião agendada com sucesso',
        reuniao
      })
    } catch (error) {
      console.error('Erro ao criar reunião:', error)
      console.error('Stack trace:', error.stack)
      throw error
    }
  }

  public async show({ params, response }: HttpContextContract) {
    const reuniao = await Reuniao.query()
      .where('id', params.id)
      .preload('gestor', (gestorQuery) => {
        gestorQuery.preload('user')
      })
      .preload('candidato', (candidatoQuery) => {
        candidatoQuery.preload('user')
      })
      .firstOrFail()

    return response.ok({
      reuniao
    })
  }

  public async update({ params, request, response, auth }: HttpContextContract) {
    const user = auth.use('api').user!;

    // Primeiro, vamos tentar diferentes formas de obter os dados
    let dados: any;

    try {
      // Método 1: Tentar request.all() primeiro
      dados = request.all();
      console.log('request.all():', dados);

      // Método 2: Se request.all() não funcionar, tentar parsear o raw
      if (!dados.data || Object.keys(dados).length === 0) {
        const rawBody = request.raw();
        console.log('Raw body:', rawBody);

        if (typeof rawBody === 'string') {
          dados = JSON.parse(rawBody);
        } else if (rawBody && typeof rawBody === 'object') {
          dados = rawBody;
        }
      }

      // Método 3: Tentar request.only() como fallback
      if (!dados.data) {
        dados = request.only(['data']);
      }

    } catch (parseError) {
      console.error('Erro ao parsear body:', parseError);
      return response.badRequest({
        message: 'Formato de requisição inválido. Certifique-se de enviar JSON válido.'
      });
    }

    const { data } = dados;

    console.log('Data extraída:', data);

    if (!data) {
      return response.badRequest({
        message: 'A nova data da reunião é obrigatória.',
        dadosRecebidos: dados
      });
    }

    let novaData: DateTime;
    try {
      // Aceita tanto data quanto data/hora
      novaData = DateTime.fromISO(data);
      if (!novaData.isValid) {
        console.error('Data inválida:', data);
        throw new Error('Data inválida');
      }
    } catch {
      return response.badRequest({
        message: 'Formato de data inválido. Use ISO 8601 (ex: 2026-07-01T10:00:00).',
        dataRecebida: data
      });
    }

    // Nova data deve ser estritamente após agora
    if (novaData <= DateTime.now()) {
      return response.badRequest({
        message: 'A nova data da reunião deve ser após o momento atual.',
        dataRecebida: novaData.toISO(),
        dataAtual: DateTime.now().toISO()
      });
    }

    try {
      const reuniao = await Reuniao.query()
        .where('id', params.id)
        .where((query) => {
          query.where('candidato_id', user.id).orWhere('gestor_id', user.id)
        })

        .firstOrFail();

      reuniao.data = novaData;
      reuniao.status = "Pendente"
      await reuniao.save();

      // Recarregar a reunião com os relacionamentos
      await reuniao.preload('gestor', (gestorQuery) => {
        gestorQuery.preload('user');
      });
      await reuniao.preload('candidato', (candidatoQuery) => {
        candidatoQuery.preload('user');
      });

      return response.ok({
        message: 'Reunião reagendada com sucesso',
        reuniao
      });

    } catch (error) {
      console.error('Erro ao atualizar reunião:', error);

      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({
          message: 'Reunião não encontrada ou você não tem permissão para editá-la.'
        });
      }

      return response.internalServerError({
        message: 'Erro interno do servidor ao atualizar reunião.'
      });
    }
  }

  public async updateStatus({ params, request, response, auth }: HttpContextContract) {
    const user = auth.use('api').user!;

    // Primeiro, vamos tentar diferentes formas de obter os dados
    let dados: any;

    try {
      // Método 1: Tentar request.all() primeiro
      dados = request.all();
      console.log('request.all():', dados);

      // Método 2: Se request.all() não funcionar, tentar parsear o raw
      if (!dados.status || Object.keys(dados).length === 0) {
        const rawBody = request.raw();
        console.log('Raw body:', rawBody);

        if (typeof rawBody === 'string') {
          dados = JSON.parse(rawBody);
        } else if (rawBody && typeof rawBody === 'object') {
          dados = rawBody;
        }
      }

      // Método 3: Tentar request.only() como fallback
      if (!dados.status) {
        dados = request.only(['status']);
      }

    } catch (parseError) {
      console.error('Erro ao parsear body:', parseError);
      return response.badRequest({
        message: 'Formato de requisição inválido. Certifique-se de enviar JSON válido.'
      });
    }

    const { status } = dados;

    console.log('Status extraído:', status);
    console.log('Tipo do status:', typeof status);

    // Lista de status válidos
    const statusValidos = ['Cancelado', 'Concluido', 'Pendente'];

    if (!status) {
      return response.badRequest({
        message: 'Status é obrigatório.',
        statusValidos,
        dadosRecebidos: dados
      });
    }

    if (!statusValidos.includes(status)) {
      return response.badRequest({
        message: 'Status inválido.',
        statusRecebido: status,
        statusValidos,
        dadosRecebidos: dados
      });
    }

    try {
      const reuniao = await Reuniao.query()
        .where('id', params.id)
        .where((query) => {
          query.where('candidato_id', user.id).orWhere('gestor_id', user.id)
        })
        .firstOrFail();

      reuniao.status = status;
      await reuniao.save();

      // Recarregar a reunião com os relacionamentos
      await reuniao.preload('gestor', (gestorQuery) => {
        gestorQuery.preload('user');
      });
      await reuniao.preload('candidato', (candidatoQuery) => {
        candidatoQuery.preload('user');
      });

      return response.ok({
        message: 'Status atualizado com sucesso',
        reuniao
      });

    } catch (error) {
      console.error('Erro ao atualizar status da reunião:', error);

      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({
          message: 'Reunião não encontrada ou você não tem permissão para editá-la.'
        });
      }

      return response.internalServerError({
        message: 'Erro interno do servidor ao atualizar status da reunião.'
      });
    }
  }

  public async destroy({ params, response, auth }: HttpContextContract) {
    const user = auth.use('api').user!

    const reuniao = await Reuniao.query()
      .where('id', params.id)
      .where('candidato_id', user.id) // Mudança: usar candidato_id
      .firstOrFail()

    await reuniao.delete()

    return response.ok({
      message: 'Reunião cancelada com sucesso'
    })
  }

  // Método específico para gestores verem suas reuniões
  public async gestorReunioes({ response, auth }: HttpContextContract) {
    const user = auth.use('api').user!

    const gestor = await Gestor.query()
      .where('users_id', user.id)
      .firstOrFail()

    const reunioes = await Reuniao.query()
      .where('gestor_id', gestor.id)
      .preload('candidato', (candidatoQuery) => {
        candidatoQuery.preload('user')
      })
      .preload('gestor', (gestorQuery) => {
        gestorQuery.preload('user')
      })
      .orderByRaw(`
        CASE 
          WHEN status = 'Pendente' THEN 1
          WHEN status = 'Concluido' THEN 2
          WHEN status = 'Cancelada' THEN 3
          ELSE 4
        END
      `)
      .orderBy('data', 'asc')

    return response.ok({
      reunioes
    })
  }
}


