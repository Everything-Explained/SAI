Creates a unique reference point for all created Hashes. You can learn more about Hashes [[Hash|here]].

## Seed
Originally, this seed was going to be used in reference to a bot that [[SAI#Simple AI|SAI]] was going to inhabit, named "Aelo". The resemblance between `Aelo` and `0xAE10` should be obvious.
```js
0xAE10
```

## Why?
[[SAI#Simple AI|SAI]] doesn't store these hashes in any meaningful way, other than with the assurance that the values are unique. A seed ensures that any 3rd party app using the same hash algorithm, would come up with different hash values, using the same inputs.

While this can be nice if you're trying to ensure uniqueness across multiple hash tables, SAI will never need such protection for its hashes. It's anecdotal at best for this use-case.