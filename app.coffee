express = require "express"

app = express()

async = require("async")
_ = require "underscore"
path = require "path"
callbacker = (func) ->
  (args...) ->
    (callback) ->
      func args..., (args...) ->
        callback args...

exec = callbacker require('child_process').exec
write = callbacker require("fs").writeFile
read = callbacker require("fs").readFile
readdir = callbacker require("fs").readdir

load = (project, file, res) ->
  command = "cat ../#{project}/#{file}"
  console.log command
  exec(command) (err, c) ->
    res.send c

  
save = (project, file, content, res) ->
  async.series [
    exec("mkdir -p ../#{project}")
    write("../#{project}/#{file}", content)
  ], (err) ->
    console.log err
    console.log "saved"
    res.send "ok"

cache = {}
enableCORS = (req, res, next) ->
  res.setHeader "Access-Control-Allow-Origin", "*"
  res.setHeader "Access-Control-Allow-Headers", "Content-Type, X-Requested-With"
  next()

app.configure () ->
  app.use enableCORS
  app.use express.bodyParser()

# todo something that invalidates cache

set = (pf, x, cb) ->
  pf = __dirname + pf
  p = path.dirname pf
  f = path.basename pf
  e = path.extname pf
  if e
    write(pf, x) (err) ->
      cache[pf] = x
      if p of cache
        cache[p].push pf
      cb err
  
    
# todo method override?

get = (pf, cb) ->
  pf = __dirname + pf
  if pf of cache
    _.defer -> cb cache[pf]

  p = path.dirname pf
  f = path.basename pf
  e = path.extname pf
  if e
    # for now if it has an extension, its a file
    read(pf) (err, x) ->
      if e is ".json"
        x = JSON.parse x
      cache[pf] = x
      cb err, x
  else
    # its a folder for now
    readdir(pf) (err, files) ->
      cache[pf] = x
      cb err, x
    
    
      
    
app.post /.*/, (req,res) ->
  set req.url, req.params, (err, val) ->
    res.send val
  

app.get /.*/, (req, res) ->
  res.send [req.params,req.url,req.query,req._parsedUrl,_.keys req]
  if req._parsedUrl.query
    get req._parsedUrl.pathname, (err, val) ->
      res.send val
  else
    get req._parsedUrl.pathname, (err, val) ->
      res.send val

app.listen 8501
