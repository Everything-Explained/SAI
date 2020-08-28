# Simple AI
SAI stands for *Simple Artificial Intelligence*. Most people when they think of AI, they think of how "aware" it is, rather than actually how intelligent it is. Intelligence in the context of an artificial mechanism more often than not, means only that it can process information in an **intelligent** way. 

Technically speaking, AI has been around as long as computers have. From the beginning, computers have been used to calculate intelligently articulated responses from input; that input now however, is parsed largely through [Machine Learning] algorithms instead of hand-crafted human ingenuity. Ironically, even the most advanced Machine Learning systems are curbed by human intelligence, called *Supervised Learning*, in order to influence results with a specific bias.

While Machine Learning is great at matching patterns which would normally take a much longer time for a human, they spectacularly fail when tasked with matching subjective data to other subjective data; thus enters SAI. Because machine learning utterly fails at this task, there needs to be a major player involved in discerning this information...*that would be the developer*.

SAI takes the approach that if you ask a question and it has a response, then there should be multiple questions that levy that response. The developer is tasked with figuring which questions fall into a single response and SAI does the menial work of representing synonyms as a single code within a question.

Let's say we have a question: `how big is the earth?`. Unfortunately, in normal circumstances, you would have to represent that question with every single synonym for "big". But SAI is intelligent enough to do that for you, assuming you have all the synonyms added to its dictionary. That single question can now be represented as "how large", "how gigantic", "how enormous", etc...without the developer having to think about that at all.

So although the developer has to do the work of crafting the questions, SAI tries to mitigate as much menial work as possible within that task.

## History
This was originally going to be a project for Noumenae which would facilitate basic moderation and user interaction. I realized however, that the **AI** behind **SAI** was useful in its own module, apart from just being a glorified chat-bot. 

## Training
SAI is not designed to learn by itself, it needs constant input from a developer. Since the developer has the autonomy to pinpoint precisely what the AI can know, this reduces the amount of false-positives to roughly Zero.

To facilitate the learning process, logs are generated from SAI based on questions it could not answer. These questions can then be decided upon by a dev, as to whether or not they benefit their application or not.

> As of this writing, logs are not currently generated. ==SAI is still a WIP==

## Future Potential
- **Custom Functions**: Instead of responding only with predefined answers stored in a database, the bot could be programmed to respond with a function result. In other words, the input could pass through a function first, instead of as a query to the database.
	- Answer Math equations.
	- Date/Time operations
	- Link minifying
	- Website analyzation
	- Dictionary or Thesaurus search functions

A lot of these potential features center around the idea that SAI responds to user input in a dynamic way, but it could also be used to send static results to an external client.

## Extensibility
Any future potential SAI has, will need to be escalated by extension and not be an intrinsic part of SAI itself. The reason for this, is because the larger SAI gets, the more *out-of-bounds* it becomes from its original use-case.

Take a beach-ball for example, if we started using it as a baseball by filling it with rocks instead of air, we would then need to remove the rocks and fill it with air again in order to use it as it was originally intended. This is a rough example of a simple application, accumulating an inordinate amount of bloat from other features that prevent it from performing it's original role, in a manner that makes sense.

> Adding features irrespective of design, slowly removes sanity from design.

In order to avoid SAI digressing into an abyss of insanity, creating an interface for extensibility, allows SAI to be extended to use features it wasn't originally designed to have. This can be done at the volition of each individual developers use-case.



[Machine Learning]:https://www.digitalocean.com/community/tutorials/an-introduction-to-machine-learning