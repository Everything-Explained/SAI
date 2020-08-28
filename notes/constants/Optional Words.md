These words are a bit more tricky to define. They require a bit of finesse in order to understand how they can be omitted from a question without completely destroying that questions intent.
#### Words
```js
[
  'a',    'an',    'do',   'can', 'the',
  'are',  'does',  'it',   'is',
  'that', 'could', 'would',
]
```
#### Restraints
These words must NOT appear within [[Contextual Words#Words|Contextual Words]] as one process will cancel out the other. If a word is encoded by context, then it will not be removed by option...and likewise if a word is removed by option, it cannot be encoded by context.
#### Potential Issues
Removing words is very dangerous, as it can lead to possible collisions with other questions. This list is the bare-minimum required, in order to preserve the meaning of a question, while also making it as succinct as possible for the parser to understand.
#### Processing
It's as simple as just removing the word entirely. Optional words mean that the context and intent of a question will be unharmed if that word is removed.