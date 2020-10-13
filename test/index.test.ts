import { SAI } from "../lib";
import { existsSync, readFileSync } from 'fs';
import del from 'del';
import t from 'tape';
import { IqErrorCode, Inquiry } from "../lib/database/inquiryman";
import { mockDir } from "../lib/variables/constants";
import { FileOps } from "../lib/core/file-ops";



const mocks = `${mockDir}/sai`;
const fileOps = new FileOps();
const dateNow = Date.now();


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

t('SAI Class', async t => {
  const folderPath = './test/test';
  const sai = new SAI(folderPath,
    (err) => {
      t.test('constructor()', async t => {
        t.equal(err, null,
          'returns no errors on proper instantiation'
        );
        if (err) console.log(err);
        t.ok(existsSync(folderPath),
          'creates test folder'
        );
        t.ok(existsSync(`${folderPath}/inquiries.said.gzip`),
          'creates repository file.'
        );
        t.ok(existsSync(`${folderPath}/dictionary.said.gzip`),
          'creates a dictionary file.'
        );
        t.pass('executes isReady() callback after SAI{}.init()');
      });


      t.test('get dictionary()', async t => {
        t.ok(Array.isArray(sai.dictionary.words),
          'returns the active dictionary object.'
        );
      });


      t.test('get repository', async t => {
        t.ok(Array.isArray(sai.inquiryManager.inquiries),
          'returns the active repository object.'
        );
      });


      t.test('get questions', async t => {
        const id = sai.inquiryManager.contemplate.encodeQuery('what is love'.split(' '));
        const item = createItem([id!], 'blah');
        sai.inquiryManager.inquiries = [item];
        const qs = sai.questions;
        t.ok(Array.isArray(qs),
          'returns an array.'
        );
        t.ok(Array.isArray(qs[0]),
          'returns an array of arrays of questions.'
        );
      });


      t.test('init(): void', t => {
        t.plan(1);
        // A readonly folder must be created for this test
        new SAI('./test/readonly', err => {
          if (err) t.pass('bubbles up errors to callback.');
          else t.fail('did not bubble up error to callback');
        });
      });


      t.test('ask(): RepoItem|RepErrorCode|undefined', async t => {
        const invalidQuestion = sai.ask('tell me about something');
        sai.inquiryManager.inquiries = [createItem(['Q3xnb29k'], 'blah blah')];
        const goodQuestion = sai.ask('what is good') as Inquiry;
        t.is(goodQuestion.answer, 'blah blah',
          'returns RepoItem if question is found.'
        );
        t.is(invalidQuestion, IqErrorCode.Question,
          'returns Error Code on invalid question.'
        );
        t.is(sai.ask('what is a test'), undefined,
          'returns undefined if question not found.'
        );
        sai.inquiryManager.inquiries = [];
      });


      t.test('addQuestion(): Promise<RepoItem>', async t => {
        const addQuestion = readFileSync(`${mocks}/addQuestionTest.txt`, 'utf-8');
        sai.inquiryManager.path = `${mocks}/failpath/rep.said.gzip`;
        await sai.addInquiry(addQuestion)
          .catch((err: NodeJS.ErrnoException) => {
            t.is(err.code, 'ENOENT',
              'throws Error if save operation throws.'
            );
          })
        ;
        sai.inquiryManager.path = `${folderPath}/repository.said.gzip`;
        await sai.addInquiry('')
          .catch(errCode => {
            t.is(errCode, IqErrorCode.Empty,
              'returns Error Code with invalid document.'
            );
          })
        ;
        const res = await sai.addInquiry(addQuestion);
        t.is(res.answer, 'hello penguins!!',
          'returns a promised null on success.'
        );
        const items = fileOps.readRepoStore(sai.inquiryManager.path);
        t.is(items[0].answer, 'hello penguins!!',
          'saves the question to the database.'
        );
      });


      t.test('editQuestion(): Promise<RepoItem>', async t => {
        const editQuestion = readFileSync(`${mocks}/editQuestionTest.txt`, 'utf-8');
        sai.inquiryManager.path = `${mocks}/failpath/rep.said.gzip`;
        await sai.editInquiry(editQuestion)
          .catch((err: NodeJS.ErrnoException) => {
            t.is(err.code, 'ENOENT',
              'throws Error if save operation throws.'
            );
          })
        ;
        sai.inquiryManager.path = `${folderPath}/repository.said.gzip`;
        await sai.editInquiry('')
          .catch((err: IqErrorCode) => {
            t.is(err, IqErrorCode.Empty,
              'returns an Error Code with an Invalid Document.'
            );
          })
        ;
        const res = await sai.editInquiry(editQuestion);
        t.is(res.answer, 'hello lobsters!!',
          'returns RepoItem on success.'
        );
        const items = fileOps.readRepoStore(sai.inquiryManager.path);
        t.is(items[0].answer, 'hello lobsters!!',
          'saves the edited question to the database.'
        );

        del(folderPath);
      });
    })
  ;
});



