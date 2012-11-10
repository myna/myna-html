var hello = require("../js/hello.js").hello;

describe("hello.js", function () {
    it('should identify browser : android', function () {
        expect(hello()).toBe("hello");
    });
});