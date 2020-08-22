import del from 'del';
import { readFileSync } from 'fs';
import t from 'tape';
import { FileOps } from '../src/core/file-ops';
import { Dictionary, dictSchema } from '../src/database/dictionary';
import { Replies, Reply, replySchema } from '../src/database/replies';



const fileOps = new FileOps();
const folderPath = './test/replies';
const testData = [
  { questions: ['asdf', 'qwer'],
    answer: 'hello world',
    hashes: [234821348, 123481234],
    dateCreated: Date.now(),
    dateEdited: Date.now()
  }
] as Reply[];

fileOps.createFolder(folderPath);
fileOps.save(`${folderPath}/dictionary.said.gzip`, dictSchema, [], true, false);
fileOps.save(`${folderPath}/replies.said.gzip`, replySchema, testData, true, false)
.then(err => {
  if (err) {
    console.log(err);
    throw err; // We want to kill testing
  }
  const dict = new Dictionary(fileOps, `${folderPath}/dictionary.said.gzip`);
  t('Replies{}', async t => {
    let replies: Replies;
    const mockupDir = './test/mockups';

    t.test('contructor()', async t => {
      t.doesNotThrow(
        () => replies = new Replies(fileOps, dict, `${folderPath}/replies.said.gzip`),
        'finds existing replies path.'
      );
    });

    t.test('findReply(): Reply|undefined', async t => {
      t.equal(replies.findReply(123481234)!.answer, 'hello world',
        'returns a Reply object.'
      );
      t.equal(replies.findReply(58519234), undefined,
        'returns undefined when reply not found.'
      );

      replies.list = [];
    });

    t.test('parseReplyDoc(): Error | [string[], string]', async t => {
      const emptyTest       = readFileSync(`${mockupDir}/emptyTest.txt`, 'utf-8');
      const crlfTest        = readFileSync(`${mockupDir}/CRLFTest.txt`, 'utf-8');
      const sepTest         = readFileSync(`${mockupDir}/separatorTest1.txt`, 'utf-8');
      const missingQ        = readFileSync(`${mockupDir}/missingQTest.txt`, 'utf-8');
      const missingA        = readFileSync(`${mockupDir}/missingATest.txt`, 'utf-8');
      const invalidCharTest = readFileSync(`${mockupDir}/invalidCharsTest.txt`, 'utf-8');
      const passingDoc      = readFileSync(`${mockupDir}/passingDocTest.txt`, 'utf-8');
      const passingVal      = replies.parseReplyDoc(passingDoc);
      t.ok(
        (replies.parseReplyDoc(emptyTest) as Error).message.includes('Empty'),
        'returns Error on white-space-only documents.'
      );
      t.ok(
        (replies.parseReplyDoc(crlfTest) as Error).message.includes('Invalid'),
        'returns Error on missing CRLF white-space.'
      );
      t.ok(
        (replies.parseReplyDoc(sepTest) as Error).message.includes('Separator'),
        'returns Error on missing separator.'
      );
      t.ok(
        (replies.parseReplyDoc(missingQ) as Error).message.includes('Missing'),
        'returns Error if missing questions block.'
      );
      t.ok(
        ~(replies.parseReplyDoc(missingA) as Error).message.includes('Missing'),
        'returns Error if missing answer.'
      );
      t.ok(
        (replies.parseReplyDoc(invalidCharTest) as Error).message.includes('contain Invalid'),
        'returns Error when questions contain invalid chars.'
      );
      t.ok(
        Array.isArray(passingVal),
        'returns Array containing the questions and an answer.'
      );
      t.is((passingVal as [string[], string])[0].length, 4,
        'question count should match question entry.'
      );
    });

    t.test('addDocReply: Error|null', async t => {
      const errorDoc = readFileSync(`${mockupDir}/invalidCharsTest.txt`, 'utf-8');
      const passingDoc = readFileSync(`${mockupDir}/passingDocTest.txt`, 'utf-8');
      t.ok(
        (replies.addDocReply(errorDoc) as Error).message.includes('Invalid chars'),
        'returns error if parseReplyDoc() fails.'
      );
      t.is(replies.addDocReply(passingDoc), null,
        'returns null when reply doc added successfully.'
      );
      t.is(replies.list[0].hashes.length, 4,
        'adds a hash for every question in document.'
      );
    });

    t.test('hashQuestions(): Error|number', async t => {
      const questions     = ['what is this', 'what is that', 'what is what'];
      const hashes        = replies.hashQuestions(questions);
      const identicalQDoc = readFileSync(`${mockupDir}/qTruncatedTest.txt`, 'utf-8');
      const invalidQDoc   = readFileSync(`${mockupDir}/qInvalidTest.txt`, 'utf-8');
            dict.wordList = [['large', 'big', 'enormous', 'giant']];
      const identicalVal  = (replies.addDocReply(identicalQDoc) as Error);
      t.ok(Array.isArray(hashes),
        'returns an array of hashes on success.'
      );
      t.is((hashes as number[]).length, 3,
        'returns the same amount of hashes as questions.'
      );
      t.ok(
        (replies.addDocReply(invalidQDoc) as Error).message.includes('is Invalid'),
        'returns Error with invalid questions.'
      );
      t.ok(
        identicalVal.message.includes('is identical to'),
        'returns Error with identical hashes.'
      );
    });

    del(folderPath); // Cleanup
  });
});