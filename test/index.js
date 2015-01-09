var assert = require("assert");

try {
  var serializer = require("squares");
} catch (e) {
  var serializer = require("..");
}

describe("serializer.parse(name)", function () {
  var fn = serializer.parse;

  it("should return an array of string keys", function () {
    var keys = fn("name");
    assert.deepEqual(keys, ["name"]);
  });

  it("should return multiple keys", function () {
    var keys = fn("user[name]");
    assert.deepEqual(keys, ["user", "name"]);
  });

  it("should return many keys", function () {
    var keys = fn("a[b][c][d]");
    assert.deepEqual(keys, ["a", "b", "c", "d"]);
  });

  it("should use false as a placeholder for array notation", function () {
    var keys = fn("tags[]");
    assert.deepEqual(keys, ["tags", false]);
  });

  it("should parse keys into numbers if able", function () {
    var keys = fn("a[0][1][2]");
    assert.deepEqual(keys, ["a", 0, 1, 2]);
  });

  it("should also accept dot notation", function () {
    assert.deepEqual(fn("a.b.c"), [ "a", "b", "c" ]);
    assert.deepEqual(fn("a[b].c"), [ "a", "b", "c" ]);
    assert.deepEqual(fn("a.b[c]"), [ "a", "b", "c" ]);
    assert.deepEqual(fn("a[].b"), [ "a", false, "b" ]);
  });
});

describe('serializer.get(o, key)', function() {
  var fn = serializer.get;

  it('should return undefined', function() {
    var o = {};
    var ret = fn(o, 'name');
    assert(undefined == ret);
  });

  it('should not throw on deep arrays', function() {
    var o = {};
    var ret = fn(o, 'user.name');
    assert(undefined == ret);
  });

  it('should support shallow objects', function() {
    var o = { name: 'Matt' };
    var ret = fn(o, 'name');
    assert('Matt' == ret);
  });

  it('should support nested objects', function() {
    var o = { user: { name: 'Matt' } };
    var ret = fn(o, 'user.name');
    assert('Matt' == ret);
  });

  it('should support nested objects using squares', function() {
    var o = { user: { name: 'Matt' } };
    var ret = fn(o, 'user[name]');
    assert('Matt' == ret);
  });

  it('should support array notation', function() {
    var o = { tags: ['a', 'b', 'c'] };
    var ret = fn(o, 'tags[]');
    assert.deepEqual(ret, ['a', 'b', 'c']);
  });

  it('array notation at the end should be optional', function() {
    var o = { tags: ['a', 'b', 'c'] };
    var ret = fn(o, 'tags');
    assert.deepEqual(ret, ['a', 'b', 'c']);
  });

  it('should support indexes', function() {
    var o = { tags: ['a', 'b', 'c'] };
    var ret = fn(o, 'tags[0]');
    assert.deepEqual(ret, 'a');
  });

  it('should support nested array notation', function() {
    var o = { user: { tags: ['a', 'b', 'c'] } };
    var ret = fn(o, 'user.tags[]');
    assert.deepEqual(ret, ['a', 'b', 'c']);
  });

  it('array notation at the end of nested array should be optional', function() {
    var o = { user: { tags: ['a', 'b', 'c'] } };
    var ret = fn(o, 'user.tags');
    assert.deepEqual(ret, ['a', 'b', 'c']);
  });

  it('should support an array of objects', function() {
    var o = { tags: [{ name: 'a' }, { name: 'b' }, { name: 'c' }] };
    var ret = fn(o, 'tags[].name');
    assert.deepEqual(ret, ['a', 'b', 'c']);
  });

  it('should support arrays with indexs containing objects', function() {
    var o = { tags: [{ name: 'a' }, { name: 'b' }, { name: 'c' }] };
    var ret = fn(o, 'tags[1].name');
    assert.deepEqual(ret, 'b');
  });

  it('should not break on sparse gets', function() {
    var o = { tags: [{ name: 'a' }, { name: 'b', age: 32 }, { name: 'c' }] };
    var ret = fn(o, 'tags[].age');
    assert.deepEqual(ret, [undefined, 32, undefined]);
  });

  it('should not blow up on sparse nested gets', function() {
    var o = { tags: [{ name: 'a' }, { name: 'b', type: { blood: 'o' } }, { name: 'c' }] };
    var ret = fn(o, 'tags[].type.blood');
    assert.deepEqual(ret, [undefined, 'o', undefined]);
  });

  it('... lets go even one step deeper', function() {
    var o = { tags: [{ name: 'a', type: { blood: 'b' } }, { name: 'b', type: { blood: { value: 'o' } } }, { name: 'c' }] };
    var ret = fn(o, 'tags[].type.blood.value');
    assert.deepEqual(ret, [undefined, 'o', undefined]);
  })
});

describe("serializer.set(o, key, value)", function () {
  var fn = serializer.set;

  it("should return the input object", function () {
    var o = {};
    var ret = fn(o, "name", "Dominic Barnes");
    assert(o === ret);
  });

  it("should set a simple object property", function () {
    var o = fn({}, "name", "Dominic Barnes");

    assert.deepEqual(o, {
      name: "Dominic Barnes"
    });
  });

  it("should set nested properties", function () {
    var o = fn({}, "user[name]", "Dominic Barnes");

    assert.deepEqual(o, {
      user: {
        name: "Dominic Barnes"
      }
    });
  });

  it("should set deeply nested properties", function () {
    var o = fn({}, "a[b][c][d]", "test");

    assert.deepEqual(o, {
      a: {
        b: {
          c: {
            d: "test"
          }
        }
      }
    });
  });

  it("should handle simple arrays", function () {
    var o = fn({}, "tags[]", "test");
    assert.deepEqual(o, {
      tags: ["test"]
    });
  });

  it("should handle complex arrays", function () {
    var o = fn({}, "addresses[][street]", "123 Fake St");
    assert.deepEqual(o, {
      addresses: [
        {
          street: "123 Fake St"
      }]
    });
  });

  it("should handle complex arrays with multiple properties", function () {
    var o = {};
    fn(o, "addresses[][street]", "123 Fake St");
    fn(o, "addresses[][city]", "Tulsa");
    fn(o, "addresses[][state]", "OK");
    fn(o, "addresses[][postal]", "12345");

    assert.deepEqual(o, {
      addresses: [
        {
          street: "123 Fake St",
          city: "Tulsa",
          state: "OK",
          postal: "12345"
      }]
    });
  });

  it("should handle complex arrays multiple indexes", function () {
    var o = {};
    fn(o, "contacts[][name]", "test1");
    fn(o, "contacts[][name]", "test2");

    assert.deepEqual(o, {
      contacts: [
        {
          name: "test1"
      },
        {
          name: "test2"
      }]
    });
  });

  it("should handle complex arrays multiple indexes and multiple properties", function () {
    var o = {};
    fn(o, "contacts[][foo]", "test1");
    fn(o, "contacts[][bar]", "test2");
    fn(o, "contacts[][foo]", "test3");
    fn(o, "contacts[][bar]", "test4");
    assert.deepEqual(o, {
      contacts: [
        {
          foo: "test1",
          bar: "test2"
      },
        {
          foo: "test3",
          bar: "test4"
      }]
    });
  });

  it("should parse number keys as array indices", function () {
    var o = {};
    fn(o, "a[0][b]", 1);
    fn(o, "a[1][b]", 2);
    fn(o, "a[2][b]", 3);

    assert.deepEqual(o, {
      a: [
        {
          b: 1
      },
        {
          b: 2
      },
        {
          b: 3
      }]
    });
  });

  it("should handle weird combinations", function () {
    var o = {};
    fn(o, "a[0][b][]", 1);
    fn(o, "a[0][b][]", 2);
    fn(o, "a[1][b][]", 3);
    fn(o, "a[1][b][]", 4);
    fn(o, "a[2][b][]", 5);
    fn(o, "a[2][b][]", 6);

    assert.deepEqual(o, {
      a: [
        {
          b: [1, 2]
        },
        {
          b: [3, 4]
        },
        {
          b: [5, 6]
        }
      ]
    });
  });

  it("should handle arrays with deep objects", function () {
    var o = {};
    fn(o, "a[][b][c]", 1);
    fn(o, "a[][b][d]", 2);
    fn(o, "a[][b][c]", 3);
    fn(o, "a[][b][d]", 4);

    assert.deepEqual(o, {
      a: [
        {
          b: {
            c: 1,
            d: 2
          }
      },
        {
          b: {
            c: 3,
            d: 4
          }
      }]
    });
  });

  it("should work using the example in the readme", function () {
    var o = {};
    fn(o, "user[name]", "testuser");
    fn(o, "user.password", "123456");
    fn(o, "tags[]", "a");
    fn(o, "tags[]", "b");
    fn(o, "contacts[][first]", "test1");
    fn(o, "contacts[][last]", "test2");
    fn(o, "contacts[].first", "test3");
    fn(o, "contacts[].last", "test4");

    assert.deepEqual(o, {
      user: {
        name: "testuser",
        password: "123456"
      },
      tags: ["a", "b"],
      contacts: [
        {
          first: "test1",
          last: "test2"
      },
        {
          first: "test3",
          last: "test4"
      }]
    });
  });

  it('order should not matter', function() {
    var o = {};
    fn(o, 'a[].b', 1);
    fn(o, 'a[].b', 2);
    fn(o, 'a[].c', 3);

    var j = {};
    fn(j, 'a[].b', 1);
    fn(j, 'a[].c', 3);
    fn(j, 'a[].b', 2);

    var expected = {"a":[{"b":1,"c":3},{"b":2}]};
    assert.deepEqual(o, expected);
    assert.deepEqual(j, expected);
  })
});
