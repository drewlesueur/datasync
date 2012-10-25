(function() {
  var app, async, cache, callbacker, enableCORS, exec, express, get, load, path, read, readdir, save, set, write, _,
    __slice = Array.prototype.slice;

  express = require("express");

  app = express();

  async = require("async");

  _ = require("underscore");

  path = require("path");

  callbacker = function(func) {
    return function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return function(callback) {
        return func.apply(null, __slice.call(args).concat([function() {
          var args;
          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          return callback.apply(null, args);
        }]));
      };
    };
  };

  exec = callbacker(require('child_process').exec);

  write = callbacker(require("fs").writeFile);

  read = callbacker(require("fs").readFile);

  readdir = callbacker(require("fs").readdir);

  load = function(project, file, res) {
    var command;
    command = "cat ../" + project + "/" + file;
    console.log(command);
    return exec(command)(function(err, c) {
      return res.send(c);
    });
  };

  save = function(project, file, content, res) {
    return async.series([exec("mkdir -p ../" + project), write("../" + project + "/" + file, content)], function(err) {
      console.log(err);
      console.log("saved");
      return res.send("ok");
    });
  };

  cache = {};

  enableCORS = function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Requested-With");
    return next();
  };

  app.configure(function() {
    app.use(enableCORS);
    return app.use(express.bodyParser());
  });

  set = function(pf, x, cb) {
    var e, f, p;
    pf = __dirname + pf;
    p = path.dirname(pf);
    f = path.basename(pf);
    e = path.extname(pf);
    if (e) {
      return write(pf, x)(function(err) {
        cache[pf] = x;
        if (p in cache) cache[p].push(pf);
        return cb(err);
      });
    }
  };

  get = function(pf, cb) {
    var e, f, p;
    pf = __dirname + pf;
    if (pf in cache) {
      _.defer(function() {
        return cb(cache[pf]);
      });
    }
    p = path.dirname(pf);
    f = path.basename(pf);
    e = path.extname(pf);
    if (e) {
      return read(pf)(function(err, x) {
        if (e === ".json") x = JSON.parse(x);
        cache[pf] = x;
        return cb(err, x);
      });
    } else {
      return readdir(pf)(function(err, files) {
        cache[pf] = x;
        return cb(err, x);
      });
    }
  };

  app.post(/.*/, function(req, res) {
    return set(req.url, req.params, function(err, val) {
      return res.send(val);
    });
  });

  app.get(/.*/, function(req, res) {
    res.send([req.params, req.url, req.query, req._parsedUrl, _.keys(req)]);
    if (req._parsedUrl.query) {
      return get(req._parsedUrl.pathname, function(err, val) {
        return res.send(val);
      });
    } else {
      return get(req._parsedUrl.pathname, function(err, val) {
        return res.send(val);
      });
    }
  });

  app.listen(8501);

}).call(this);
