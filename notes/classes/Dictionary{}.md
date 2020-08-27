This Class controls the input and output of words within the dictionary store. On instantiation, it will make sure that there is a valid storage path to read from.
## Purpose
[[SAI]] uses the Dictionary to lighten the load of the developer. A traditional dictionary is one that holds many definitions of many words, but in this case, that's *not* the case. This Dictionary stores words in arrays of synonyms. In other words, if you had a word like "large" for instance, it would store this word like so: `[["large"]]`.

An array of arrays is how this storage is organized. Each array, instead of holding a definition, is holding synonyms. In the case of `[["large"]]`, we now have an index of Zero that contains a single array with a value of `["large"]`. If we were to add the word "big" to the Dictionary, we would place it alongside "large" and have an array looking like this: `[["large", "big"]]`.

SAI makes use of this by checking to see if a word exists in the Dictionary and then uses the **index number** of where that word exists. This means, assuming we've added all these words, "*large*", "*big*", "*giant*", "*enormous*", "*gargantuan*", and "*ginormous*" would all point to the same index and therefore effectively have the same value.

By having the same value, questions that contain those words will all pull up the same response.

## Visual Diagram
The way in which words are structured is not unlike a tables row and column arrangement:

Index | 0 | 1 | 2
----|----|----|----
0 | large | big | giant 
1 | least | lowest | low
2 | lustrous | glorious | brilliant

So while all words within each row index will be considered relatively the same within SAI, if we were to pull out an individual word like "low" we would simply reference row 1 column 2.