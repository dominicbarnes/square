var isArray = Array.isArray;

exports.parse = function(name) {
  return name.split(/[\.\[]+/g).map(function(part) {
    // strip the "]" from the string, it's not needed after the split
    part = part.replace(/\]$/, "");

    // if the string is now empty, we're dealing with an array
    if (!part) return false;

    // if the key is just numbers, parse it
    if (/^\d+$/.test(part)) return parseInt(part, 10);

    // otherwise, return string key name
    return part;
  });
};

exports.get = function(o, key, value) {
  if (!o) o = {}; // create an empty object if needed

  return exports.parse(key).reduce(function(acc, key) {
    if (acc === undefined || key === false) {
      return acc;
    } else if (isArray(acc)) {
      return typeof key == 'number' ? acc[key] : acc.map(function(v) {
        return v === undefined || v[key] === undefined ? undefined : v[key];
      });
    } else if (acc[key] !== undefined) {
      return acc[key];
    } else {
      return undefined;
    }
  }, o);
};

exports.set = function(o, key, value) {
  if (!o) o = {}; // create an empty object if needed

  return exports.parse(key).reduce(function(acc, branch, x, branches) {
    var next = branches[x + 1];
    if (next === false) {
      acc[branch] = acc[branch] || [];
      return acc[branch];
    } else if (next !== undefined) {
      if (isArray(acc)) {
        // only create a new branch when entire sub-branch has been explored
        var i = acc.reduce(function(idx, obj) {
          return branchesExist(obj, branches.slice(x+1)) ? idx + 1 : idx;
        }, 0);
        acc[i] = acc[i] || {};
        return acc[i];
      } else {
        if (acc[branch] !== undefined) return acc[branch];
        acc[branch] = typeof branch == 'number' ? [] : {};
        return acc[branch];
      }
    } else if (!branch) {
      acc.push(value);
    } else {
      acc[branch] = value;
    }

    return o;
  }, o);
};

function branchesExist(o, branches) {
  var current = o;
  return branches.every(function(branch) {
    if (branch in current) {
      current = current[branch];
      return true;
    } else {
      return false;
    }
  });
}
