import del from 'del';
import { readFileSync } from 'fs';
import t from 'tape';
import { FileOps } from '../lib/core/file-ops';
import { Dictionary, dictSchema } from '../lib/database/dictionary';
import { Repository, RepoItem, repositoryScheme, RepErrorCode, ItemDoc } from '../lib/database/repository';
import { mockDir } from '../lib/variables/constants';




const fileOps    = new FileOps();
const folderPath = `${mockDir}/repository`;
const mocks      = `${mockDir}/doctests`;
const dateNow    = Date.now();

function createItem(ids: string[], answer: string) {
  return {
    title: 'test',
    ids,
    answer,
    level: 0,
    authors: ['blah'],
    tags: [],
    dateEdited: dateNow,
    dateCreated: dateNow,
    editedBy: ''
  } as RepoItem;
}


const editItem = createItem(
  ['Q3xjaGlja2Vu', 'RXxjaGlja2Vu'], // what is chicken; where's the chicken
  'hello chickens!'
);

const testData = [
  createItem(
    ['Q3xsb3Zl', 'R3xnb2Q='], // what is love; who is god
    'hello world'
  )
];



fileOps.createFolder(folderPath);
fileOps.save(`${folderPath}/dictionary.said.gzip`, dictSchema, [], true, false);
fileOps.save(`${folderPath}/replies.said.gzip`, repositoryScheme, testData, true, false)
.then(err => {
  if (err) {
    console.log(err);
    throw err; // We want to kill testing
  }
  const dict = new Dictionary(fileOps, `${folderPath}/dictionary.said.gzip`);
  t('Repository{}', async t => {
    let repo: Repository;
    t.test('contructor()', async t => {
      t.doesNotThrow(
        () => repo = new Repository(fileOps, dict, `${folderPath}/replies.said.gzip`),
        'finds existing replies path.'
      );
      t.throws(() => new Repository(fileOps, dict, 'blah/blah.asdf'),
        'throws an error if the path does not exist.');
    });

    t.test('contemplate', async t => {
      t.ok(repo.contemplate, 'gets the internal contemplate object.');
    });

    t.test('getItem(): Reply|undefined', async t => {
      t.equal(repo.getItem('R3xnb2Q=')!.answer, 'hello world',
        'returns a Reply object.'
      );
      t.equal(repo.getItem('Q1aSb34L'), undefined,
        'returns undefined when reply not found.'
      );
      repo.items = [];
    });

    t.test('findQuestion(): RepErrorCode|RepoItem|undefined', async t => {
      repo.items = testData;
      const item = repo.findQuestion('what is love') as RepoItem;
      t.is(repo.findQuestion('tell me something'), RepErrorCode.Question,
        'returns Error Code on invalid query.'
      );
      t.is(repo.findQuestion('where is the sausage'), undefined,
        'returns undefined if question not found.'
      );
      t.is(item.ids[0], 'Q3xsb3Zl',
        'returns a RepoItem if found.'
      );
    });

    t.test('indexOfItem(): number', async t => {
      repo.items = testData;
      t.is(repo.indexOfItem('R3xnb2Q='), 0,
        'returns index of RepoItem by id.'
      );
      t.is(repo.indexOfItem('3Aeq71='), -1,
        'returns -1 if index is not found'
      );
      repo.items = [];
    });

    t.test('toRepoItem(): RepErrorCode|RepoItem', async t => {
      const emptyTest       = readFileSync(`${mocks}/emptyTest.txt`         , 'utf-8');
      const noMatter        = readFileSync(`${mocks}/noMatterTest.txt`      , 'utf-8');
      const isInvalid       = readFileSync(`${mocks}/invalidDocTest.txt`    , 'utf-8');
      const missingQ        = readFileSync(`${mocks}/missingQstnTest.txt`   , 'utf-8');
      const invalidQArray   = readFileSync(`${mocks}/invalidQArrayTest.txt` , 'utf-8');
      const missingTitle    = readFileSync(`${mocks}/missingTitleTest.txt`  , 'utf-8');
      const missingAuthor   = readFileSync(`${mocks}/missingAuthTest.txt`   , 'utf-8');
      const missingLevel    = readFileSync(`${mocks}/missingLevelTest.txt`  , 'utf-8');
      const missingA        = readFileSync(`${mocks}/missingAnsTest.txt`    , 'utf-8');
      const invalidCharTest = readFileSync(`${mocks}/invalidCharTest.txt`   , 'utf-8');
      const passingDoc      = readFileSync(`${mocks}/passingDocTest.txt`    , 'utf-8');
      const passingVal      = repo.toRepoItem(passingDoc) as RepoItem;
      t.is(
        repo.toRepoItem(emptyTest), RepErrorCode.Empty,
        'returns Error Code on white-space-only documents.'
      );
      t.is(
        repo.toRepoItem(noMatter), RepErrorCode.Head,
        'returns Error Code when missing front-matter head.'
      );
      t.is(
        repo.toRepoItem(isInvalid), RepErrorCode.Invalid,
        'returns Error Code with invalid front-matter syntax.'
      );
      t.is(
        repo.toRepoItem(missingQ), RepErrorCode.Question,
        'returns Error Code when missing questions block.'
      );
      t.is(
        repo.toRepoItem(invalidQArray), RepErrorCode.Question,
        'returns Error Code when questions are not an Array.'
      );
      t.is(
        repo.toRepoItem(invalidCharTest), RepErrorCode.Question,
        'returns Error Code when questions contain invalid chars.'
      );
      t.is(repo.toRepoItem(missingTitle), RepErrorCode.Title,
        'returns Error Code when missing title.'
      );
      t.is(repo.toRepoItem(missingAuthor), RepErrorCode.Author,
        'returns Error Code when missing author.'
      );
      t.is(repo.toRepoItem(missingLevel), RepErrorCode.Level,
        'returns Error Code when missing level.'
      );
      t.is(
        repo.toRepoItem(missingA), RepErrorCode.Answer,
        'returns Error Code when missing answer.'
      );
      t.is(
        passingVal.answer, "A lovely bunch of cocoanuts",
        'returns an ItemDoc object.'
      );
      t.is(passingVal.ids.length, 4,
        'question count should match question entry.'
      );
      t.is(passingVal.editId, undefined,
        'editedBy should be undefined when unspecified.'
      );
    });

    t.test('editItem(): RepErrorCode|boolean', async t => {
      repo.items = testData.slice();
      const createdDate = repo.items[0].dateCreated;
      const doc = readFileSync(`${mocks}/editItemTest.txt`, 'utf-8');
      const missEditId = readFileSync(`${mocks}/missingEditIdTest.txt`, 'utf-8');
      const invalidItem = readFileSync(`${mocks}/invalidEditItemTest.txt`, 'utf-8');
      const itemNoExist = readFileSync(`${mocks}/editItemNoExistTest.txt`, 'utf-8');
      const authorExists = readFileSync(`${mocks}/editItemAuthorExistsTest.txt`, 'utf-8');
      const isEdited = repo.editItem(doc);
      const item = repo.items[0];
      const isUpdated =
           item.ids[0] == 'Q3xjaGlja2Vu'
        && item.answer == 'hello chickens!'
        && repo.getItem('Q3xsb3Zl') == undefined
      ;
      t.ok(isEdited,
        'returns true when edited successfully.'
      );
      t.ok(isUpdated,
        'replaces old item with new edited item.'
      );
      t.ok(item.dateCreated < item.dateEdited,
        'edited date should be greater than created date.'
      );
      t.is(createdDate, item.dateCreated,
        'will copy the dateCreated property from the original item.'
      );
      t.same(repo.items[0].authors, ['blah', 'unique'],
        'appends unique authors to the authors Array.'
      );
      t.is(repo.editItem(missEditId), RepErrorCode.EditId,
        'returns an Error Code when missing editId property.'
      );
      t.is(repo.editItem(invalidItem), RepErrorCode.Author,
        'returns an Error Code if the document is invalid.'
      );
      t.is(repo.editItem(itemNoExist), false,
        'returns false if the id is not found.'
      );
      repo.editItem(authorExists);
      t.is(repo.items[0].answer, 'I am a new message',
        'updates item successfully when author already exists.'
      );
      t.same(repo.items[0].authors, ['blah', 'unique'],
        'ignores edit author if author already exists.'
      );
      repo.items = [];
    });

    t.test('addItemDoc(): RepErrorCode|null', async t => {
      const errorDoc      = readFileSync(`${mocks}/invalidCharTest.txt`, 'utf-8');
      const passingDoc    = readFileSync(`${mocks}/passingDocTest.txt`, 'utf-8');
      const identicalQDoc = readFileSync(`${mocks}/qTruncatedTest.txt`, 'utf-8');
      const invalidQDoc   = readFileSync(`${mocks}/qInvalidTest.txt`, 'utf-8');
      dict.words          = [['large', 'big', 'enormous', 'giant']];
      const identicalVal  = repo.addItemDoc(identicalQDoc) as RepErrorCode;
      t.is(
        typeof repo.addItemDoc(errorDoc), 'number',
        'returns Error Code if parseReplyDoc() fails.'
      );
      t.is(repo.addItemDoc(passingDoc), null,
        'returns null when reply doc added successfully.'
      );
      t.is(repo.items[0].ids.length, 4,
        'adds a hash for every question in document.'
      );
      t.is(
        repo.addItemDoc(invalidQDoc), RepErrorCode.Question,
        'returns Error Code with invalid questions.'
      );
      t.is(
        identicalVal, RepErrorCode.IQuestion,
        'returns Error Code with identical ids.'
      );
      repo.items = [];
    });

    t.test('encodeQuestions(): RepErrorCode|string[]', async t => {
      const questions   = ['what is this', 'what is that', 'what is what'];
      const invalidQs   = ['tell me what to do', 'when will it be time'];
      const identicalQs = ['how big is the world', 'how large is the world'];
      const ids         = repo.encodeQuestions(questions) as string[];

      t.ok(Array.isArray(ids),
        'returns an array of ids on success.'
      );
      t.is(repo.encodeQuestions(invalidQs), RepErrorCode.Question,
        'returns Error Code with invalid questions.'
      );
      t.is(repo.encodeQuestions(identicalQs), RepErrorCode.IQuestion,
        'returns Error Code with semantically identical questions.'
      );
      t.is(ids.length, 3,
        'returns the same amount of ids as questions.'
      );

    });

    t.test('save(): Promise<null>', t => {
      t.plan(2);
      repo.items = [editItem];
      repo.save()
        .then(() => {
          t.pass('saves repository to file.');
          const items = fileOps.readRepoStore(`${folderPath}/replies.said.gzip`);
          t.is(items[0].answer, 'hello chickens!',
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

    t.test('checkIntegrity(): null|string', async t => {
      repo.items = [
        createItem(['Q3xsb3Zl', 'R3xnb2Q='], 'hello world'),
        editItem
      ];
      const goodResult = repo.checkIntegrity();
      repo.items = [
        createItem(['Q3xsb3Zl', 'R3xnb2Q='], 'hello world'),
        createItem(['R3xnb2Q=', 'A38aEonZ8='], 'will collide')
      ];
      const badResult = repo.checkIntegrity();

      t.is(goodResult, null,
        'returns null if the integrity is good'
      );
      t.is(badResult?.answer, 'will collide',
        'returns first occurrence of duplicate id.'
      );
    });
  });
});