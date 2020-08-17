import { Type } from 'avsc';


export const replySchema = Type.forSchema({
  name: 'replies',
  type: 'array', items: [
    {
      type: 'record',
      name: 'Reply',
      fields: [
        { name: 'questions', type: { type: 'array', items: 'string'}},
        { name: 'answer', type: 'string' },
        { name: 'hashes', type: { type: 'array', items: 'long'}},
        { name: 'dateCreated', type: 'long' },
        { name: 'dateEdited', type: 'long' },
      ]
    }
  ]
});



