
/*
todo
 syncing with a server
 tweaking history based on merging
 slices that a client can handle
*/

(function() {

  poorModule("saver", function() {
    var s, uuid;
    uuid = function() {};
    s = {};
    s.map = function() {
      var history, history_index, history_stack, m, r;
      m = {};
      r = {};
      m.raw = r;
      m.id = uuid();
      history = [];
      history_stack = [];
      history_index = 0;
      m._history = history;
      m.set = function(key, val) {
        var old_val;
        old_val = r[key];
        if (history_index !== history.length) history_stack.push(history);
        history.push(["set", key, val, old_val]);
        r[key] = val;
        return history_index += 1;
      };
      m.get = function(key) {
        return r[key];
      };
      m.undo = function() {
        var move;
        if (history_index === 0) return;
        history_index -= 1;
        move = history[history_index];
        return m.apply_opposite(move);
      };
      m.apply_opposite = function(change) {
        var key, new_val, old_val;
        key = change[0], new_val = change[1], old_val = change[2];
        return r[key] = old_val;
      };
      m.redo = function() {
        var move;
        if (history_index === history.length) return;
        history_index += 1;
        move = history[history_index];
        return m.apply_change(move);
      };
      m.appy_change = function(change) {
        var key, new_val, old_val;
        key = move[0], new_val = move[1], old_val = move[2];
        return r[key] = new_val;
      };
      m.toJSON = function() {
        return r;
      };
      m.to_json = function() {
        return JSON.stringify(m);
      };
      return m;
    };
    s.list = function(arr) {
      var history, history_index, history_stack, i, l, r, _i, _len;
      l = {};
      l.id = uuid;
      r = [];
      l.raw = r;
      history = [];
      history_stack = [];
      history_index = 0;
      l._history = history;
      l.set = function(index, val) {
        return l.splice(index, 1, [val]);
      };
      l.get = function(key) {
        return r[key];
      };
      l.size = function() {
        return r.length;
      };
      l.splice = function(start, length, replace_list) {
        var old_section;
        old_section = r.splice.apply(r, [start, length].concat(replace_list));
        if (history_index !== history.length) history_stack.push(history);
        history = history.slice(0, history_index);
        history.push([start, length, replace_list, old_section]);
        return history_index += 1;
      };
      l.push = function(val) {
        var index;
        index = r.length - 1;
        return l.splice(index, 0, [val]);
      };
      l.shift = function() {
        return l.splice(0, 1, []);
      };
      l.unshift = function(val) {
        return l.splice(0, 0, [val]);
      };
      l.pop = function() {
        var index;
        index = r.length - 1;
        return l.splice(index, 1, []);
      };
      l.slice = function(start, length) {
        return r.slice(start, start + length);
      };
      l.undo = function() {
        var move;
        if (history_index === 0) return;
        history_index -= 1;
        move = history[history_index];
        return l.apply_opposite(move);
      };
      l.apply_opposite = function(change) {
        var length, new_stuff, old_stuff, start;
        start = change[0], length = change[1], new_stuff = change[2], old_stuff = change[3];
        return r.splice.apply(r, [start, new_stuff.length].concat(old_stuff));
      };
      l.redo = function() {
        var move;
        if (history_index === history.length) return;
        history_index += 1;
        move = history[history_index];
        return l.apply_change(move);
      };
      l.appy_change = function(change) {
        var length, new_stuff, old_stuff, start;
        start = change[0], length = change[1], new_stuff = change[2], old_stuff = change[3];
        return r.splice.apply(r, [start, length].concat(new_stuff));
      };
      l.toJSON = function() {
        return r;
      };
      l.to_json = function() {
        return JSON.stringify(l);
      };
      if (arr) {
        for (_i = 0, _len = arr.length; _i < _len; _i++) {
          i = arr[_i];
          l.push(i);
        }
      }
      return l;
    };
    return s;
  });

}).call(this);
