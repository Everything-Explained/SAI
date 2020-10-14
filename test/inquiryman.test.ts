import del from 'del';
import { readFileSync } from 'fs';
import tape from 'tape';
import { FileOps } from '../lib/core/file-ops';
import { DictionaryManager, dictSchema } from '../lib/database/dictionaryman';
import { InquiryManager, Inquiry, inquiryScheme, InqErrorCode, InquiryDocObj } from '../lib/database/inquiryman';
import { mockDir } from '../lib/variables/constants';
import fm from 'front-matter';




const fileOps    = new FileOps();
const folderPath = `${mockDir}/inquiries`;
const mocks      = `${mockDir}/doctests`;
const dateNow    = Date.now();

function createInquiry(ids: string[], answer: string) {
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


const editInquiry = createInquiry(
  ['Q3xjaGlja2Vu', 'RXxjaGlja2Vu'], // what is chicken; where's the chicken
  'hello chickens!'
);

const testData = [
  createInquiry(
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
  tape('Inquiry{}', async t => {
    let inquiryMan: InquiryManager;
    t.test('contructor()', async t => {
      t.doesNotThrow(
        () => inquiryMan = new InquiryManager(fileOps, dict, `${folderPath}/replies.said.gzip`),
        'finds existing replies path.'
      );
      t.throws(() => new InquiryManager(fileOps, dict, 'blah/blah.asdf'),
        'throws an error if the path does not exist.'
      );
    });

    t.test('contemplate', async t => {
      t.ok(inquiryMan.contemplate, 'gets the internal contemplate object.');
    });

    t.test('getInquiryById(): Reply|undefined', async t => {
      const validInquiry = inquiryMan.getInquiryById('R3xnb2Q=');
      t.notEqual(validInquiry, undefined,
        'returns an inquiry if it exists.'
      );
      t.equal(inquiryMan.getInquiryById('Q1aSb34L'), undefined,
        'returns undefined when inquiry not found.'
      );
      inquiryMan.inquiries = [];
    });

    t.test('getInquiryByQuestion(): RepErrorCode|Inquiry|undefined', async t => {
      inquiryMan.inquiries = testData;
      const inquiry = inquiryMan.getInquiryByQuestion('what is love') as Inquiry;
      t.is(inquiryMan.getInquiryByQuestion('tell me something'), InqErrorCode.Question,
        'returns Error Code on invalid query.'
      );
      t.is(inquiryMan.getInquiryByQuestion('where is the sausage'), undefined,
        'returns undefined if question not found.'
      );
      t.is(inquiry.ids[0], 'Q3xsb3Zl',
        'returns a Inquiry if found.'
      );
    });

    t.test('indexOfInquiry(): number', async t => {
      inquiryMan.inquiries = testData;
      t.is(inquiryMan.indexOfInquiry('R3xnb2Q='), 0,
        'returns index of Inquiry by id.'
      );
      t.is(inquiryMan.indexOfInquiry('3Aeq71='), -1,
        'returns -1 if index is not found'
      );
      inquiryMan.inquiries = [];
    });

    t.test('questionsFromInquiry(): string[]', async t => {
      inquiryMan.inquiries = testData;
      const questions = inquiryMan.questionsFromInquiry(testData[0]);
      t.same(questions, ['what love', 'who god'],
        'returns an Array of decoded questions from an inquiry.'
      );
      inquiryMan.inquiries = [];
    });

    t.test('toInquiry(): InqErrorCode|Inquiry', async t => {
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
      const passingVal      = inquiryMan.toInquiry(passingDoc) as Inquiry;
      t.is(
        inquiryMan.toInquiry(emptyTest), InqErrorCode.Empty,
        'returns Error Code on white-space-only documents.'
      );
      t.is(
        inquiryMan.toInquiry(noMatter), InqErrorCode.Head,
        'returns Error Code when missing front-matter head.'
      );
      t.is(
        inquiryMan.toInquiry(isInvalid), InqErrorCode.HeadSyntax,
        'returns Error Code with invalid front-matter syntax.'
      );
      t.is(
        inquiryMan.toInquiry(missingQ), InqErrorCode.Question,
        'returns Error Code when missing questions block.'
      );
      t.is(
        inquiryMan.toInquiry(invalidQArray), InqErrorCode.Question,
        'returns Error Code when questions are not an Array.'
      );
      t.is(
        inquiryMan.toInquiry(invalidCharTest), InqErrorCode.Question,
        'returns Error Code when questions contain invalid chars.'
      );
      t.is(inquiryMan.toInquiry(missingTitle), InqErrorCode.Title,
        'returns Error Code when missing title.'
      );
      t.is(inquiryMan.toInquiry(missingAuthor), InqErrorCode.Author,
        'returns Error Code when missing author.'
      );
      t.is(inquiryMan.toInquiry(missingLevel), InqErrorCode.Level,
        'returns Error Code when missing level.'
      );
      t.is(inquiryMan.toInquiry(negativeLevel), InqErrorCode.Level,
        'returns Error Code with a negative level value.'
      );
      t.is(
        inquiryMan.toInquiry(missingA), InqErrorCode.Answer,
        'returns Error Code when missing answer.'
      );
      t.is(
        passingVal.answer, "A lovely bunch of cocoanuts",
        'returns a valid Inquiry.'
      );
      t.is(passingVal.ids.length, 4,
        'question count should match question entry.'
      );
      t.is(passingVal.editId, undefined,
        'editedBy should be undefined when unspecified.'
      );
    });

    t.test('toInquiryDoc(): string', async t => {
      const doc = inquiryMan.toInquiryDoc(testData[0]);
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

    t.test('editInquiry(): RepErrorCode|Inquiry', async t => {
      inquiryMan.inquiries = testData.slice();
      const createdDate = inquiryMan.inquiries[0].dateCreated;
      const doc = readFileSync(`${mocks}/editItemTest.txt`, 'utf-8');
      const missEditId = readFileSync(`${mocks}/missingEditIdTest.txt`, 'utf-8');
      const invalidInquiry = readFileSync(`${mocks}/invalidEditItemTest.txt`, 'utf-8');
      const inquiryNotExist = readFileSync(`${mocks}/editItemNoExistTest.txt`, 'utf-8');
      const authorExists = readFileSync(`${mocks}/editItemAuthorExistsTest.txt`, 'utf-8');
      const isEdited = inquiryMan.editInquiry(doc);
      const inquiry = inquiryMan.inquiries[0];
      const isUpdated =
           inquiry.ids[0] == 'Q3xjaGlja2Vu'
        && inquiry.answer == 'hello chickens!'
        && inquiryMan.getInquiryById('Q3xsb3Zl') == undefined
      ;
      t.ok(typeof isEdited != 'number',
        'returns the edited Inquiry when edited successfully.'
      );
      t.ok(isUpdated,
        'replaces old inquiry with new edited inquiry.'
      );
      t.ok(inquiry.dateCreated < inquiry.dateEdited,
        'edited date should be greater than created date.'
      );
      t.is(createdDate, inquiry.dateCreated,
        'will copy the dateCreated property from the original inquiry.'
      );
      t.same(inquiryMan.inquiries[0].authors, ['blah', 'unique'],
        'appends unique authors to the authors Array.'
      );
      t.is(inquiryMan.editInquiry(missEditId), InqErrorCode.EditId,
        'returns an Error Code when missing editId property.'
      );
      t.is(inquiryMan.editInquiry(invalidInquiry), InqErrorCode.Author,
        'returns an Error Code if the document is invalid.'
      );
      t.is(inquiryMan.editInquiry(inquiryNotExist), InqErrorCode.BadEditId,
        'returns an Error Code if the id is not found.'
      );
      inquiryMan.editInquiry(authorExists);
      t.is(inquiryMan.inquiries[0].answer, 'I am a new message',
        'updates inquiry successfully when author already exists.'
      );
      t.same(inquiryMan.inquiries[0].authors, ['blah', 'unique'],
        'ignores edit author if author already exists.'
      );
      inquiryMan.inquiries = [];
    });

    t.test('addInquiryDoc(): RepErrorCode|Inquiry', async t => {
      const errorDoc      = readFileSync(`${mocks}/invalidCharTest.txt` , 'utf-8');
      const passingDoc    = readFileSync(`${mocks}/passingDocTest.txt`  , 'utf-8');
      const identicalQDoc = readFileSync(`${mocks}/qTruncatedTest.txt`  , 'utf-8');
      const invalidQDoc   = readFileSync(`${mocks}/qInvalidTest.txt`    , 'utf-8');
      const handToEdit    = readFileSync(`${mocks}/handToEditTest.txt`  , 'utf-8');
      dict.words          = [['large', 'big', 'enormous', 'giant']];
      const identicalVal  = inquiryMan.addInquiry(identicalQDoc) as InqErrorCode;
      t.is(
        typeof inquiryMan.addInquiry(errorDoc), 'number',
        'returns Error Code if parseReplyDoc() fails.'
      );
      t.is((inquiryMan.addInquiry(passingDoc) as Inquiry).answer, 'A lovely bunch of cocoanuts',
        'returns a Inquiry when reply doc added successfully.'
      );
      t.is(inquiryMan.inquiries[0].ids.length, 4,
        'adds an id for every question in document.'
      );
      t.is(
        inquiryMan.addInquiry(invalidQDoc), InqErrorCode.Question,
        'returns Error Code with invalid questions.'
      );
      t.is(
        identicalVal, InqErrorCode.DuplicateId,
        'returns Error Code with identical ids.'
      );
      inquiryMan.inquiries = [editInquiry];
      const editedInquiry = inquiryMan.addInquiry(handToEdit) as Inquiry;
      t.ok(editedInquiry.dateCreated < editedInquiry.dateEdited,
        'use editInquiry() if editId property is present.'
      );
      inquiryMan.inquiries = [];
    });

    t.test('encodeQuestions(): RepErrorCode|string[]', async t => {
      const questions   = ['what is this', 'what is that', 'what is what'];
      const invalidQs   = ['tell me what to do', 'when will it be time'];
      const identicalQs = ['how big is the world', 'how large is the world'];
      const ids         = inquiryMan.encodeQuestions(questions) as string[];

      t.ok(Array.isArray(ids),
        'returns an array of ids on success.'
      );
      t.is(inquiryMan.encodeQuestions(invalidQs), InqErrorCode.Question,
        'returns Error Code with invalid questions.'
      );
      t.is(inquiryMan.encodeQuestions(identicalQs), InqErrorCode.DuplicateId,
        'returns Error Code with semantically identical questions.'
      );
      t.is(ids.length, 3,
        'returns the same amount of ids as questions.'
      );

    });

    t.test('save(): Promise<null>', t => {
      t.plan(2);
      inquiryMan.inquiries = [editInquiry];
      inquiryMan.save()
        .then(() => {
          t.pass('saves inquiries to file.');
          const inquiries = fileOps.readInquiryStore(`${folderPath}/replies.said.gzip`);
          t.is(inquiries[0].answer, 'hello chickens!',
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
      inquiryMan.inquiries = [
        createInquiry(['Q3xsb3Zl', 'R3xnb2Q='], 'hello world'),
        editInquiry
      ];
      const goodResult = inquiryMan.checkIntegrity();
      inquiryMan.inquiries = [
        createInquiry(['Q3xsb3Zl', 'R3xnb2Q='], 'hello world'),
        createInquiry(['R3xnb2Q=', 'A38aEonZ8='], 'will collide')
      ];
      const badResult = inquiryMan.checkIntegrity();

      t.is(goodResult, null,
        'returns null if the integrity is good'
      );
      t.is(badResult?.answer, 'will collide',
        'returns first occurrence of duplicate id.'
      );
    });
  });
});