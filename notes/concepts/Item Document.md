This is a document containing a plain-text representation of a [[Repository Item]]. This is one of many ways to add Repository Items to SAI.

## Bot Format
Adding a question one-by-one can be tedious and cumbersome if you have to add multiple questions, along with the formatting of an answer. In order to make this as frictionless as possible, a user can create a document which can be detected or directly sent, to a bot *using* SAI.

### Header
Every Document Item must contain a header, which is parsed using the header-separator: `/@\`. This is illustrated in the simple Document Item below:

```
here is a question
here is another question
/@\
something that answers the questions in the header.
```

As you can see, the questions are separated from the answer. The first section that contains the questions is called the header, while the second part containing the answer, is called the body. Questions are not the only properties that can be added to a header, as illustrated below:

```
here is a question
here is another question
#tag1,tag2,tag3
:level
:author name
/@\
something that answers the questions in the header.
```

You'll notice a couple extra properties there denoted by the `:` and `#` characters. Anything added with a colon as the first character, is considered a property descriptor while adding a pound symbol denotes a list of tags.

### Property Descriptors
Usually there would be some kind of obvious way to tag what a property is, but I decided to use an ordering system which requires a bit of memory work. In other words, every property added, must be in the proper order. In the above illustration, you'll see that [[Repository Item#Level|Level]] comes before [[Repository Item#Authors|Author]]. If a level is not provided based on a type-check, then it is assumed that it is an Author name.

> Other properties might be added in the future, but only Level and Author are currently available.

### Questions
When adding questions to a Document Item, the same [[Question#Restraints|Question Restraints]] still apply. In this case, **question-marks are completely illegal**, not just ignored. If a Document Item is submitted with a question ending in a question-mark, this will produce an error.

Likewise, if a question has any invalid characters within it, it will return an error, but this also applies to uppercase characters. A question like: `Is it going to rain today` is **illegal inside of a Document Item**. Yes, questions can be easily converted into lowercase characters, but getting an author in the habit of entering valid input is overall more beneficial in my opinion.

### Answers
There are no formatting limitations inside of answers; this means **all characters are acceptable**. Even the header separator itself (`/@\`) is legal, because it is only parsed once at the beginning of the document.

Since all characters are legal, this means the answer can contain HTML, Markdown, or any other form of code or text formatting required for a developers use-case.

### Example Document
```
what is the sky
where is the sky
#weather
:0
:Jaeiya
/@\
Information about the sky and where it is in relation to other things.
```

