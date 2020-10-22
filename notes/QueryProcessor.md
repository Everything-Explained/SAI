# Query Processor
In order for [[SAI]] to be half-way intelligent, it needs to be able to understand how humans type English. This means we need to reduce each question down to its bare fundamental parts and remove everything else that isn't necessary.

## Contractions
One of the easiest things to program, is a contraction filter. For most contractions in English, the rules are obvious and therefore easy to reason about. If we have a word like **can't** we know there are two options: `cannot` and `can not`. Since we want to be as strict as possible, we go with the least complicated: `can not` and convert all cases of `cannot` to `can not` as well. 

The next rule is about `n't` and it means `not` should replace the contraction: `shouldn't` becomes `should not`. This becomes as simple as replacing all `n't` with ` not`. You can continue this with the majority of contractions. 

The only contraction that becomes difficult to quantify is the `'s`.  Apostrophe S can mean different things in different contexts: `what's` becomes `what is` but `let's` becomes `let us` and then if you're referring to a name, you have to omit the contraction completely, like in the sentence `Where's brian's parka?`. Now obviously it's not necessary to use an apostrophe on Brian, but some people make that mistake...and here's the kicker...we can't assume people are going to have proper grammar. The best we can do is approximate.

## Normalization
I've already mentioned how we basically have to ignore grammar, in order to facilitate predicting user input properly.