In the English language we have a way of abbreviating two words into a single word...and **that's** with contractions. 

Do you see what I did there with *that's*? `that's` is short for `that is`. Using these contractions, it's easier for us to say simple things faster, however they're not so useful when analyzed programmatically.

## Contractions
```js
[
  ["won't", "will not"], 
  ["can't|cannot", "can not"],
  ["where's", "where has"],
  ["n't", " not"],
  ["'ll", " will"], 
  ["'s",  " is"], 
  ["'re", " are"]
]
```

## Structure
You'll notice that we only have a few contractions here and that they're coupled with their corresponding words. This Array is used specifically for replacing contractions with their full-word counterparts. The word/contraction on the left will be replaced with the word on the right.

## Limitations
Obviously we didn't put every [[Contractions#Contractions|Contraction]] in existence there. That's because we only need to replace based on the contraction, not the word itself. The only time we need to be concerned about the word, is if it contains part of the contraction.

For example: `won't` contains the contraction for `not` as part of its word, which is `n't`. If we were to replace `won't` with `n't`, we would get `wo not`. This means we have to declare it as a separate contraction on its own; we do the same for `can't` and `cannot`.

An example of a word unaffected by this, is `haven't` where the word `have` does not include the contraction `n't` as part of its word, so it's safe to rely on just the contraction replacement.

## Processing
Each of the [[Contractions#Words|words]] in the list above, is actually part of a [Regular Expression]. When a contraction/word is matched, it is then replaced by its corresponding word along with a space. The space is necessary, to separate the new word from the word that is no longer a contraction.

#### Examples
Original | Filtered
---------|----------
why can't i see it | why can not i see it
where's it gone, i'm sure it's there | where has it gone, i am sure it is there

The filtered form is much easier to parse, as we now have words we can either remove entirely or encode.


[Regular Expression]:https://www.techopedia.com/definition/25843/regular-expression