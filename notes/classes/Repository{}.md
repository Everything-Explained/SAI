This is the base Class for storing and manipulating [[Repository Item|Repository Items]]

## Methods
Name | Description
------:|------
`findItem()`                  | Returns an item if the specified [[Hash]] is found in the Repository.
`findItemByTag()`      | Returns a list of Repository Items if the tag was found within the Repository. ==Currently Not Implemented==
`addDocItem()`             | Returns null if the specified document item has been added to the Repository.
`parseItemDoc()`        | Returns an Array representing the parsed item-document information, if it's a valid document.
`whiteSpaceStrat()` | Returns the proper line-endings if line-endings are found within the specified document.
`hashQuestions()`      | Returns an Array of hashes created from specified questions, if no errors occur.
