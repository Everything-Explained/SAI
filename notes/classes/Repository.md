This is the base Class for storing and manipulating [[Repository Item|Repository Items]]

# Properties
#### items 
`string[]`
Returns a copy of the [[Repository Item]] Array.

#### contemplate 
`Contemplator`
Returns the instance of the [[Contemplator]] Class which is used within the Repository.

---

# Methods
#### findItem()
`RepoItem|undefined`
Returns an item if the specified [[Hash]] is found in the Repository.

#### ==WIP== findItemsByTag() 
`RepoItem[]|undefined`
Returns a list of Repository Items if the tag was found within the Repository.

#### addDocItem()
`null|Error`
Returns null if the specified document item has been added to the Repository, otherwise it will report any errors that occur. 

#### parseItemDoc()
`[string[], string]|Error`
Returns a [Tuple] representing the parsed [[Item Document]] information, if it's a valid document; otherwise it will report any errors that occur.

#### whiteSpaceStrat()
`'\n' | '\n\r' | undefined`
Returns the proper line-endings if line-endings are found within the specified document. If line-endings do not exist, it returns undefined.

#### hashQuestions()
`string[]`
Returns an Array of hashes created from specified questions; otherwise it will report any errors that occur.

[Tuple]:https://www.tutorialsteacher.com/typescript/typescript-tuple