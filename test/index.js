var assert = require("assert");
var serializer = require("square");

describe("serializer.parse(name)", function () {
    var fn = serializer.parse;

    it("should return an array of string keys", function () {
        var keys = fn("name");
        assert.deepEqual(keys, [ "name" ]);
    });

    it("should return multiple keys", function () {
        var keys = fn("user[name]");
        assert.deepEqual(keys, [ "user", "name" ]);
    });

    it("should return many keys", function () {
        var keys = fn("a[b][c][d]");
        assert.deepEqual(keys, [ "a", "b", "c", "d" ]);
    });

    it("should use false as a placeholder for array notation", function () {
        var keys = fn("tags[]");
        assert.deepEqual(keys, [ "tags", false ]);
    });

    it("should parse keys into numbers if able", function () {
        var keys = fn("a[0][1][2]");
        assert.deepEqual(keys, [ "a", 0, 1, 2 ]);
    });
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
            user: { name: "Dominic Barnes" }
        });
    });

    it("should set deeply nested properties", function () {
        var o = fn({}, "a[b][c][d]", "test");

        assert.deepEqual(o, {
            a: { b: { c: { d: "test" } } }
        });
    });

    it("should handle simple arrays", function () {
        var o = fn({}, "tags[]", "test");
        assert.deepEqual(o, { tags: [ "test" ] });
    });

    it("should handle complex arrays", function () {
        var o = fn({}, "addresses[][street]", "123 Fake St");
        assert.deepEqual(o, {
            addresses: [
                { street: "123 Fake St" }
            ]
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
                }
            ]
        });
    });

    it("should handle complex arrays multiple indexes", function () {
        var o = {};
        fn(o, "contacts[][name]", "test1");
        fn(o, "contacts[][name]", "test2");

        assert.deepEqual(o, {
            contacts: [
                { name: "test1" },
                { name: "test2" }
            ]
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
                { foo: "test1", bar: "test2" },
                { foo: "test3", bar: "test4" }
            ]
        });
    });

    it("should parse number keys as array indices", function () {
        var o = {};
        fn(o, "a[0][b]", 1);
        fn(o, "a[1][b]", 2);
        fn(o, "a[2][b]", 3);

        assert.deepEqual(o, {
            a: [
                { b: 1 },
                { b: 2 },
                { b: 3 }
            ]
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
                { b: [ 1, 2 ] },
                { b: [ 3, 4 ] },
                { b: [ 5, 6 ] }
            ]
        });
    });

    it("should work using the example in the readme", function () {
        var o = {};
        fn(o, "user[name]", "testuser");
        fn(o, "user[password]", "123456");
        fn(o, "tags[]", "a");
        fn(o, "tags[]", "b");
        fn(o, "contacts[][first]", "test1");
        fn(o, "contacts[][last]", "test2");
        fn(o, "contacts[][first]", "test3");
        fn(o, "contacts[][last]", "test4");

        assert.deepEqual(o, {
            user: {
                name: "testuser",
                password: "123456"
            },
            tags: [ "a", "b" ],
            contacts: [
                { first: "test1", last: "test2" },
                { first: "test3", last: "test4" }
            ]
        });
    });
});
