/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'


Route.get('/', async () => {
  return { hello: 'world' }
})

Route.group(() => {
  Route.post('/register', 'AuthController.register')
  Route.post('/login', 'AuthController.login')
  Route.post('/logout', 'AuthController.logout').middleware('auth')
  Route.get('/me', 'AuthController.me').middleware('auth')
  Route.delete('/user', 'AuthController.deleteUser').middleware('auth')

  Route.put('/profile', 'ProfilesController.update').middleware('auth')
  Route.put('/profile/role', 'ProfilesController.updateRole').middleware('auth')
  Route.put('/profile/password', 'ProfilesController.updatePassword').middleware('auth')
  Route.post('/profile/gestor', 'GestorsController.criarPerfilGestor').middleware('auth')
  Route.post('/profile/candidato', 'CandidatoController.criarPerfilCandidato').middleware('auth')

  // Rotas customizadas de edição
  Route.post('/candidato/edit', 'CandidatoController.editCandidato').middleware('auth')
  Route.post('/gestor/edit', 'GestorsController.editGestor').middleware('auth')
  Route.delete('/gestor/delete', 'GestorsController.deleteGestor').middleware('auth')

  // Outras rotas customizadas
  Route.post('/candidatos/formacao', 'CandidatoController.addFormacao').middleware('auth')
  Route.put('/candidatos/formacao/:id', 'CandidatoController.updateFormacao').middleware('auth')
  Route.delete('/candidatos/formacao/:id', 'CandidatoController.deleteFormacao').middleware('auth')
  Route.delete('/candidato', 'CandidatoController.deleteCandidato').middleware('auth')
  Route.get('/user/search', 'CandidatoController.search').middleware('auth')
  Route.get('/reunioes/gestor', 'ReuniaosController.gestorReunioes').middleware('auth')
  Route.put('/reunioes/:id/status', 'ReuniaosController.updateStatus').middleware('auth')


  // Rotas resource agrupadas no final
  Route.resource('candidatos', 'CandidatoController').only(['index', 'show']).middleware({
    index: 'auth',
    show: 'auth',
  })
  Route.resource('gestores', 'GestorController').only(['index', 'show'])
  Route.resource('habilidades', 'HabilidadesController')
  Route.resource('reunioes', 'ReuniaosController').middleware({
    index: 'auth',
    store: 'auth',
    show: 'auth',
    update: 'auth',
    destroy: 'auth',
  })
}).prefix('/api/')
