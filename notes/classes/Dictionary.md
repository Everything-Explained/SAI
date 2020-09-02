This Class controls the input and output of words within the dictionary store. On instantiation, it will make sure that there is a valid storage path to read from.

# Methods
### hasWord()
`boolean`
Returns true if the specified word is found in the [[Dictionary]].

### findWordsAtIndex()
`string[]|undefined`
Returns the words found at the specified index, otherwise it returns *undefined*.

### findWordPosition()
`[number, number]|undefined`
Returns the *row* and *column* of a specified word, otherwise it returns *undefined*.

### addWord()
`null|Error`
Adds a word to the Dictionary if it doesn't already exist, otherwise it reports any errors that occur.

### addWordToIndex()
`null|Error`
Adds a word to an existing index if that index exists in the Dictionary.

### delWord()
`null|Error`
Deletes a word from the Dictionary if it exists, otherwise it reports any errors that occur.

### delWordsAtIndex()
`null|Error`
Deletes all words at the specified index, if that index exists within the Dictionary, otherwise it reports any Errors that occur.

### encodeWord()
`string`
Encodes a specified word if it exists within the Dictionary. The current encoding archetype is: `&<word row-index>`. If the word does not exist, it is returned unmodified.

# Breakdown
A traditional dictionary is one that stores words and their definitions; however in this case, words are stored in synonym Arrays without definition. This is demonstrated by the table below:

Index | 0 | 1 | 2
----|----|----|----
0 | large | big | giant 
1 | least | lowest | low
2 | lustrous | glorious | brilliant

When a word is encoded, it uses the *row index* as shown in the first column of the table. Using [[Dictionary#encodeWord|encodeWord()]], the words *big*, *large*, and *giant*, would be converted to `&0` because they're on the first row. Likewise, the words: *lustrous*, *glorious*, and *brilliant* would be encoded as `&2`.

This reduces developer cognitive load, since any questions that would use synonyms as separate questions, will automatically be linked to the right answer. Now obviously this doesn't negate developer work entirely as the synonym Arrays have to be populated manually.

