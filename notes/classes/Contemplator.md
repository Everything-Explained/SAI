A Class that represents a series of methods used in converting a [[Question]] into a [[Hash]], which is demonstrated by the [[Query Processing]] document.

# Properties
Name | Return | Description
---------|-----------|----------------
hashObj | `HashObject` | Returns the instance of the [[Hash]] object used to convert a buffer to a potentially unique number.

# Methods
Name | Return | Description
---------|-----------|----------------
queryToHash | `number` or `undefined`| Returns a number hashed from a specified [[Question]]. The entire process is described [[Query Processing\|Here]].
isQuery | `boolean` | Returns true if a [[Query Words#Words\|Query Word]] is found within the specified input, to denote a valid [[Question]].
filterContractions | `string[]` | Returns an Array with [[Contractions#Contractions\|Contractions]] replaced by their word counterparts.
filterUnknown | `string[]` | Returns an Array with all characters **removed** from [[Question\|Questions]] that are NOT **a - z**.
setQueryCode | `string[]` | Returns an Array with the [[Query Words#Words\|Query Word]] replaced by its corresponding code. This process is discussed in more detail [[Query Words\|Here]].
setContextCode | `string[]` | Returns an Array with all [[Contextual Words#Words\|Contextual Words]] replaced with their corresponding codes. This process is described in more detail [[Contextual Words\|Here]]
setDictCode | `string[]` | Returns an Array with all words found in the [[Dictionary]], replaced with their corresponding codes.
toHash | `number` | Returns a [[Hash\|hashed]] number from a String Array of words representing a [[Question]].
