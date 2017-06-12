/**
 * Created by jalava on 3/21/2017.
 */
var _ = require('underscore');

function CrudSvc(repo, preOps, postOps) {
  function safeRunPostOps(verb, data) {
    var result;

    if (postOps && postOps.hasOwnProperty(verb)) {
      _.map(postOps[verb], function (val, key, list) {
        result = data = val(data);
      })
    } else {
      result = data;
    }

    return result;
  }

  function safeRunPreOps(verb, options) {
    if (preOps && preOps.hasOwnProperty(verb)) {
      options.preOps = {};
      options.preOps[verb] = preOps[verb];
    }

    return options;
  }

  var get = (event, context, callback) => {
    const RESPONSE = {
      OK: {
        statusCode: 200,
        message: []
      },
      ERROR: {
        status: 400,
        message: 'Something went wrong. Please try again.'
      }
    };

    var options = safeRunPreOps('get', {});

    if (event.hasOwnProperty('path') && event.path.hasOwnProperty('id')) {
      options.query = {};
      options.query = {
        id: event.path.id
      }
    }

    if (event.query) {
      options.query = options.query || {};

      var keys = Object.keys(event.query);
      _.forEach(keys, function (val) {
        options.query[val] = event.query[val];
      });
    }

    repo.get(options)
      .then(function (data) {
        console.log('inside custom get response' + data);
        var postOpResult = safeRunPostOps('get', data);

        if (postOpResult.then) {
          postOpResult.then(function (postOpResult) {
            callback(null, postOpResult);
          });
        } else {
          callback(null, postOpResult);
        }
      }, function (err) {
        RESPONSE.ERROR.err = err;
        callback(null, RESPONSE.ERROR);
      });
  };

  var del = (event, context, callback)=> {
    const RESPONSE = {
      OK: {
        statusCode: 204,
        message: []
      },
      ERROR: {
        status: 400,
        message: 'Something went wrong. Please try again.'
      }
    };

    var options = safeRunPreOps('delete', {});

    if (event.hasOwnProperty('path') && event.path.hasOwnProperty('id')) {
      options.query = {
        id: event.path.id
      }
    }

    repo.delete(options)
      .then(function (data) {
        callback(null, safeRunPostOps('delete', data));
      }, function (err) {
        RESPONSE.ERROR.err = err;
        callback(null, RESPONSE.ERROR);
      });
  };

  var add = (event, context, callback) => {
    var parsedBody = event.body;

    const RESPONSE = {
      OK: {
        statusCode: 201,
        message: []
      },
      ERROR: {
        status: 400,
        message: 'Something went wrong. Please try again.'
      }
    };

    var options = safeRunPreOps('post', {});

    if (parsedBody) {
      options.body = parsedBody;
    }

    repo.add(options)
      .then(function (data) {
        callback(null, safeRunPostOps('post', data));
      }, function (err) {
        RESPONSE.ERROR.err = err;
        callback(null, RESPONSE.ERROR);
      });
  };

  var set = (event, context, callback) => {
    var parsedBody = event.body;

    const RESPONSE = {
      OK: {
        statusCode: 204,
        message: []
      },
      ERROR: {
        status: 400,
        message: 'Something went wrong. Please try again.'
      }
    };

    var options = safeRunPreOps('put', {});

    if (parsedBody) {
      options.body = parsedBody;
    }

    repo.set(options)
      .then(function (data) {
        callback(null, safeRunPostOps('put', data));
      }, function (err) {
        RESPONSE.ERROR.err = err;
        callback(null, RESPONSE.ERROR);
      });
  };

  return {
    get: get,
    post: add,
    put: set,
    del: del
  }
}

module.exports = CrudSvc;