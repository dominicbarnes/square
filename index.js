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
      return isNumber(key) ? acc[key] : acc.map(function(v) {
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
    // while we are setting the various branches on our object
    if (x + 1 < branches.length) {
      // we need to see what key is coming next
      var nextKey = branches[x + 1];

      // when working with an array
      if (branch === false) {
        // first inspect the last item on the array
        var temp = acc[acc.length - 1];

        if (!temp || branchesExist(temp, branches.slice(x + 1))) {
          temp = {};
          acc.push(temp);
        }

        return temp;
      } else {
        // when the branch does not already exist
        if (!(branch in acc)) {
          // depending on nextKey, we may be setting an array or an object
          acc[branch] = (nextKey === false || typeof nextKey === "number") ? [] : {};
        }

        return acc[branch];
      }
      // the last iteration just sets a simple property / appends to an array
    } else {
      if (branch === false) {
        acc.push(value);
      } else {
        acc[branch] = value;
      }

      return o;
    }
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

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}
