import del from 'del';
import { readFileSync } from 'fs';
import t from 'tape';
import { FileOps } from '../src/core/file-ops';
import { Dictionary, dictSchema } from '../src/database/dictionary';
import { Repository, RepoItem, repositoryScheme, DocErrorCode } from '../src/database/repository';
import { testDir } from '../src/variables/constants';



const fileOps = new FileOps();
const folderPath = `${testDir}/repository`;
const mocks = `${testDir}/doctests`;
const dateNow = Date.now();
const editItem: RepoItem = {
  questions: ['chicken', 'lobster'],
  answer: 'hello pickles!',
  hashes: [234821348, 123481234],
  authors: ['Test'],
  tags: [],
  level: 0,
  dateCreated: dateNow,
  dateEdited: dateNow
};
const testData = [
  { questions: ['asdf', 'qwer'],
    answer: 'hello world',
    hashes: [234821348, 123481234],
    authors: [],
    tags: [],
    level: 0,
    dateCreated: dateNow,
    dateEdited: dateNow
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

    t.test('getItem(): Reply|undefined', async t => {
      t.equal(repo.getItem(123481234)!.answer, 'hello world',
        'returns a Reply object.'
      );
      t.equal(repo.getItem(58519234), undefined,
        'returns undefined when reply not found.'
      );
      repo.items = [];
    });

    t.test('indexOfItem(): number', async t => {
      repo.items = testData;
      t.is(repo.indexOfItem(123481234), 0,
        'returns index of RepoItem by specified hash.'
      );
      t.is(repo.indexOfItem(4812348), -1,
        'returns -1 if index is not found'
      );
      repo.items = [];
    });

    t.test('parseItemDoc(): Error | [string[], string]', async t => {
      const emptyTest       = readFileSync(`${mocks}/emptyTest.txt`, 'utf-8');
      const isInvalid       = readFileSync(`${mocks}/invalidDocTest.txt`, 'utf-8');
      const noMatter        = readFileSync(`${mocks}/noMatterTest.txt`, 'utf8');
      const missingQ        = readFileSync(`${mocks}/missingQTest.txt`, 'utf-8');
      const missingA        = readFileSync(`${mocks}/missingATest.txt`, 'utf-8');
      const invalidCharTest = readFileSync(`${mocks}/invalidCharTest.txt`, 'utf-8');
      const passingDoc      = readFileSync(`${mocks}/passingDocTest.txt`, 'utf-8');
      const passingVal      = repo.parseItemDoc(passingDoc);
      t.is(
        repo.parseItemDoc(emptyTest), DocErrorCode.EMPTY,
        'returns Error Code on white-space-only documents.'
      );
      t.is(
        repo.parseItemDoc(isInvalid), DocErrorCode.INVALID,
        'returns Error Code with invalid front-matter syntax.'
      );
      t.is(
        repo.parseItemDoc(noMatter), DocErrorCode.MISSHEAD,
        'returns Error Code when missing front-matter head.'
      );
      t.is(
        repo.parseItemDoc(missingQ), DocErrorCode.MISSQ,
        'returns Error Code if missing questions block.'
      );
      t.is(
        repo.parseItemDoc(missingA), DocErrorCode.MISSA,
        'returns Error Code if missing answer.'
      );
      t.is(
        repo.parseItemDoc(invalidCharTest), DocErrorCode.INVCHARINQ,
        'returns Error Code when questions contain invalid chars.'
      );
      t.ok(
        Array.isArray(passingVal),
        'returns Array containing the questions and an answer.'
      );
      t.is((passingVal as [string[], string])[0].length, 4,
        'question count should match question entry.'
      );
    });

    t.test('editItem(): boolean', async t => {
      repo.items = testData;
      const isEdited = repo.editItem(testData[0].hashes[0], editItem);
      const item = repo.items[0];
      const isUpdated =
           item.questions[0] == 'chicken'
        && item.answer == 'hello pickles!'
        && item.authors[0] == 'Test'
      ;
      t.ok(isEdited,
        'returns true when edited successfully.'
      );
      t.notOk(repo.editItem(34818234, editItem),
        'returns false if old hash not found.'
      );
      t.ok(isUpdated,
        'replaces old item with new edited item.'
      );
      repo.items = [];
    });

    t.test('addDocReply(): Error|null', async t => {
      const errorDoc = readFileSync(`${mocks}/invalidCharTest.txt`, 'utf-8');
      const passingDoc = readFileSync(`${mocks}/passingDocTest.txt`, 'utf-8');
      const identicalQDoc = readFileSync(`${mocks}/qTruncatedTest.txt`, 'utf-8');
      const invalidQDoc   = readFileSync(`${mocks}/qInvalidTest.txt`, 'utf-8');
      dict.words       = [['large', 'big', 'enormous', 'giant']];
      const identicalVal  = (repo.addDocItem(identicalQDoc, 'test') as Error);
      t.ok(
        (repo.addDocItem(errorDoc, 'test') as Error).message.includes('Invalid chars'),
        'returns error if parseReplyDoc() fails.'
      );
      t.is(repo.addDocItem(passingDoc, 'test'), null,
        'returns null when reply doc added successfully.'
      );
      t.is(repo.items[0].hashes.length, 4,
        'adds a hash for every question in document.'
      );
      t.ok(
        (repo.addDocItem(invalidQDoc, 'test') as Error).message.includes('is Invalid'),
        'returns Error with invalid questions.'
      );
      t.ok(
        identicalVal.message.includes('is identical to'),
        'returns Error with identical hashes.'
      );
      repo.items = [];
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

    t.test('save(): Promise<null>', t => {
      t.plan(2);
      repo.items = [editItem];
      repo.save()
        .then(() => {
          t.pass('saves repository to file.');
          const items = fileOps.readRepoStore(`${folderPath}/replies.said.gzip`);
          t.is(items[0].answer, 'hello pickles!',
            'saves same data that is in the in-memory object.'
          );
          del(folderPath); // Cleanup
        })
        .catch(err => {
          console.log(err);
          t.fail(err.message);
          del(folderPath); // Cleanup
        });
    });
  });
});