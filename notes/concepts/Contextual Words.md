These are words that build a context for a question. These words are processed simply because they're common enough to be encoded in some form.
#### Words
```js
[
  'this',   'was',  'like',     'i',
    'of',  'have',   'and',  'here',
    'in',   'you',    'me',  'your',
  'from',    'we', 'about',  'know',
   'how',   'not',  'whom',    'us',
  'what',    'am',    'be',  'when',
  'them',    'to',   'has', 'there',
   'our', 'those',
]
```
#### Necessity
[[SAI|SAI]]  doesn't actually need to go through the encoding process for these words, since they can be encoded in plain-text form, but because these words are so common when describing context, it can reduce memory/space requirements when they are encoded.

Another more obscure reason, is that certain words when combined, can potentially form similar combinations of characters which may collide with existing hashes. More than likely the chance of this happening is almost Zero but encoding common contextual words with unique identifiers reduces these potential conflicts.

#### Context Codes
Each [[Contextual Words#Words|Contextual-Word]] is assigned a value based on its position in the array above. The following table will illustrate:

word | code
------|------
this | %00
was | %01
like | %02
i | %03

They are then appended to the question in place of the original contextual words like so: `what was it like` => `what %01 it %02`. A Zero buffer character is only added to positions below 10.

If any words are added to the contextual word list, they must be added to the end of the list, otherwise they would affect the already encoded words in the database.