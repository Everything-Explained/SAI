These are words which form the basis for starting a question in the English language. Some of them obvious and some not-so-obvious.
#### Words
```js
[
  'what', 'when', 'where', 'how',
  'why', 'can', 'did', 'will', 'is',
  'does', 'who', 'do', 'has'
]
```
#### Necessity
Encoding these words is not particularly needed, but doing so saves a little bit of memory/space while using a marginal amount of CPU power to do so.
#### Processing
Each [[Query Words#Words|Query-Word]] is converted into an uppercase character based on its position in the array. The following table will illustrate:

word | code
------|------
what | A
when | B
where | C
how | D

They are then appended to the question in place of the word as follows:
`what is chicken` becomes `A is chicken`

The reason we're using uppercase characters is because they are illegal characters in questions, so they are valid to use as codes.