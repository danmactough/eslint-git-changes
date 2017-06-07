# eslint-git-changes

[![Greenkeeper badge](https://badges.greenkeeper.io/danmactough/eslint-git-changes.svg)](https://greenkeeper.io/)
Run eslint on added and modified javascript/json/jsx files in your git working tree

## Usage

Install it: `npm install --save-dev eslint-git-changes`.

Suggestion: Then add a `pretest` script to your `package.json`.

```json
{
	"pretest": "eslint-git-changes --json --jsx",
	"test": "mocha",
	"posttest": "echo \"profit\""
}
```
