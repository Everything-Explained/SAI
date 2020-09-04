import { FileOps } from "../src/core/file-ops";
import del from 'del';
import { existsSync, writeFile } from "fs";
import t from 'tape';
import { Type as AvroType } from 'avsc';
import { dictSchema } from "../src/database/dictionary";
import { RepoItem, repositoryScheme } from "../src/database/repository";
import { promisify } from "util";
import { testDir } from "../src/variables/constants";


const fileOps = new FileOps();
const testScheme = AvroType.forSchema({
  name: 'test',
  type: 'array', items: 'string'
});
const writeFileAsync = promisify(writeFile);


t('File Operations', async t => {

  t.test('createFolder()', async t => {
    let folderPath = `${testDir}/createFolder`;
    fileOps.createFolder(folderPath);
    t.ok(existsSync(folderPath),
      'will create specified folder.'
    );
    del(folderPath);

    folderPath = `${testDir}/folderPath2`;
    fileOps.createFolder(folderPath);
    t.ok(fileOps.createFolder(folderPath),
      'returns if folder already exists.'
    );
    del(folderPath);
  });

  t.test('save(): Promise<null>', t => {
    const path = `${testDir}/save`;
    fileOps.createFolder(path);
    const validPath = `${path}/test1.test`;
    const validPath2 = `${path}/test2.gzip`;
    const invalidPath = `./blah/blah.test`;
    const validValue = ['valid value'];
    const invalidValue = ['valid value', ['invalid value']];
    t.plan(5);

    fileOps.save(validPath, testScheme, validValue, false)
      .then(data => {
        t.equal(data, null,
          'resolves null on success.'
        );
      })
    ;
    fileOps.save(validPath, testScheme, validValue, false)
      .catch((err: Error) => {
        t.ok(~err.message.indexOf('Cannot save'),
          'rejects when saving too fast.'
        );
        del(validPath);
      })
    ;
    fileOps.save(validPath, testScheme, invalidValue, false, false)
      .catch((err: Error) => {
        t.ok(~err.message.indexOf('data fails'),
          'rejects on invalid scheme value.'
        );
      })
    ;
    fileOps.save(invalidPath, testScheme, validValue, false, false)
      .catch((err: Error) => {
        t.ok(~err.message.indexOf('ENOENT'),
          'rejects on invalid file path.'
        );
      })
    ;
    fileOps.save(validPath2, testScheme, validValue, true, false)
      .then(resp => {
        t.equal(resp, null,
          'resolves null on file compression and save.'
        );
        del(path);
      })
    ;
  });

  t.test('saveDictionary(): Promise<null>', t => {
    const path = `${testDir}/saveDictionary`;
    fileOps.createFolder(path);
    t.plan(2);
    const validData = [['word00', 'word01'], ['word10']];
    const invalidData = [[3]];
    t.plan(2);
    fileOps.saveDictionary(`${path}/savedict.said.gzip`, validData)
      .then(resp => {
        t.is(resp, null, 'returns null on successful save.');
        del(path);
      })
    ;
    fileOps.saveDictionary(`${path}/savedict1.said.gzip`, invalidData)
      .then(() => {
        t.fail('throws an error on invalid data.');
      })
      .catch(() => {
        t.pass('throws an error on invalid data.');
      })
    ;
  });

  t.test('readRepoStore()', async t => {
    const path = `${testDir}/readRepoStore`;
    fileOps.createFolder(path);
    const goodPath = `${path}/repository.gzip`;
    const badPath = `${path}/badRepo.gzip`;
    const data = [
      { questions: ['hello'],
        answer: 'world',
        hashes: [3812834],
        tags: [],
        authors: [],
        level: 0,
        dateCreated: 1234,
        dateEdited: 4321 }
    ] as RepoItem[];
    await fileOps.save(goodPath, repositoryScheme, data, true, false);
    await writeFileAsync(badPath, JSON.stringify({ hello: ''}), { encoding: 'binary'});
    const repo = fileOps.readRepoStore(goodPath);
    t.equal(repo[0].answer, 'world',
      'reads the repository buffer into a JSON object'
    );
    t.throws(() => fileOps.readRepoStore(badPath),
      /(truncated buffer)|(incorrect header)/g,
      'throws an error if data fails schema conversion.'
    );
    del(path);
  });

  t.test('readDictStore()', async t => {
    const path = `${testDir}/readDictStore`;
    fileOps.createFolder(path);
    const goodPath = `${path}/dictionary.gzip`;
    const badPath = `${path}/badDictionary.gzip`;
    const data = [['god', 'pickles'], ['love', 'lobster']];
    await fileOps.save(goodPath, dictSchema, data, true, false);
    await writeFileAsync(badPath, JSON.stringify({ hello: ''}), { encoding: 'binary'});
    const dictObj = fileOps.readDictStore(goodPath);
    t.equal(dictObj[0][0], 'god',
      'reads a dictionary buffer into a JSON object'
    );
    t.throws(() => fileOps.readDictStore(badPath),
      /(truncated buffer)|(incorrect header)/g,
      'throws an error if data fails schema conversion.'
    );
    del(path);
  });
});