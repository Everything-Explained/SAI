An algorithmic process of converting a Buffer (binary data) into a potentially unique number. The reason I say *potentially*, is because there is the possibility of collisions, though when using a very small data-set coupled with short-length inputs, the theoretical amount of collisions is close to Zero.

## Requirements
SAI uses the [xxhash] algorithm to create the hashes. Although we have our pick of either the *64-bit* or *32-bit* versions, we're using the *32-bit* since the amount of questions should not exceed the theoretical collision threshold. Also, JavaScript doesn't really play well with big numbers.

A [[Hash Seed#Seed|Hash Seed]] is also required to instantiate the object, although this is mostly a benign feature for our use-case.

## Why are we using them?
As discussed in the [[Query Processing]] document, we are already generating a unique code for each question, so...? It turns out Binary data is much more compact when working with integers. Converting each question-code into a unique number, means we can store that number with up to ~85% compression versus the original string-based code.

> *The longer the question, the greater the savings*.


[xxhash]: https://github.com/Cyan4973/xxHash#xxhash---extremely-fast-hash-algorithm