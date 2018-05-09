/**
 * Created by jalava on 3/22/2017.
 */
'use strict'
function VerbRouter(get, post, put, del) {

  var route = function (event, context, callback) {
    var verb = event.httpMethod;

    if (verb === 'GET') {
      get(event, context, callback);
    } else if (verb === 'POST') {
      post(event, context, callback);
    } else if (verb === 'PUT') {
      put(event, context, callback);
    } else if (verb === 'DELETE') {
      del(event, context, callback);
    } else {
      callback(null, {
        status: 200,
        message: 'Method not supported.'
      });
    }
  };

  return route;
}

module.exports = VerbRouter;