module.exports = {
    "env": {
        "es6": true,
        "node": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "sourceType": "module",
        "ecmaVersion": 2017
    },
    "rules": {
        "indent": [
            "error",
            "tab"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "never"
        ],
        "eol-last": [
            "error",
            "always"
        ],
        "comma-style": [
            "error",
            "last"
        ],
        "comma-dangle": [
            "error",
            "always-multiline"
        ],
        "key-spacing": [
            "error",
            { "afterColon": true }
        ],
    }
};
