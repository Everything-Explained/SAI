import del from 'del';
import { readFileSync } from 'fs';
import t from 'tape';
import { FileOps } from '../lib/core/file-ops';
import { DictionaryManager, dictSchema } from '../lib/database/dictionaryman';
import { InquiryManager, Inquiry, inquiryScheme, IqErrorCode, InquiryDocObj } from '../lib/database/inquiryman';
import { mockDir } from '../lib/variables/constants';
import fm from 'front-matter';




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
  } as Inquiry;
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
fileOps.save(`${folderPath}/replies.said.gzip`, inquiryScheme, testData, true, false)
.then(err => {
  if (err) {
    console.log(err);
    throw err; // We want to kill testing
  }
  const dict = new DictionaryManager(fileOps, `${folderPath}/dictionary.said.gzip`);
  t('Repository{}', async t => {
    let repo: InquiryManager;
    t.test('contructor()', async t => {
      t.doesNotThrow(
        () => repo = new InquiryManager(fileOps, dict, `${folderPath}/replies.said.gzip`),
        'finds existing replies path.'
      );
      t.throws(() => new InquiryManager(fileOps, dict, 'blah/blah.asdf'),
        'throws an error if the path does not exist.');
    });

    t.test('contemplate', async t => {
      t.ok(repo.contemplate, 'gets the internal contemplate object.');
    });

    t.test('getItem(): Reply|undefined', async t => {
      t.equal(repo.getInquiryById('R3xnb2Q=')!.answer, 'hello world',
        'returns a Reply object.'
      );
      t.equal(repo.getInquiryById('Q1aSb34L'), undefined,
        'returns undefined when reply not found.'
      );
      repo.inquiries = [];
    });

    t.test('findQuestion(): RepErrorCode|RepoItem|undefined', async t => {
      repo.inquiries = testData;
      const item = repo.getInquiryByQuestion('what is love') as Inquiry;
      t.is(repo.getInquiryByQuestion('tell me something'), IqErrorCode.Question,
        'returns Error Code on invalid query.'
      );
      t.is(repo.getInquiryByQuestion('where is the sausage'), undefined,
        'returns undefined if question not found.'
      );
      t.is(item.ids[0], 'Q3xsb3Zl',
        'returns a RepoItem if found.'
      );
    });

    t.test('indexOfItem(): number', async t => {
      repo.inquiries = testData;
      t.is(repo.indexOfInquiry('R3xnb2Q='), 0,
        'returns index of RepoItem by id.'
      );
      t.is(repo.indexOfInquiry('3Aeq71='), -1,
        'returns -1 if index is not found'
      );
      repo.inquiries = [];
    });

    t.test('questionsFromItem(): string[]', async t => {
      repo.inquiries = testData;
      const questions = repo.questionsFromInquiry(testData[0]);
      t.same(questions, ['what love', 'who god'],
        'returns an Array of decoded questions from an item.'
      );
      repo.inquiries = [];
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
      const negativeLevel   = readFileSync(`${mocks}/negativeLevelTest.txt` , 'utf-8');
      const missingA        = readFileSync(`${mocks}/missingAnsTest.txt`    , 'utf-8');
      const invalidCharTest = readFileSync(`${mocks}/invalidCharTest.txt`   , 'utf-8');
      const passingDoc      = readFileSync(`${mocks}/passingDocTest.txt`    , 'utf-8');
      const passingVal      = repo.toInquiryItem(passingDoc) as Inquiry;
      t.is(
        repo.toInquiryItem(emptyTest), IqErrorCode.Empty,
        'returns Error Code on white-space-only documents.'
      );
      t.is(
        repo.toInquiryItem(noMatter), IqErrorCode.Head,
        'returns Error Code when missing front-matter head.'
      );
      t.is(
        repo.toInquiryItem(isInvalid), IqErrorCode.HeadSyntax,
        'returns Error Code with invalid front-matter syntax.'
      );
      t.is(
        repo.toInquiryItem(missingQ), IqErrorCode.Question,
        'returns Error Code when missing questions block.'
      );
      t.is(
        repo.toInquiryItem(invalidQArray), IqErrorCode.Question,
        'returns Error Code when questions are not an Array.'
      );
      t.is(
        repo.toInquiryItem(invalidCharTest), IqErrorCode.Question,
        'returns Error Code when questions contain invalid chars.'
      );
      t.is(repo.toInquiryItem(missingTitle), IqErrorCode.Title,
        'returns Error Code when missing title.'
      );
      t.is(repo.toInquiryItem(missingAuthor), IqErrorCode.Author,
        'returns Error Code when missing author.'
      );
      t.is(repo.toInquiryItem(missingLevel), IqErrorCode.Level,
        'returns Error Code when missing level.'
      );
      t.is(repo.toInquiryItem(negativeLevel), IqErrorCode.Level,
        'returns Error Code with a negative level value.'
      );
      t.is(
        repo.toInquiryItem(missingA), IqErrorCode.Answer,
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

    t.test('toInquiryDoc(): string', async t => {
      const doc = repo.toInquiryDoc(testData[0]);
      const matter = fm<InquiryDocObj>(doc);
      t.ok(fm.test(doc),
        'returns a document with valid Front Matter.'
      );
      t.same(matter.attributes.questions, ['what love', 'who god'],
        'returned document has valid questions.'
      );
      t.is(matter.attributes.author, 'blah',
        'returned document has valid author.'
      );
      t.is(matter.attributes.editId, 'Q3xsb3Zl',
        'returned document has valid editId.'
      );
      t.is(matter.attributes.level, 0,
        'returned document has valid level.'
      );
      t.is(matter.attributes.title, 'test',
        'returned document has valid title.'
      );
      t.is(matter.body, 'hello world',
        'returned document has valid answer.'
      );
    });

    t.test('editItem(): RepErrorCode|RepoItem', async t => {
      repo.inquiries = testData.slice();
      const createdDate = repo.inquiries[0].dateCreated;
      const doc = readFileSync(`${mocks}/editItemTest.txt`, 'utf-8');
      const missEditId = readFileSync(`${mocks}/missingEditIdTest.txt`, 'utf-8');
      const invalidItem = readFileSync(`${mocks}/invalidEditItemTest.txt`, 'utf-8');
      const itemNoExist = readFileSync(`${mocks}/editItemNoExistTest.txt`, 'utf-8');
      const authorExists = readFileSync(`${mocks}/editItemAuthorExistsTest.txt`, 'utf-8');
      const isEdited = repo.editInquiry(doc);
      const item = repo.inquiries[0];
      const isUpdated =
           item.ids[0] == 'Q3xjaGlja2Vu'
        && item.answer == 'hello chickens!'
        && repo.getInquiryById('Q3xsb3Zl') == undefined
      ;
      t.ok(typeof isEdited != 'number',
        'returns the edited RepoItem when edited successfully.'
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
      t.same(repo.inquiries[0].authors, ['blah', 'unique'],
        'appends unique authors to the authors Array.'
      );
      t.is(repo.editInquiry(missEditId), IqErrorCode.EditId,
        'returns an Error Code when missing editId property.'
      );
      t.is(repo.editInquiry(invalidItem), IqErrorCode.Author,
        'returns an Error Code if the document is invalid.'
      );
      t.is(repo.editInquiry(itemNoExist), IqErrorCode.BadEditId,
        'returns an Error Code if the id is not found.'
      );
      repo.editInquiry(authorExists);
      t.is(repo.inquiries[0].answer, 'I am a new message',
        'updates item successfully when author already exists.'
      );
      t.same(repo.inquiries[0].authors, ['blah', 'unique'],
        'ignores edit author if author already exists.'
      );
      repo.inquiries = [];
    });

    t.test('addItemDoc(): RepErrorCode|RepoItem', async t => {
      const errorDoc      = readFileSync(`${mocks}/invalidCharTest.txt` , 'utf-8');
      const passingDoc    = readFileSync(`${mocks}/passingDocTest.txt`  , 'utf-8');
      const identicalQDoc = readFileSync(`${mocks}/qTruncatedTest.txt`  , 'utf-8');
      const invalidQDoc   = readFileSync(`${mocks}/qInvalidTest.txt`    , 'utf-8');
      const handToEdit    = readFileSync(`${mocks}/handToEditTest.txt`  , 'utf-8');
      dict.words          = [['large', 'big', 'enormous', 'giant']];
      const identicalVal  = repo.addInquiry(identicalQDoc) as IqErrorCode;
      t.is(
        typeof repo.addInquiry(errorDoc), 'number',
        'returns Error Code if parseReplyDoc() fails.'
      );
      t.is((repo.addInquiry(passingDoc) as Inquiry).answer, 'A lovely bunch of cocoanuts',
        'returns a RepoItem when reply doc added successfully.'
      );
      t.is(repo.inquiries[0].ids.length, 4,
        'adds an id for every question in document.'
      );
      t.is(
        repo.addInquiry(invalidQDoc), IqErrorCode.Question,
        'returns Error Code with invalid questions.'
      );
      t.is(
        identicalVal, IqErrorCode.DuplicateId,
        'returns Error Code with identical ids.'
      );
      repo.inquiries = [editItem];
      const editedItem = repo.addInquiry(handToEdit) as Inquiry;
      t.ok(editedItem.dateCreated < editedItem.dateEdited,
        'use editItem() if editId property is present.'
      );
      repo.inquiries = [];
    });

    t.test('encodeQuestions(): RepErrorCode|string[]', async t => {
      const questions   = ['what is this', 'what is that', 'what is what'];
      const invalidQs   = ['tell me what to do', 'when will it be time'];
      const identicalQs = ['how big is the world', 'how large is the world'];
      const ids         = repo.encodeQuestions(questions) as string[];

      t.ok(Array.isArray(ids),
        'returns an array of ids on success.'
      );
      t.is(repo.encodeQuestions(invalidQs), IqErrorCode.Question,
        'returns Error Code with invalid questions.'
      );
      t.is(repo.encodeQuestions(identicalQs), IqErrorCode.DuplicateId,
        'returns Error Code with semantically identical questions.'
      );
      t.is(ids.length, 3,
        'returns the same amount of ids as questions.'
      );

    });

    t.test('save(): Promise<null>', t => {
      t.plan(2);
      repo.inquiries = [editItem];
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
      repo.inquiries = [
        createItem(['Q3xsb3Zl', 'R3xnb2Q='], 'hello world'),
        editItem
      ];
      const goodResult = repo.checkIntegrity();
      repo.inquiries = [
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