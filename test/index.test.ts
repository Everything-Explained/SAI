import { SAI } from "../lib";
import { existsSync, readFileSync } from 'fs';
import del from 'del';
import t from 'tape';
import { InqErrorCode, Inquiry } from "../lib/database/inquiry_manager";
import { Constants } from "../lib/variables/constants";
import { FileOps } from "../lib/core/file-ops";
import smap from 'source-map-support';


smap.install(); // typescript file stack tracing

const mocks = `${Constants.mockDir}/sai`;
const fileOps = new FileOps();
const dateNow = Date.now();


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

t('SAI Class', async t => {
  const folderPath = './test/test';
  const sai = new SAI(folderPath,
    (err) => {
      t.test('constructor() returns no errors on proper instantiation.', async t => {
        t.equal(err, null);
        if (err) console.log(err);
      });
      t.test('constructor() executes isReady() callback after instantiation.', async t => {
        // We're already executing all tests within the isReady callback.
        t.pass('passes');
      });
      t.test('constructor() creates specified folder.', async t => (
        t.ok(existsSync(folderPath))
      ));
      t.test('constructor() creates default storage files.', async t => {
        t.ok(existsSync(`${folderPath}/inquiries.said.gzip`));
        t.ok(existsSync(`${folderPath}/parity.said.gzip`));
      });
      t.test('constructor() should ignore file creation if they already exist.', t => {
        t.plan(1);
        new SAI(folderPath, (err) => {
          if (err) t.fail('failed.');
          else t.pass('passed');
        });
      });

      t.test('get parityManager():  returns parity manager object', async t => {
        t.ok(Array.isArray(sai.parityManager.words));
      });
      t.test('get inquiryManager(): returns inquiry manager object.', async t => {
        t.ok(Array.isArray(sai.inquiryManager.inquiries));
      });
      t.test('get questions():      returns an array of arrays of questions.', async t => {
        const inquiryDoc = readFileSync(`${mocks}/addQuestionTest.txt`);
        sai.addInquiry(inquiryDoc.toString('utf-8'), false);
        t.same(sai.questions[0], ['where penguin', 'how big penguin']);
        sai.inquiryManager.inquiries = [];
      });

      t.test('init() throws an error when it fails to create files.', t => {
        t.plan(1);
        // A readonly folder must be created for this test
        new SAI('./test/readonly', err => {
          if (err) t.pass('bubbles up errors to callback.');
          else t.fail('did not bubble up error to callback');
        });
      });

      t.test('ask() returns an Inquiry if question is found.', async t => {
        sai.inquiryManager.inquiries = [createInquiry(['Q3xnb29k'], 'blah blah')];
        const goodQuestion = sai.ask('what is good') as Inquiry;
        t.is(goodQuestion.answer, 'blah blah');
        sai.inquiryManager.inquiries = [];
      });
      t.test('ask() returns an Error Code on invalid question.', async t => {
        const invalidQuestion = sai.ask('tell me about something');
        t.is(invalidQuestion, InqErrorCode.Question);
      });
      t.test('ask() returns undefined if question not found.', async t => {
        sai.inquiryManager.inquiries = [createInquiry(['Q3xnb29k'], 'blah blah')];
        t.is(sai.ask('what is a test'), undefined);
        sai.inquiryManager.inquiries = [];
      });

      t.test('addInquiry() throws an Error if save operation throws.', async t => {
        const inquiryDoc = readFileSync(`${mocks}/addQuestionTest.txt`, 'utf-8');
        sai.inquiryManager.path = `${folderPath}/failpath/inq.said.gzip`;
        await sai.addInquiry(inquiryDoc)
          .catch((err: NodeJS.ErrnoException) => {
            t.is(err.code, 'ENOENT');
          })
        ;
        sai.inquiryManager.path = `${folderPath}/inq.said.gzip`;
      });
      t.test('addInquiry() returns a promised Error Code on empty inquiryDoc.', async t => {
        await sai.addInquiry('')
        .catch((errCode: InqErrorCode) => {
          t.is(errCode, InqErrorCode.Empty,
            'returns Error Code with invalid document.'
          );
        });
      });
      t.test('addInquiry() returns the added Inquiry as a promise.', async t => {
        const inquiryDoc = readFileSync(`${mocks}/addQuestionTest.txt`, 'utf-8');
        const res = await sai.addInquiry(inquiryDoc);
        t.is(res.answer, 'hello penguins!!');
      });
      t.test('addInquiry() saves the inquiryDoc to the database.', async t => {
        const inquiries = fileOps.readInquiryStore(sai.inquiryManager.path);
        t.is(inquiries[0].answer, 'hello penguins!!');
      });

      t.test('editInquiry() throws an Error if save operation throws.', async t => {
        const inquiryDoc = readFileSync(`${mocks}/editQuestionTest.txt`, 'utf-8');
        sai.inquiryManager.path = `${folderPath}/failpath/inq.said.gzip`;
        await sai.editInquiry(inquiryDoc)
          .catch((err: NodeJS.ErrnoException) => {
            t.is(err.code, 'ENOENT');
          });
        sai.inquiryManager.path = `${folderPath}/inq.said.gzip`;
      });
      t.test('editInquiry() returns an Error Code with an Invalid Document.', async t => {
        await sai.editInquiry('')
          .catch((err: InqErrorCode) => {
            t.is(err, InqErrorCode.Empty);
          });
      });
      t.test('editInquiry() returns a promised Inquiry on success.', async t => {
        const inquiryDoc = readFileSync(`${mocks}/editQuestionTest.txt`, 'utf-8');
        const res = await sai.editInquiry(inquiryDoc);
        t.is(res.answer, 'hello lobsters!!');
        sai.inquiryManager.inquiries = [];
      });
      t.test('editInquiry() saves an edited Inquiry into the database.', async t => {
        const inquiryDocToAdd = readFileSync(`${mocks}/addQuestionTest.txt`).toString('utf-8');
        await sai.addInquiry(inquiryDocToAdd);
        t.is(sai.inquiryManager.inquiries[0].answer, 'hello penguins!!');
        const inquiryDocToEdit = readFileSync(`${mocks}/editQuestionTest.txt`, 'utf-8');
        try {
          await sai.editInquiry(inquiryDocToEdit);
          const inquiries = fileOps.readInquiryStore(sai.inquiryManager.path);
          t.is(inquiries[0].answer, 'hello lobsters!!');
          del(folderPath);
        }
        catch (err) {
          t.fail(`failed to edit inquiry: ${err}`);
          del(folderPath);
        }
      });
    })
  ;
});



