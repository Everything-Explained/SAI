## Item Document
This is a document containing a plain-text representation of a [[Repository Item]]. This is one of many ways to add Repository Items to SAI.

## Bot Format
Adding a question one-by-one can be tedious and cumbersome if you have to add multiple questions, along with the formatting of an answer. In order to make this as frictionless as possible, a user can create a document to send directly to a bot *using* SAI.

## Front Matter
This document is actually a *markdown* document. Markdown itself, has its own specification for how to write and format a document. There's also something called [Front Matter] that allows an author to use data to describe the content of a file in more detail. In other words, this [Front Matter] is [Meta-Data] and is required by SAI as part of the document.

### Syntax
All *Item Documents* must look similar to the following
```
---
title: some title
questions:
- where is the sky
- what is the sky
- how is the sky blue
author: your name
level: 3
tags:
- sky
- weather
---
This is the content or "body" of the file. Anything can go here, including markdown or special characters. Obviously it must contain a relevant answer to the questions within the meta-data, but how this content is structured is entirley up to the author.
```

### Header Denotation
As you can see, the header (or [Front Matter]) is denoted by the opening `---` and closing `---` characters. There must be exactly 3 `-` characters, no more or less, when denoting the first and last line of the header. They must also be the only characters on that line. This is **not** valid: `---title: hello world`.

It should be noted that the order is unimportant. You can place the title at the bottom and the tags at the top. As long as how you're writing the **title** and **tags** is as illustrated above and that all data is between the `---` characters.

### Properties

==Required== **Title:** This can be either the main relevant question or specifically express what the answer is about. For example, if the question is similar to `who is god` than a relevant title might be *"About God"* or just simply *"God"* . As long as it describes the content, it doesn't matter what it is.

==Required== **Questions:** This is a list of questions that are relevant to the content of the file. So again, if the content is about **God** then relevant questions could be `how big is god` or `what is god` or `who is god` etc.. Any questions that might pertain to God should be here...don't forget though, that `how big is god` and `how large is god` are the same questions and will cause the document to be rejected. *Any questions that use synonyms only need to be added once.*

==Required== **Author:** This can be an alias or the authors actual name; it doesn't matter, but it must be present. If it's not present, the bot will use your username.

==Required== **Level:** This is a number that can mean anything from priority to some arbitrary leveling system. A more detailed description can be found [[Levels|Here]].

==Optional== **Tags:** This is a list of words that in some way relate-to or describe the content. If we again, assume that the content is about **God**, then some words that might relate are *Heaven*, *deity*, or *creator*. This is in most cases very subjective, so tags should be reviewed frequently for consistency and popularity.



[Front Matter]:https://datavizm20.classes.andrewheiss.com/resource/markdown/#front-matter
[Meta-Data]:https://www.lifewire.com/metadata-definition-and-examples-1019177