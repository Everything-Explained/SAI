import { SAI } from "../lib";
import { existsSync, readFileSync } from 'fs';
import del from 'del';
import t from 'tape';
import { RepErrorCode, RepoItem } from "../lib/database/repository";
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
  } as RepoItem;
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
        t.ok(existsSync(`${folderPath}/repository.said.gzip`),
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
        t.ok(Array.isArray(sai.repository.items),
          'returns the active repository object.'
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
        sai.repository.items = [createItem(['Q3xnb29k'], 'blah blah')];
        const goodQuestion = sai.ask('what is good') as RepoItem;
        t.is(goodQuestion.answer, 'blah blah',
          'returns RepoItem if question is found.'
        );
        t.is(invalidQuestion, RepErrorCode.Question,
          'returns Error Code on invalid question.'
        );
        t.is(sai.ask('what is a test'), undefined,
          'returns undefined if question not found.'
        );
        sai.repository.items = [];
      });

      t.test('addQuestion(): RepErrorCode|Promise<null>', t => {
        t.plan(3);
        const addQuestion = readFileSync(`${mocks}/addQuestionTest.txt`, 'utf-8');
        t.is(sai.addQuestion(''), RepErrorCode.Empty,
          'returns Error Code with invalid document.'
        );
        (sai.addQuestion(addQuestion) as Promise<null>)
          .then((val) => {
            t.is(val, null,
              'returns a promised null on success.'
            );
            const items = fileOps.readRepoStore(`${folderPath}/repository.said.gzip`);
            t.is(items[0].answer, 'hello penguins!!',
              'saves the question to the database.'
            );
          });
      });

      t.test('editQuestion(): Promise<null>', t => {
        t.plan(3);
        const editQuestion = readFileSync(`${mocks}/editQuestionTest.txt`, 'utf-8');
        t.is(sai.editQuestion(''), RepErrorCode.Empty,
          'returns Error Code with invalid document.'
        );
        (sai.editQuestion(editQuestion) as Promise<null>)
          .then(val => {
            t.is(val, null,
              'returns a promised null on success.'
            );
            const items = fileOps.readRepoStore(`${folderPath}/repository.said.gzip`);
            t.is(items[0].answer, 'hello lobsters!!',
              'saves the question to the database.'
            );
          });
      });

      del(folderPath);
    })
  ;
});


