A [[Question]] is made up of a few things, a query word, contextual words, and optional words. Two or more of these things are present in every question. One of them is always present, and that's the query word.

#### Queries
Questions always begin with a Query word as described below:
![[Query Words]]

#### Contextual
The next large part of queries, are contextual words which don't necessarily need to be encoded, as explained here:
![[Contextual Words]]

#### Optional
Last, but not least, are the optional words. These words are removed entirely from a question, but there are some caveats as is described here:
![[Optional Words]]

---

## Processing
SAI has a unique way of processing a question into a unique identifier. This identifier is called a [[Hash]]. 

Once the three processes above are completed, this question: `how large is the sun` becomes `A large sun` which is effectively like asking *"How large sun?"*. As you can see, we've reduced the question to the bare minimum required to understand it.

Along with the above processing methods, we have a few more filters that the question is put through to facilitate removing excess garbage and further simplification. These are the "*unknown*", "*contractions*", and "*dictionary*" filters.

#### Strip Unknown
This method just simply strips unknown characters from the query string. So let's say you had a question: `where is the sun@this morning`. The `@` character would then be stripped from the query.

#### Filter Contractions
One might not think much about how contractions work in day-to-day activities, but programmatically analyzing them can be a pain, which is why they need to be filtered:
![[Contractions]]

#### Dictionary
The Dictionary is a Class which contains methods for not only retrieving the word list, but also modifying it:
![[Dictionary{}]]
Using the dictionary, words are converted to a code that reflects where a words position is, in the Dictionaries word list. If a words position is 1, than the code `&01` replaces that word in the question.

Let's take this question: `how large is the sun`
At this point, with the current processes we've talked about, this question would turn into this: `A &01 sun`.

All that's changed is that now we have an index reference to a Dictionary position.

#### Hashing
The last process this question goes through is [[Hash|hashing]]. The question is split into its words, so it would look like this: `["A", "&01", "sun"]` and joined together to form a code: `A&01sun`. This code is then converted into a [[Hash|hash]], using a custom seed value for the algorithm.

`A&01sun` becomes `837306532`
As a hash it becomes: `duidus`
