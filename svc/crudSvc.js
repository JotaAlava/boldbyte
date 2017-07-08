/**
 * Created by jalava on 3/21/2017.
 */
'use strict'
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

  /*
   * This guy has to return an  array of promises.
   */
  function safeRunPreOps(verb, options) {
    var result = [];

    if (options.hasOwnProperty('preOps') && options.preOps !== undefined && options.preOps !== null) {
      var preOps = options.preOps[verb];
      _.map(preOps, function (val, key, list) {
        result.push(preOps[key](options));
      })
    }

    return result;
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

  var execute = (verb)=> {
    return (event, context, callback) => {
      let parsedBody = event.body,
        options = {
          preOps: preOps,
          postOps: postOps,
          repo: repo
        };

      if (parsedBody) {
        options.body = parsedBody;
      }

      // This if is to accomodate the delete.
      if (event.hasOwnProperty('path') && event.path.hasOwnProperty('id')) {
        options.query = {
          id: event.path.id
        }
      }

      var arrayOfPreOpPromises = safeRunPreOps(verb, options);

      Promise.all(arrayOfPreOpPromises)
        .then(()=> {
          // if all pre ops passed, then call the repo
          repo[verb](options)
            .then(function (data) {
              // I don't see a reason why post ops should delay the end of execution...
              callback(null, safeRunPostOps(verb, data));
            }, function (err) {
              callback(null, {
                  statusCode: 400,
                  message: 'Something went wrong. Please try again.'
                });
            });
        })
        .catch(()=> {
          // At least one promise failed...
          callback(null, {
            statusCode: 400,
            message: 'Pre ops failed.'
          });
        });
    }
  };

  return {
    get: get,
    post: execute('post'),
    put: execute('put'),
    del: execute('delete')
  }
}

module.exports = CrudSvc;