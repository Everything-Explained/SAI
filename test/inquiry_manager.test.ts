import del from 'del';
import { readFile, readFileSync } from 'fs';
import tape from 'tape';
import { FileOps } from '../lib/core/file-ops';
import { ParityManager, paritySchema } from '../lib/database/parity_manager';
import { InquiryManager, Inquiry, inquiryScheme, InqErrorCode, InquiryDocObj } from '../lib/database/inquiry_manager';
import { Constants } from '../lib/variables/constants';
import fm from 'front-matter';
import smap from 'source-map-support';

smap.install();



const fileOps    = new FileOps();
const folderPath = `${Constants.mockDir}/inquiries`;
const mocks      = `${Constants.mockDir}/doctests`;
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


const testData = [
  createInquiry(
    ['Q3xsb3Zl', 'R3xnb2Q='], // what is love; who is god
    'hello world'
  )
];

// Properties must match scheme field order
// Mocked from ./test/mocks/doctests/passingDocTest.txt
const passingMockData = {
  title: 'Sexy title!',
  ids: [
    'Q3xza3k=',
    'RXxza3k=',
    'RHwlMDN8c2VlfHNreQ==',
    'QXxza3l8c298YnJpZ2h0'
  ],
  answer: 'A lovely bunch of cocoanuts',
  authors: [ 'Test' ],
  editedBy: 'Test',
  level: 0,
  tags: [],
  dateCreated: 1603069729272,
  dateEdited: 1603069729272,
} as Inquiry;

// Mocked from ./test/mocks/doctests/passingDocTest.txt
const passingInquiryDoc = `---
title: Sexy title!
questions:
- what sky
- where sky
- when i see sky
- how sky so bright
author: Test
level: 0
editId: Q3xza3k=
---
A lovely bunch of cocoanuts`;

// Properties must match scheme field order
// Mocked from ./test/mocks/doctest/editItemTest.txt
const passingEditMockData = {
  title: 'chicken',
  ids: [ 'Q3xjaGlja2Vu', 'RXxjaGlja2Vu', 'QXxjaGlja2VufG1hZGU=' ],
  answer: 'some random answer!',
  authors: [ 'blah', 'unique' ],
  editedBy: 'unique',
  level: 1,
  tags: [],
  dateCreated: 1603142726025,
  dateEdited: 1603142726025,
} as Inquiry;



fileOps.createFolder(folderPath);
const inquiriesPath = `${folderPath}/inquiries.said.gzip`;
fileOps.save(`${folderPath}/parity.said.gzip`, paritySchema, [], true, false);
fileOps.save(inquiriesPath, inquiryScheme, testData, true, false)
.then(err => {
  if (err) {
    console.log(err);
    throw err; // We want to kill testing
  }
  const parityMngr = new ParityManager(fileOps, `${folderPath}/parity.said.gzip`);

  tape('InquiryManager{}', async t => {
    const inquiryMngr = new InquiryManager(fileOps, parityMngr, inquiriesPath);

    t.test('constructor() finds existing replies path.', async t => {
      t.doesNotThrow(() => new InquiryManager(fileOps, parityMngr, inquiriesPath));
    });
    t.test('constructor() throws an error if the path does not exist.', async t => {
      t.throws(() => new InquiryManager(fileOps, parityMngr, 'invalid/path.test'));
    });

    t.test('get queryProcessor: returns the active QueryProcessor object.', async t => {
      // Testing any method that exists on the expected object.
      t.ok(inquiryMngr.queryProcessor.applyContextCodes);
    });

    t.test('getInquiryById() returns the expected inquiry data from file.', async t => {
      const validInquiry = inquiryMngr.getInquiryById('R3xnb2Q=');
      t.same(validInquiry!.ids, ['Q3xsb3Zl', 'R3xnb2Q=']);
      inquiryMngr.inquiries = [];
    });
    t.test('getInquiryById() returns undefined when inquiry not found.', async t => {
      t.is(inquiryMngr.getInquiryById('ThisIdDoesNotExist'), undefined);
    });

    t.test('getInquiryByQuestion() returns Question error code on invalid question.', async t => {
      inquiryMngr.inquiries = testData;
      t.is(inquiryMngr.getInquiryByQuestion('tell me something'), InqErrorCode.Question);
      inquiryMngr.inquiries = [];
    });
    t.test('getInquiryByQuestion() returns undefined if question not found.', async t => {
      t.is(inquiryMngr.getInquiryByQuestion('where is the sausage'), undefined);
    });
    t.test('getInquiryByQuestion() returns an Inquiry object if question is found.', async t => {
      inquiryMngr.inquiries = testData;
      const inquiry = inquiryMngr.getInquiryByQuestion('what is love') as Inquiry;
      t.is(inquiry.ids[0], 'Q3xsb3Zl');
      inquiryMngr.inquiries = [];
    });

    t.test('indexOfInquiry() returns index of an Inquiry by id.', async t => {
      inquiryMngr.inquiries = testData;
      t.is(inquiryMngr.indexOf('R3xnb2Q='), 0);
      inquiryMngr.inquiries = [];
    });
    t.test('indexOfInquiry() returns -1 if index is not found.', async t => {
      inquiryMngr.inquiries = testData;
      t.is(inquiryMngr.indexOf('3Aeq71='), -1);
      inquiryMngr.inquiries = [];
    });

    t.test('getQuestionsFrom(): returns an Array of decoded questions from an Inquiry Obj.', async t => {
      inquiryMngr.inquiries = testData;
      t.same(inquiryMngr.getQuestionsFrom(testData[0]), ['what love', 'who god']);
      inquiryMngr.inquiries = [];
    });

    t.test('getInquiryFrom() returns the Empty error code with white-space-only documents.', async t => {
      const emptyTest = readFileSync(`${mocks}/emptyTest.txt`, 'utf-8');
      t.is(inquiryMngr.getInquiryFrom(emptyTest), InqErrorCode.Empty);
    });
    t.test('getInquiryFrom() returns Head error code with missing front-matter head.', async t => {
      const noMatter = readFileSync(`${mocks}/noMatterTest.txt`, 'utf-8');
      t.is(inquiryMngr.getInquiryFrom(noMatter), InqErrorCode.Head);
    });
    t.test('getInquiryFrom() returns HeadSyntax error code with invalid front-matter syntax.', async t => {
      const isInvalid = readFileSync(`${mocks}/invalidDocTest.txt`, 'utf-8');
      t.is(inquiryMngr.getInquiryFrom(isInvalid), InqErrorCode.HeadSyntax);
    });
    t.test('getInquiryFrom() returns Question error code when question block is malformed.', async t => {
      const questionMissing      = readFileSync(`${mocks}/missingQstnTest.txt`   , 'utf-8');
      const questionNotArray     = readFileSync(`${mocks}/invalidQArrayTest.txt` , 'utf-8');
      const questionInvalidChars = readFileSync(`${mocks}/invalidCharTest.txt`   , 'utf-8');
      t.is(inquiryMngr.getInquiryFrom(questionMissing)      , InqErrorCode.Question);
      t.is(inquiryMngr.getInquiryFrom(questionNotArray)     , InqErrorCode.Question);
      t.is(inquiryMngr.getInquiryFrom(questionInvalidChars) , InqErrorCode.Question);
    });
    t.test('getInquiryFrom() returns Title error code with missing title.', async t => {
      const missingTitle = readFileSync(`${mocks}/missingTitleTest.txt`, 'utf-8');
      t.is(inquiryMngr.getInquiryFrom(missingTitle), InqErrorCode.Title);
    });
    t.test('getInquiryFrom() returns Author error code with missing author.', async t => {
      const missingAuthor = readFileSync(`${mocks}/missingAuthTest.txt`, 'utf-8');
      t.is(inquiryMngr.getInquiryFrom(missingAuthor), InqErrorCode.Author);
    });
    t.test('getInquiryFrom() returns Level error code with missing or invalid level.', async t => {
      const missingLevel  = readFileSync(`${mocks}/missingLevelTest.txt`  , 'utf-8');
      const negativeLevel = readFileSync(`${mocks}/negativeLevelTest.txt` , 'utf-8');
      t.is(inquiryMngr.getInquiryFrom(missingLevel)  , InqErrorCode.Level);
      t.is(inquiryMngr.getInquiryFrom(negativeLevel) , InqErrorCode.Level);
    });
    t.test('getInquiryFrom() returns Answer error code with missing answer.', async t => {
      const missingA = readFileSync(`${mocks}/missingAnsTest.txt`, 'utf-8');
      t.is(inquiryMngr.getInquiryFrom(missingA), InqErrorCode.Answer);
    });
    t.test('getInquiryFrom() returns an expected valid Inquiry.', async t => {
      const passingDoc = readFileSync(`${mocks}/passingDocTest.txt`, 'utf-8');
      const passingVal = inquiryMngr.getInquiryFrom(passingDoc) as Inquiry;
      // Timestamps cannot be validated in this context.
      passingMockData.dateCreated = passingVal.dateCreated;
      passingMockData.dateEdited = passingVal.dateEdited
      ;
      t.same(passingVal, passingMockData);
    });
    t.test('getInquiryFrom() returns a valid Inquiry without an editId.', async t => {
      const passingDoc = readFileSync(`${mocks}/passingDocTest.txt`, 'utf-8');
      const passingVal = inquiryMngr.getInquiryFrom(passingDoc) as Inquiry;
      t.is(passingVal.editId, undefined);
    });

    t.test('getInquiryDocFrom() ', async t => {
      const doc = inquiryMngr.getInquiryDocFrom(passingMockData);
      t.is(doc, passingInquiryDoc);
    });

    t.test('editInquiry() returns a valid Inquiry Object on edit success.', async t => {
      inquiryMngr.inquiries = testData.slice();
      const dateCreated     = inquiryMngr.inquiries[0].dateCreated;
      const inquiryDoc      = readFileSync(`${mocks}/editItemTest.txt`, 'utf-8');
      const editedInquiry   = inquiryMngr.editInquiry(inquiryDoc) as Inquiry;
      const isEditDateUpd   = editedInquiry.dateEdited > editedInquiry.dateCreated;
      const editedInqInMngr = inquiryMngr.inquiries[0]
      ;
      // Cannot validate time stamps in this context
      passingEditMockData.dateCreated = editedInquiry.dateCreated;
      passingEditMockData.dateEdited = editedInquiry.dateEdited
      ;
      t.isNot(editedInquiry.answer, undefined,          'does not error');
      t.same(editedInqInMngr, passingEditMockData,      'adds edited inquiry to internal inquiries array');
      t.same(editedInquiry, passingEditMockData,        'is valid inquiry object');
      t.same(editedInquiry.authors, ['blah', 'unique'], 'appends unique authors');
      t.ok(isEditDateUpd,                               'edited date is ahead of created date');
      t.is(dateCreated, editedInquiry.dateCreated,      'creation date does not change');
      t.is(editedInquiry.editId, undefined,             'edit id is removed');
      inquiryMngr.inquiries = [];
    });
    t.test('editInquiry() returns an EditId error code when missing editId property.', async t => {
      const inqDoc = readFileSync(`${mocks}/missingEditIdTest.txt`, 'utf-8');
      t.is(inquiryMngr.editInquiry(inqDoc), InqErrorCode.EditId);
    });
    t.test('editInquiry() returns an error code if the document is invalid.', async t => {
      const inqDoc = readFileSync(`${mocks}/invalidEditItemTest.txt`, 'utf-8');
      t.is(inquiryMngr.editInquiry(inqDoc), InqErrorCode.Head);
    });
    t.test('editInquiry() returns a BadEditId error code if the edit id is not found.', async t => {
      const inqDoc = readFileSync(`${mocks}/editItemNoExistTest.txt`, 'utf-8');
      t.is(inquiryMngr.editInquiry(inqDoc), InqErrorCode.BadEditId);
    });
    t.test('editInquiry() ignores editedBy if author already exists.', async t => {
      inquiryMngr.inquiries = testData.slice();
      const doc = readFileSync(`${mocks}/editItemAuthorExistsTest.txt`, 'utf-8');
      const inq = inquiryMngr.editInquiry(doc) as Inquiry;
      t.same(inq.authors, ['blah']);
      inquiryMngr.inquiries = [];
    });

    t.test('addInquiryDoc() returns error code on invalid document.', async t => {
      const errorDoc = readFileSync(`${mocks}/invalidCharTest.txt`, 'utf-8');
      t.is(typeof inquiryMngr.addInquiry(errorDoc), 'number');
    });
    t.test('addInquiryDoc() returns a valid Inquiry Object when adding successfully.', async t => {
      const passingDoc = readFileSync(`${mocks}/passingDocTest.txt`, 'utf-8');
      const inq = inquiryMngr.addInquiry(passingDoc) as Inquiry
      ;
      // Cannot validate Timestamps in this context.
      passingMockData.dateCreated = inq.dateCreated;
      passingMockData.dateEdited = inq.dateEdited
      ;
      t.same(inq, passingMockData);
      inquiryMngr.inquiries = [];
    });
    t.test('addInquiryDoc() returns Question error code with invalid questions.', async t => {
      const doc = readFileSync(`${mocks}/qInvalidTest.txt`, 'utf-8');
      t.is(inquiryMngr.addInquiry(doc), InqErrorCode.Question);
    });
    t.test('addInquiryDoc() returns DuplicateId error code with identical ids.', async t => {
      parityMngr.words = [['large', 'big']];
      const doc = readFileSync(`${mocks}/qTruncatedTest.txt`, 'utf-8');
      const inq = inquiryMngr.addInquiry(doc) as InqErrorCode;
      t.is(inq, InqErrorCode.DuplicateId);
      parityMngr.words = [];
      inquiryMngr.inquiries = [];
    });
    t.test('addInquiryDoc() edits an existing Inquiry Doc if an edit id is present.', async t => {
      inquiryMngr.inquiries = testData.slice();
      const doc = readFileSync(`${mocks}/addAlsoEditsTest.txt`, 'utf-8');
      inquiryMngr.addInquiry(doc) as Inquiry;
      t.is(inquiryMngr.inquiries.length, 1);
      t.is(inquiryMngr.inquiries[0].answer, 'This will edit through adding');
      inquiryMngr.inquiries = [];
    });

    t.test('encodeQuestions() returns an array of ids on success.', async t => {
      const questions = ['what is this', 'what is that', 'what is what'];
      const ids       = inquiryMngr.encodeQuestions(questions) as string[];
      t.ok(Array.isArray(ids));
    });
    t.test('encodeQuestions() returns Question error code with invalid questions.', async t => {
      const invalidQs = ['tell me what to do', 'when will it be time'];
      t.is(inquiryMngr.encodeQuestions(invalidQs), InqErrorCode.Question);
    });
    t.test('encodeQuestions() returns DuplicateId with semantically identical questions.', async t => {
      parityMngr.words  = [['large', 'big']];
      const identicalQs = ['how big is the world', 'how large is the world'];
      t.is(inquiryMngr.encodeQuestions(identicalQs), InqErrorCode.DuplicateId);
    });
    t.test('encodeQuestions() returns the same amount of ids as questions.', async t => {
      const questions = ['what is this', 'what is that', 'what is what'];
      const ids       = inquiryMngr.encodeQuestions(questions) as string[];
      t.is(ids.length, 3);
    });

    t.test('save() saves inquiries to their respective file.', t => {
      t.plan(2);
      inquiryMngr.inquiries = [passingMockData];
      inquiryMngr.save()
        .then(() => {
          const savedInquiries = fileOps.readInquiryStore(`${folderPath}/inquiries.said.gzip`);
          const savedInqData = savedInquiries[0].toString();
          const oldInqData = JSON.stringify(passingMockData)
          ;
          t.pass('saves without errors');
          t.same(savedInqData, oldInqData, 'saved data matches original data')
          ;
          del(folderPath); // Cleanup
        })
        .catch(err => {
          console.log(err);
          t.fail(err.message);
          del(folderPath); // Cleanup
        });
    });

    t.test('checkIntegrity() returns null if integrity is good.', async t => {
      inquiryMngr.inquiries = [
        testData.slice()[0],
        passingMockData
      ];
      t.is(inquiryMngr.checkIntegrity(), null);
    });
    t.test('checkIntegrity() returns the first failed Inquiry on id collision.', async t => {
      inquiryMngr.inquiries = [
        createInquiry(['Q3xsb3Zl', 'R3xnb2Q='], 'hello world'),
        createInquiry(['R3xnb2Q=', 'A38aEonZ8='], 'will collide')
      ];
      const failedInquiry = inquiryMngr.checkIntegrity() as Inquiry;
      t.is(failedInquiry.answer, 'will collide');
    });
    t.test('checkIntegrity() detects id collisions within an inquiries own ids.', async t => {
      inquiryMngr.inquiries = [
        createInquiry(['Q3xsb3Zl', 'j3E4b27='], 'hello world'),
        createInquiry(['R3xnb2Q=', 'A38aEonZ8=', 'R3xnb2Q='], 'will collide on itself')
      ];
      const failedInquiry = inquiryMngr.checkIntegrity() as Inquiry;
      t.is(failedInquiry.answer, 'will collide on itself');
    });
  });
});