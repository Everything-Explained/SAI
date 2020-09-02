SAI converts questions into codes, which can then be used to identify an answer from the [[Repository]].

## Step-by-Step
1. Validate that we have a proper question, which is handled by [[Contemplator#isQuery|isQuery()]].
2. Convert all contractions to proper words, which is handled by [[Contemplator#filterContractions|filterContractions()]].
3. Strip all unknown characters that are **not** lowercase alphabet characters. This is handled by [[Contemplator#filterUnknown|filterUnknown()]].
4. Set a unique code for [[Query Words]], which is handled by [[Contemplator#setQueryCode|setQueryCode()]].
5. Set a unique code for [[Contextual Words]], which is handled by [[Contemplator#setContextCode|setContextCode()]].
6. Set a unique code for [[Dictionary]] words, which is handled by [[Contemplator#setDictCode|setDictCode()]].
7. And last but not least, convert the final output to a unique hash value, which can be assigned as an ID for the specified question.

