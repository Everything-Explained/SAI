import del from 'del';
import { readFileSync } from 'fs';
import t from 'tape';
import { FileOps } from '../src/core/file-ops';
import { Dictionary, dictSchema } from '../src/database/dictionary';
import { Repository, RepoItem, repositoryScheme } from '../src/database/repository';
import { testDir } from '../src/variables/constants';



const fileOps = new FileOps();
const folderPath = `${testDir}/repository`;
const mocks = `${testDir}/doctests`;
const testData = [
  { questions: ['asdf', 'qwer'],
    answer: 'hello world',
    hashes: [234821348, 123481234],
    authors: [],
    tags: [],
    level: 0,
    dateCreated: Date.now(),
    dateEdited: Date.now()
  }
] as RepoItem[];

fileOps.createFolder(folderPath);
fileOps.save(`${folderPath}/dictionary.said.gzip`, dictSchema, [], true, false);
fileOps.save(`${folderPath}/replies.said.gzip`, repositoryScheme, testData, true, false)
.then(err => {
  if (err) {
    console.log(err);
    throw err; // We want to kill testing
  }
  const dict = new Dictionary(fileOps, `${folderPath}/dictionary.said.gzip`);
  t('Replies{}', async t => {
    let repo: Repository;
    t.test('contructor()', async t => {
      t.doesNotThrow(
        () => repo = new Repository(fileOps, dict, `${folderPath}/replies.said.gzip`),
        'finds existing replies path.'
      );
    });

    t.test('findReply(): Reply|undefined', async t => {
      t.equal(repo.findItem(123481234)!.answer, 'hello world',
        'returns a Reply object.'
      );
      t.equal(repo.findItem(58519234), undefined,
        'returns undefined when reply not found.'
      );
      repo.items = [];
    });

    t.test('parseItemDoc(): Error | [string[], string]', async t => {
      const emptyTest       = readFileSync(`${mocks}/emptyTest.txt`, 'utf-8');
      const crlfTest        = readFileSync(`${mocks}/CRLFTest.txt`, 'utf-8');
      const sepTest         = readFileSync(`${mocks}/missingSeparator.txt`, 'utf-8');
      const missingQ        = readFileSync(`${mocks}/missingQTest.txt`, 'utf-8');
      const missingA        = readFileSync(`${mocks}/missingATest.txt`, 'utf-8');
      const invalidCharTest = readFileSync(`${mocks}/invalidCharTest.txt`, 'utf-8');
      const passingDoc      = readFileSync(`${mocks}/passingDocTest.txt`, 'utf-8');
      const passingVal      = repo.parseItemDoc(passingDoc);
      t.ok(
        (repo.parseItemDoc(emptyTest) as Error).message.includes('Empty'),
        'returns Error on white-space-only documents.'
      );
      t.ok(
        (repo.parseItemDoc(crlfTest) as Error).message.includes('Invalid'),
        'returns Error on missing CRLF white-space.'
      );
      t.ok(
        (repo.parseItemDoc(sepTest) as Error).message.includes('Separator'),
        'returns Error on missing separator.'
      );
      t.ok(
        (repo.parseItemDoc(missingQ) as Error).message.includes('Missing'),
        'returns Error if missing questions block.'
      );
      t.ok(
        ~(repo.parseItemDoc(missingA) as Error).message.includes('Missing'),
        'returns Error if missing answer.'
      );
      t.ok(
        (repo.parseItemDoc(invalidCharTest) as Error).message.includes('contain Invalid'),
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
      const errorDoc = readFileSync(`${mocks}/invalidCharTest.txt`, 'utf-8');
      const passingDoc = readFileSync(`${mocks}/passingDocTest.txt`, 'utf-8');
      const identicalQDoc = readFileSync(`${mocks}/qTruncatedTest.txt`, 'utf-8');
      const invalidQDoc   = readFileSync(`${mocks}/qInvalidTest.txt`, 'utf-8');
      dict.words       = [['large', 'big', 'enormous', 'giant']];
      const identicalVal  = (repo.addDocItem(identicalQDoc) as Error);
      t.ok(
        (repo.addDocItem(errorDoc) as Error).message.includes('Invalid chars'),
        'returns error if parseReplyDoc() fails.'
      );
      t.is(repo.addDocItem(passingDoc), null,
        'returns null when reply doc added successfully.'
      );
      t.is(repo.items[0].hashes.length, 4,
        'adds a hash for every question in document.'
      );
      t.ok(
        (repo.addDocItem(invalidQDoc) as Error).message.includes('is Invalid'),
        'returns Error with invalid questions.'
      );
      t.ok(
        identicalVal.message.includes('is identical to'),
        'returns Error with identical hashes.'
      );
    });

    t.test('hashQuestions(): Error|number', async t => {
      const questions     = ['what is this', 'what is that', 'what is what'];
      const hashes        = repo.hashQuestions(questions);

      t.ok(Array.isArray(hashes),
        'returns an array of hashes on success.'
      );
      t.is((hashes as number[]).length, 3,
        'returns the same amount of hashes as questions.'
      );

    });

    del(folderPath); // Cleanup
  });
});