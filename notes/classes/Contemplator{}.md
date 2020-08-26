A Class that represents a series of methods used in converting a [[Question]] into a [[Hash]], which is demonstrated by the [[Query Processing]] document.

## Methods
`queryToHash()` 
Uses internal functions to compose a hash result from a [[Question]]. The entire process is described [[Query Processing|Here]].

`isQuery()` 
Makes sure that the input is indeed a [[Question]].

`filterContractions()` 
Converts all [[Contractions#Contractions|Contractions]] to understandable words.

`filterUnknown()` 
Removes all characters from [[Question|Questions]] that pass the `[^a-z]` regular expression test. This test matches all characters that are NOT **A** through **Z** and all lowercase.

`setQueryCode()`
Follows the process within [[Query Words]].

`setContextCode()`
Follows the process within [[Contextual Words]]

`setDictCode()`
Follows the process described as part of [[Query Processing#Dictionary|Query Processing]]

`toHash()`
Creates a [[Hash]] from a [[Question]] String.