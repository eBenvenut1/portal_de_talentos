/*
|--------------------------------------------------------------------------
| Application providers
|--------------------------------------------------------------------------
|
| Aqui você registra todos os providers que o AdonisJS deve carregar ao
| iniciar o projeto. Eles são responsáveis por registrar serviços no
| contêiner IoC, como Database, Auth, Validator etc.
|
*/

export const providers = [
  '@adonisjs/core',
  '@adonisjs/lucid'
]

/*
|--------------------------------------------------------------------------
| Preloads
|--------------------------------------------------------------------------
|
| Você pode adicionar arquivos que precisam ser executados automaticamente
| antes da aplicação iniciar. Exemplo: configuração de serviços externos,
| listeners de eventos etc.
|
*/
export const preloads: string[] = []

/*
|--------------------------------------------------------------------------
| Aliases
|--------------------------------------------------------------------------
|
| Aqui você pode registrar aliases personalizados para facilitar a importação
| de classes do seu projeto. É opcional.
|
*/
export const aliases: Record<string, string> = {}

/*
|--------------------------------------------------------------------------
| Commands
|--------------------------------------------------------------------------
|
| Aqui você pode registrar comandos customizados da aplicação (como o seu
| `migration:fresh`).
|
*/
export const commands: string[] = []

/*
|--------------------------------------------------------------------------
| Ace Providers (opcional)
|--------------------------------------------------------------------------
|
| Se você quiser carregar providers só quando executar comandos (via `node ace`),
| pode registrá-los aqui. Ex: Testes, comandos CLI, etc.
|
*/
export const aceProviders: string[] = []
