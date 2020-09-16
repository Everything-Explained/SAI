## Repository
This is the base Class for storing and manipulating [[Repository Item|Repository Items]]

## Properties
Name | Return | Description
---------|-----------|--------------------
items               | `string[]` | Returns a copy of the [[Repository Item]] Array.
contemplate | `Contemplator{}` | Returns the instance of the [[Contemplator]] Class which is used within the Repository.

## Methods
Name | Return | Description
------------:|--------------|-----------------------------------------------------
findItem | `RepoItem` or `undefined` | Returns an item if the specified code is found in the Repository.
findItemsByTag | `RepoItem[]` or |`undefined` | ==WIP== Returns a list of Repository Items if the tag was found within the Repository.
addDocItem | `null` or `Error` | Returns null if the specified document item has been added to the Repository, otherwise it will report any errors that occur. 
parseItemDoc | `[string[], string]` or `Error` | Returns a [Tuple] representing the parsed [[Item Document]] information, if it's a valid document; otherwise it will report any errors that occur.
whiteSpaceStrat | `'\n'` or  `'\n\r'` or `undefined` | Returns the proper line-endings if line-endings are found within the specified document. If line-endings do not exist, it returns undefined.

[Tuple]:https://www.tutorialsteacher.com/typescript/typescript-tuple