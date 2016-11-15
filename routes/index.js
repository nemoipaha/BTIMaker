module.exports = function (router) {
  router.get('/', require('../middleware/loadUser'), require('./frontPage'));
  router.get('/editor', require('../middleware/loadUser'), require('./editor'));
  router.post('/option', require('./option'));
  router.post('/user/login', require('./login'));
  router.post('/logout', require('./logout'));
  router.get('/extends', require('./extends'));
  router.post('/user', require('./user'));
  router.post('/user/projects/update', require('./updateUserProjects'));
  router.post('/user/projects/delete', require('./deleteUserProjects'));
  router.post('/language/:id/:type', require('./language'));
  router.get('/controller', require('./controller'));
};