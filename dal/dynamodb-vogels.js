/**
 * Created by Jose on 3/18/2017.
 */
'use strict';
var _ = require('underscore');

function decorateWithPagination(anyQueryStrings, options, result) {
  // Decorate with pagination stuff
  if (anyQueryStrings && options.query.hasOwnProperty('pageSize')) {
    result.limit(options.query.pageSize).descending();
  }

  if (anyQueryStrings && options.query.hasOwnProperty('pageSize') && options.query.hasOwnProperty('startKey')) {
    var startKey = {
        id: options.query.startKey
      },
        queryParams = Object.keys(options.query);

    _.forEach(queryParams, function (val, key, list) {
      if (val !== 'pageSize' || val !== 'startKey'){
        startKey[val] = options.query[val];
      }
    });

    console.log('start key: ' + JSON.stringify(startKey));
    result.limit(options.query.pageSize).descending().startKey(startKey);
  }
  // End pagination stuff
}

module.exports = function (Model, customOps) {
  var get = (options)=> {
    let result;
    let preOpResult = true;
    if (options.hasOwnProperty('preOp') && options.preOp !== undefined && options.preOp !== null) {
      preOpResult = options.preOp();
    }

    if (preOpResult) {
      var anyQueryStrings = options.hasOwnProperty('query');
      if (customOps && customOps.hasOwnProperty('get')) {
        result = customOps.get(Model, options);
        if (!result.execAsync){
          var fatal = 'Custom Operations must return promise.';
          throw fatal;
        }

        decorateWithPagination(anyQueryStrings, options, result);
      } else {
        if (anyQueryStrings && options.query.hasOwnProperty('id')) {
          result = Model
            .query(options.query.id.toString())

          decorateWithPagination(anyQueryStrings, options, result);
        } else {
          result = Model
            .scan()
            .loadAll()
        }
      }

      result = result.execAsync();
    } else {
      result = Promise.reject(new Error('Pre op failed.'));
    }

    return result;
  };

  var add = (options)=> {
    let result;
    let preOpResult = true;
    if (options.hasOwnProperty('preOp') && options.preOp !== undefined && options.preOp !== null) {
      preOpResult = options.preOp(options);
    }

    if (preOpResult) {
      if (options.hasOwnProperty('body')) {
        result = Model.createAsync(options.body);
      }
    } else {
      result = Promise.reject(new Error('Pre op failed.'))
    }

    return result;
  };

  var set = (options)=> {
    let result;
    let preOpResult = true;
    if (options.hasOwnProperty('preOp') && options.preOp !== undefined && options.preOp !== null) {
      preOpResult = options.preOp(options);
    }

    if (preOpResult) {
      if (options.hasOwnProperty('body')) {
        result = Model.updateAsync(options.body);
      }
    } else {
      result = Promise.reject(new Error('Pre op failed.'))
    }


    return result;
  };

  var del = (options)=> {
    let result;
    let preOpResult = true;
    if (options.hasOwnProperty('preOp') && options.preOp !== undefined && options.preOp !== null) {
      preOpResult = options.preOp();
    }

    if (preOpResult) {
      if (options && options.hasOwnProperty('query') && options.query.hasOwnProperty('id')) {
        result = Model.destroyAsync(options.query.id.toString());
      } else {
        result = Promise.reject(new Error('Pre op failed.'))
      }

    }

    return result;
  };

  return {
    add: add,
    set: set,
    get: get,
    delete: del
  }
};
