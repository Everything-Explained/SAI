A single instance of an object containing information about an answer to listed questions, along with relevant properties pertaining to the creation of that information.

## Schema
A Repository Item is structured by a Schema, which are [[AVRO]]-instantiated objects. The following is the current Repository Schema:
```js
{
  type: 'record',
  name: 'Repository Item',
  fields: [
    { name: 'questions', type: { type: 'array', items: 'string'}},
    { name: 'answer' , type: 'string' },
    { name: 'hashes' , type: { type: 'array', items: 'int'}},
    { name: 'tags'   , type: { type: 'array', items: 'string'}},
    { name: 'authors', type: { type: 'array', items: 'string'}},
    { name: 'level'  , type: 'int' },
    { name: 'dateCreated', type: 'long' },
    { name: 'dateEdited' , type: 'long' },
  ]
}
```

## Properties
#### Questions
`questions: string[]` 
Valid [[Question|questions]] that pertain to the saved *answer*. Because of the subjective nature of questions, this is a many-to-one relationship with the *answer*.

#### Answer
`answer: string` 
A hand-crafted response by an *author*. That *author* can be either a user or developer, depending on the use-case of SAI. The answer can contain any characters other than the pattern `/@\`, which is used for parsing the header of a [[RepoDoc]]

#### Hashes
`hashes: int32[]`
Unique identifiers with an index that correlates precisely to the *questions* Array. In other words, `hashes[0]` is the hashed representation of `question[0]`. 

> int32 refers to a **32-bit signed integer** value as discussed in the [[AVRO]] specification.

#### Tags
`tags: string[]` 
Unique tags created by an *author* of the RepoItem. Tags are programmatically enforced to be unique, which means no duplicates will ever be allowed, even if an *author* tries.

#### Authors
`authors: string[]`
Names of those who have edited the RepoItem. The first *author* in the Array is the creator, followed by secondary and tertiary Authors coming after. Since Authors are proper nouns, they can be uppercase.

#### Level
`level: int32`
Holds an arbitrary level or priority value specified by the developer. If arbitrary criteria is required to access an **answer**, than this property can be used to limit access.

> int32 refers to a **32-bit signed integer** value as discussed in the [[AVRO]] specification.

#### Date Created
`dateCreated: Long`
The time in Milliseconds that the RepoItem was Created.

#### Date Edited
`dateEdited: Long`
The time in milliseconds that the RepoItem was Edited.

## Save Format
This data is converted to a binary buffer which is ready to be saved as either an [AVRO container] or [raw AVRO] data. 

> SAI saves this data in raw [[AVRO]] without a container, which is actually smaller than using a container.


[AVRO container]:https://avro.apache.org/docs/current/spec.html#Object+Container+Files
[raw AVRO]:https://avro.apache.org/docs/current/spec.html#Encodings