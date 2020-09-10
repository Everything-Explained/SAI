## Question
A Question is a sentence that starts with any of the following: Who, What, When, Where, and Why. You can see the full [[Query Words#Words|list of words]] that are used to deduce a question.

## Nature
All questions are composed of words which convey a subject and context. SAI does its best to extract only the relevant parts of a question and convert them into a code, which can then be accessed later to reference an answer to that question.

## Restraints
Questions, when written, usually have a question-mark at the end to signify that it's a question. In order to force a predictable pattern of questioning, question-marks are ignored in favor of [[Query Words#Words|Query Words]]. Any sentence that starts with these words are considered questions and will be parsed as such.

One of the unfortunate caveats of computers, is that they don't have the ability to respond *in-context* with a users input. For example, let's say you're asking questions about Art...the AI could suggest all questions relating to art, but it doesn't have the ability to carry on a conversation about specific contexts within the field of art. It is strictly a knowledgebase, not an entity which can subjectively discuss the details of art.

## Types of Questions
### Proper
`where is the dog`
`who was ghengis kahn`
`how do i get from point a to point b`
`what does it take to get a badge`

You'll notice that all these *proper* questions have an obvious [[Query Words#Words|Query Word]] and subject. This is absolutely necessary for SAI to parse the input properly.

`whErE DoeS GoD residE`
This may not look like a valid question, but since the input from SAI is converted to lowercase, writing questions like this are completely valid. 

> Within an [[Item Document]] however, **this is NOT a valid question**.

`what does flabergasted mean?`
This is a valid question even though the question-mark is ignored.

### Improper
`what is it about`
This is a valid question, but will not lead to any meaningful results. As stated earlier, AI does not have the ability to maintain context based on a conversational exchange. An AI could never properly assess what `it` is referring to, so it's only course of action is to make suggestions based on assumptions.

`tell me about tomorrow`
This is directly an invalid question, not just because it doesn't contain a proper [[Query Words#Words|Query Word]], but because this is an order, not a question...however if someone were to put a question-mark at the end of this...any human would perceive it as a valid question. We reach that caveat again where subjectivity in discernment, matters.

`do you like chicken|beef`
Although in some cases, this is syntactically correct, any characters that do not fall between **a** and **z** are removed. The question above would effectively be: `do you like chickenbeef` so the answer would obviously be a resounding ==YES==