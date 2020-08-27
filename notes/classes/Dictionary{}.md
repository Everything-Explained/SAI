This Class controls the input and output of words within the dictionary store. On instantiation, it will make sure that there is a valid storage path to read from.

## Methods
Name | Description
-------:|------
`hasWord()` | Returns a Boolean based on whether or not the provided word is found within the dictionary.
`findWordAtIndex()` | Returns the word if it exists in the Dictionary at the provided index.
`findWordPosition()` | Returns the position of a word as an Array, if it exists in the Dictionary.
`addWord()` | Adds a word to the Dictionary if it doesn't already exist.
`addWordToIndex()` | Adds a word to an existing index if that index exists in the Dictionary.
`delWord()` | Deletes a word from the Dictionary if it exists.
`delWordsAtIndex()` | Deletes all words at the specified index, if that index exists within the Dictionary.
`encodeWord()` | Encodes a specified word if it exists within the Dictionary. The current encoding archetype is: `&<word index>`

## Purpose
[[SAI#Simple AI|SAI]] uses the Dictionary to lighten the load of the developer. A traditional dictionary is one that holds many definitions of many words, but in this case, that's *not* the case. This Dictionary stores words in arrays of synonyms. In other words, if you had a word like "large" for instance, it would store this word like so: `[["large"]]`.

An array of arrays is how this storage is organized. Each array, instead of holding a definition, is holding synonyms. In the case of `[["large"]]`, we now have an index of Zero that contains a single array with a value of `["large"]`. If we were to add the word "big" to the Dictionary, we would place it alongside "large" and have an array looking like this: `[["large", "big"]]`.

SAI makes use of this by checking to see if a word exists in the Dictionary and then uses the **index number** of where that word exists. This means, assuming we've added all these words, "*large*", "*big*", "*giant*", "*enormous*", "*gargantuan*", and "*ginormous*", they would all point to the same index and therefore effectively have the same value.

By having the same value, questions that contain those words will all pull up the same response.

## Visual Diagram
The way in which words are structured is not unlike a tables row and column arrangement:

Index | 0 | 1 | 2
----|----|----|----
0 | large | big | giant 
1 | least | lowest | low
2 | lustrous | glorious | brilliant

In practice, if we wanted to encode any of the words on row-index 0, they would be `&0`. So "*large*", "*big*", and "*giant*" would all be represented as the code: `&0`. This reduces the cognitive load of the developer when trying to discern all possible questions relating to a single answer.

