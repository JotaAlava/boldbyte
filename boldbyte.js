/**
 * Created by Jose on 6/11/2017.
 */
var db = require('./dal/dynamodb-vogels'),
  CrudSvc = require('./svc/crudSvc'),
  Router = require('./router/router');

/*
 options can contain:
 preOps,
 postOps,
 customOps (these are for the repository custom queries)
 */
module.exports = function RouteConstructor(Model, options) {
  var repo = new db(Model, options && options.customOps),
    preOps = options && options.preOps,
    postOps = options && options.postOps,
    crudSvc = new CrudSvc(repo, preOps, postOps),
    router = new Router(crudSvc.get, crudSvc.post, crudSvc.put, crudSvc.del);

  return router;
};

/* TESTING BELOW */
//var sut = new require('./boldbyte')(),
//  context = undefined,
//  event = {
//    method: 'GET'
//  };
//
//
//sut(event, context, console.log);
