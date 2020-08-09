import avro from 'avsc';


export const replySchema = avro.Type.forSchema({
  name: 'Replies',
  type: 'record',
  fields: [
    {
      name: 'replies',
      type: [
        { type: 'array', items: [
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
        ]}
      ]
    }
  ]
});


export const dictSchema = avro.Type.forSchema({
  name: 'Dictionary',
  type: 'record',
  fields: [
    {
      name: 'words',
      type: [
        { type: 'array', items: { type: 'array', items: 'string' } }
      ]
    }
  ]
});
