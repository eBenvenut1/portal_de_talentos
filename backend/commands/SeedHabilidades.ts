// commands/SeedHabilidades.ts
import { BaseCommand } from '@adonisjs/core/build/standalone'
import Habilidade from 'App/Models/Habilidade'

export default class SeedHabilidades extends BaseCommand {
  public static commandName = 'seed:habilidades'
  public static description = 'Executa o seeder de habilidades'

  public async run() {
    this.logger.info('🌱 Executando seeder de habilidades...')
    
    try {
      const habilidades = [
        { nome: 'JavaScript' },
        { nome: 'Python' },
        { nome: 'Java' },
        { nome: 'C#' },
        { nome: 'PHP' },
        { nome: 'React' },
        { nome: 'Angular' },
        { nome: 'Vue.js' },
        { nome: 'Node.js' },
        { nome: 'Express.js' },
        { nome: 'Django' },
        { nome: 'Flask' },
        { nome: 'Spring Boot' },
        { nome: '.NET' },
        { nome: 'Laravel' },
        { nome: 'MySQL' },
        { nome: 'PostgreSQL' },
        { nome: 'MongoDB' },
        { nome: 'Redis' },
        { nome: 'Docker' },
        { nome: 'Kubernetes' },
        { nome: 'AWS' },
        { nome: 'Azure' },
        { nome: 'Google Cloud' },
        { nome: 'Git' },
        { nome: 'GitHub' },
        { nome: 'GitLab' },
        { nome: 'Jenkins' },
        { nome: 'CI/CD' },
        { nome: 'Agile' },
        { nome: 'Scrum' },
        { nome: 'Kanban' },
        { nome: 'Jira' },
        { nome: 'Trello' },
        { nome: 'Figma' },
        { nome: 'Adobe XD' },
        { nome: 'Sketch' },
        { nome: 'HTML' },
        { nome: 'CSS' },
        { nome: 'SASS' },
        { nome: 'TypeScript' },
        { nome: 'GraphQL' },
        { nome: 'REST API' },
        { nome: 'Microservices' },
        { nome: 'Serverless' },
        { nome: 'Machine Learning' },
        { nome: 'Data Science' },
        { nome: 'Big Data' },
        { nome: 'DevOps' },
        { nome: 'Linux' }
      ]

      for (const habilidade of habilidades) {
        await Habilidade.create(habilidade)
        this.logger.info(`✅ Habilidade "${habilidade.nome}" criada`)
      }
      
      this.logger.success('🎉 Seeder de habilidades executado com sucesso!')
    } catch (error) {
      this.logger.error('❌ Erro ao executar seeder de habilidades')
      this.logger.error(error.message)
      throw error
    }
  }
} 