# square

A (cryptically-named) component that exposes the ability to serialize a JS
object from a series of key/value pairs where the keys use square-bracket
notation. (with some limited dot notation support)

I'll be following this [spec](http://www.w3.org/TR/html-json-forms/), and if
we start seeing browser support this library will follow that direction.

```html
<form>
    <input type="text" name="user[name]" value="testuser">
    <input type="password" name="user.password" value="123456">
    <input type="text" name="tags[]" value="a">
    <input type="text" name="tags[]" value="b">
    <input type="text" name="contacts[][first]" value="test1">
    <input type="text" name="contacts[][last]" value="test2">
    <input type="text" name="contacts[].first" value="test3">
    <input type="text" name="contacts[].last" value="test4">
</form>
```

```js
{
    user: {
        name: "testuser",
        password: "123456"
    },
    tags: [ "a", "b" ],
    contacts: [
        { first: "test1", last: "test2" },
        { first: "test3", last: "test4" }
    ]
}
```

This API is really low-level, and is meant to be plugged into some other library that
determines what elements need to be serialized.
(see [dominicbarnes/form-serialize](http://github.com/dominicbarnes/form-serialize))


## API

### square.parse(name)

Parses a key name and splits it into the various layers of the key name. The result is
an `Array` of either `String` names or `false` which indicates an array.

Examples:

 * `user[name]` => `[ "user", "name" ]`
 * `user.password` => `[ "user", "password" ]`
 * `tags[]` => `[ "tags", false ]`
 * `contacts[][first]` => `[ "contacts", false, "first" ]`
 * `contacts[].last` => `[ "contacts", false, "last" ]`

### square.get(obj, key)

Get the value at `key` from `obj`.

```js
// get the value in a nested object
var o = { user: { name: 'Matt' } };
var ret = square.get(o, 'user.name');
assert('Matt' == ret);

// get a specific value from an array of objects
var o = { tags: [{ name: 'a' }, { name: 'b' }, { name: 'c' }] };
var ret = square.get(o, 'tags[1].name');
assert.deepEqual(ret, 'b');

// get an array of values from an array of objects
var o = { tags: [{ name: 'a' }, { name: 'b' }, { name: 'c' }] };
var ret = square.get(o, 'tags[].name');
assert.deepEqual(ret, ['a', 'b', 'c']);
```

### square.set(obj, key, value)

Takes a source `obj` and augments it by setting the given `value` at the given `key`.

Examples: (it's long, but meant to illustrate the process)

```js
var o = {};

square.set(o, "user[name]", "testuser");
// => {
//   user: {
//     name: "testuser"
//   }
// }

square.set(o, "user.password", "123456");
// => {
//   user: {
//     name: "testuser",
//     password: "123456"
//   }
// }

square.set(o, "tags[]", "a");
// => {
//   user: {
//     name: "testuser",
//     password: "123456"
//   },
//   tags: [
//     "a"
//   ]
// }

square.set(o, "tags[]", "b");
// => {
//   user: {
//     name: "testuser",
//     password: "123456"
//   },
//   tags: [
//     "a", "b"
//   ]
// }

square.set(o, "contacts[][first]", "test1");
// => {
//   user: {
//     name: "testuser",
//     password: "123456"
//   },
//   tags: [
//     "a", "b"
//   ],
//   contacts: [
//     { first: "test1" }
//   ]
// }

square.set(o, "contacts[][last]", "test2");
// => {
//   user: {
//     name: "testuser",
//     password: "123456"
//   },
//   tags: [
//     "a", "b"
//   ],
//   contacts: [
//     { first: "test1", last: "test2" }
//   ]
// }

square.set(o, "contacts[].first", "test3");
// => {
//   user: {
//     name: "testuser",
//     password: "123456"
//   },
//   tags: [
//     "a", "b"
//   ],
//   contacts: [
//     { first: "test1", last: "test2" },
//     { first: "test3" }
//   ]
// }

square.set(o, "contacts[].last", "test4");
// => {
//   user: {
//     name: "testuser",
//     password: "123456"
//   },
//   tags: [
//     "a", "b"
//   ],
//   contacts: [
//     { first: "test1", last: "test2" },
//     { first: "test3", last: "test4" }
//   ]
// }
```
