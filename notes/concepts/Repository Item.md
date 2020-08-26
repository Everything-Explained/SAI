A single instance of an object containing questions, an answer, hashes, and date properties, is a Repository Item.
### Scheme
Within SAI, data is structured by Scheme's, which are AVRO-instantiated objects. The following is the current Repository Scheme:
```js
{
  type: 'array', items: [
    {
      type: 'record',
      name: 'Repository Item',
      fields: [
        { name: 'questions', type: { type: 'array', items: 'string'}},
        { name: 'answer', type: 'string' },
        { name: 'hashes', type: { type: 'array', items: 'long'}},
        { name: 'dateCreated', type: 'long' },
        { name: 'dateEdited', type: 'long' },
      ]
    }
  ]
}
```
### Breakdown
1. **questions**: is a String Array of potential valid questions.
2. **answer**: is a String containing a hand-crafted response.
3. **hashes**: is an Number Array of unique identifiers whose indexes relate precisely to the Questions Array.
4. **dateCreated**: is the numeric date in milliseconds that the RepoItem was created.
5. **dateEdited**: is the numeric date in milliseconds that the RepoItem was edited.
### Save Format
This data is converted to a binary buffer which is ready to be saved as either an AVRO container or raw AVRO data. [[SAI]] saves this data in raw AVRO without a container, which is actually smaller than using a container.
