###
todo
 syncing with a server
 tweaking history based on merging
 slices that a client can handle

###
poorModule "saver", () ->
  uuid = () ->
  
  s = {}
  s.map = () ->
    m = {}
    r = {}
    m.raw = r
    m.id = uuid()
    history = []
    history_stack = []
    history_index = 0
    
    m._history = history
    m.set = (key,val) ->
      old_val = r[key]
      if history_index != history.length
        history_stack.push history
      
      history.push ["set",key, val, old_val]
      r[key] = val
      history_index += 1

    m.get = (key) ->
      r[key]
   
    m.undo = () ->
      return if history_index == 0
      history_index -= 1
      move = history[history_index]
      m.apply_opposite(move)

    m.apply_opposite = (change) ->
      [key, new_val, old_val] = change
      r[key] = old_val

    m.redo = () ->
      return if history_index == history.length
      history_index += 1
      move = history[history_index]
      m.apply_change move

    m.appy_change = (change) ->
      [key, new_val, old_val] = move
      r[key] = new_val

    m.toJSON = () ->
      r

    m.to_json = () ->
      JSON.stringify m
      
    m

  s.list = (arr) ->
    l = {}
    l.id = uuid
    r = []
    l.raw = r
    history = []
    history_stack = []
    history_index = 0

    l._history = history
    l.set = (index, val) ->
      l.splice index, 1, [val]

    l.get = (key) ->
      r[key]

    l.size = () ->
      r.length
    
    l.splice = (start, length, replace_list) ->
      old_section = r.splice.apply r, [start, length].concat(replace_list)
      if history_index != history.length
        history_stack.push history
      history = history.slice 0, history_index
      history.push [start, length, replace_list, old_section]
      history_index += 1

    l.push = (val) ->
      index = r.length - 1
      l.splice index, 0, [val]
    
    l.shift = () ->
      l.splice 0, 1, []
      
    l.unshift = (val) ->
      l.splice 0, 0, [val]
      
    l.pop = () ->
      index = r.length - 1
      l.splice index, 1, []
      
    l.slice = (start, length) ->
      r.slice start, start + length
 
    l.undo = () ->
      return if history_index == 0
      history_index -= 1
      move = history[history_index]
      l.apply_opposite(move)

    l.apply_opposite = (change) ->
      [start, length, new_stuff, old_stuff] = change
      r.splice.apply r, [start, new_stuff.length].concat(old_stuff)

    l.redo = () ->
      return if history_index == history.length
      history_index += 1
      move = history[history_index]
      l.apply_change move

    l.appy_change = (change) ->
      [start, length, new_stuff, old_stuff] = change
      r.splice.apply r, [start, length].concat(new_stuff)
    l.toJSON = () ->
      r

    l.to_json = () ->
      JSON.stringify l

    if arr
      for i in arr
        l.push i
    l
    
  s
