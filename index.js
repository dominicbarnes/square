/*jshint boss:true */

exports.parse = function (name) {
    return name.split("[").map(function (part) {
        return part.replace(/\]$/, "") || false;
    });
};

exports.set = function (o, key, value) {
    var branches = exports.parse(key);
    var current = o;
    var leaf = branches.pop();

    while (branch = branches.shift()) {
        if (!(branch in current)) {
            var nextKey = branches.length ? branches[0] : leaf;
            current[branch] = !!nextKey ? {} : [];
        }

        current = current[branch];
    }

    if (leaf && Array.isArray(current)) {
        var temp = current[current.length - 1];

        if (!temp || leaf in temp) {
            temp = {};
            current.push(temp);
        }

        current = temp;
    }

    if (!leaf) {
        current.push(value);
    } else {
        current[leaf] = value;
    }

    return o;
};
