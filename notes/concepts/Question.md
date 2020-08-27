A Question is a sentence that starts with any of the following: Who, What, When, Where, and Why. You can see the [[Query Words#Words|list of words]] that are used to deduce a question.

## Composite
All questions are composites of other words which have a subject and context. [[SAI]] does its best to extract only the relevant parts of a question and converting them into a code, which can then be accessed later to reference an answer to that question.

## Restraints
Questions, when written, usually have a question-mark at the end to signify that it's a question. This is also nice when chatting back and forth with someone online. Sometimes someone will say something that, without a question-mark, might be too ambiguous to recognize as a question.

This is all nice and dandy when dealing with people, but not when dealing with machines; machines like predictable input. The way in which we use the English language is all but predictable. To reduce this friction, question-marks are not required to form a question, only the [[Query Words]].

One of the unfortunate caveats of computers, is that they don't have the ability to respond *in-context* with a users input. For example, let's say you're asking questions about Art...the AI could suggest all questions relating to art, but it doesn't have the ability to carry on a conversation about specific contexts within the field of art. It is strictly a knowledgebase, not an entity which can subjectively discuss the details of art.

## Proper and Improper Questions
#### Proper
`where is the dog`
`who was ghengis kahn`
`how do i get from point a to point b`
`what does it take to get a badge`

You'll notice that all these *proper* questions have an obvious [[Query Words#Words|Query Word]] and subject. This is absolutely necessary for [[SAI]] to parse the input properly.

`whErE DoeS GoD residE`
This may not look like a valid question, but since the input from SAI is converted to lowercase, writing questions like this are completely valid.

#### Improper
`what is it about`
This is a valid question, but will not lead to any meaningful results. As stated earlier, AI does not have the ability to maintain context based on a conversational exchange. An AI could never properly assess what `it` is referring to, so it's only course of action is to make suggestions based on assumptions.

`tell me about tomorrow`
This is directly an invalid question, not just because it doesn't contain a proper [[Query Words#Words|Query Word]], but because this is an order, not a question...however if someone were to put a question-mark at the end of this...any human would perceive it as a valid question. We reach that caveat again where subjectivity in discernment, matters.

`where do leaves go?`
Question-marks are not allowed, so this is not a valid question.

`do you like chicken|beef`
Although in some cases, this is syntactically correct, any characters that do not fall between **a** and **z** are removed. The question above would effectively be: `do you like chickenbeef` so the answer would obviously be a resounding ==YES==