import { FileOps } from "../lib/core/file-ops";
import del from 'del';
import { existsSync, writeFile } from "fs";
import t from 'tape';
import { Type as AvroType } from 'avsc';
import { dictSchema } from "../lib/database/dictionaryman";
import { Inquiry, inquiryScheme } from "../lib/database/inquiryman";
import { promisify } from "util";
import { Constants } from "../lib/variables/constants";
import smap from 'source-map-support';

smap.install();


const fileOps = new FileOps();
const testScheme = AvroType.forSchema({
  name: 'test',
  type: 'array', items: 'string'
});


const mockInquiryData = [{
    title: 'blah',
    answer: 'world',
    ids: ['aAheoadf=='],
    tags: [],
    authors: [],
    level: 0,
    dateCreated: 1234,
    dateEdited: 4321,
    editedBy: '',
}] as Inquiry[];

const mockDictData = [
  ['large', 'big'],
  ['small', 'tiny']
];


const writeFileAsync = promisify(writeFile);

const getRndNum = (range: number) => {
  return Math.floor(Math.random() * range);
};

const genRandomFilePath = (folderPath: string) => {
  fileOps.createFolder(folderPath);
  return `${folderPath}/test${getRndNum(10000)}.gzip`;
};


t('File Operations', async t => {

  t.test('createFolder() returns true on successful folder creation.', async t => {
    const path = `${Constants.mockDir}/createFolder`;
    fileOps.createFolder(path);
    t.ok(existsSync(path));
    del(path);
  });

  t.test('createFolder() returns true if folder already exists.', async t => {
    const path = `${Constants.mockDir}/duplicateFolderTest`;
    fileOps.createFolder(path);
    t.ok(fileOps.createFolder(path));
    del(path);
  });

  t.test('save() returns promised null on success.', t => {
    t.plan(1);
    const path = genRandomFilePath(Constants.mockDir);
    fileOps.save(path, testScheme, ['valid', 'value'], false)
    .then(data => {
      t.equal(data, null);
      del(path);
    });
  });

  t.test('save() returns promise rejection when saving too fast.', t => {
    t.plan(1);
    const saveFirstPath = genRandomFilePath(Constants.mockDir);
    fileOps
      .save(saveFirstPath, testScheme, ['valid', 'value'], false)
      .then(() => del(saveFirstPath)) // cleanup
    ;
    const path = genRandomFilePath(Constants.mockDir);
    fileOps.save(path, testScheme, ['valid value'], false)
      .then(() => t.fail('Saved during another save operation (whoops).'))
      .catch((err: Error) => t.ok(~err.message.indexOf('Cannot save')))
    ;
  });

  t.test('save() returns promise rejection on invalid scheme value.', t => {
    t.plan(1);
    const path = genRandomFilePath(Constants.mockDir);
    fileOps
      .save(path, testScheme, 'invalid value', false, false)
      .catch((err: Error) => t.ok(~err.message.indexOf('data fails')))
    ;
  });

  t.test('save() returns promise rejection on invalid file path.', t => {
    t.plan(1);
    fileOps
      .save('./invalid/path.test', testScheme, ['valid value'], false, false)
      .catch((err: Error) => t.ok(~err.message.indexOf('ENOENT')))
    ;
  });

  t.test('save() returns promised null on file compression and save success.', t => {
    t.plan(1);
    const path = genRandomFilePath(Constants.mockDir);
    fileOps
      .save(path, testScheme, ['valid', 'value'], true, false)
      .then(resp => {t.equal(resp, null); del(path); })
    ;
  });

  t.test('readInquiryStore() returns an InquiryRecord Array.', async t => {
    const path = genRandomFilePath(Constants.mockDir);
    await fileOps.save(path, inquiryScheme, mockInquiryData, true, false);
    const inquiries = fileOps.readInquiryStore(path);
    t.ok(Array.isArray(inquiries));
    t.is(inquiries[0].compare(mockInquiryData[0]), 0);
    del(path);
  });

  t.test('readInquiryStore() throws an error if data fails schema conversion.', async t => {
    const path = genRandomFilePath(Constants.mockDir);
    await writeFileAsync(path, JSON.stringify({ hello: ''}), { encoding: 'binary'});
    t.throws(
      () => fileOps.readInquiryStore(path),
      /(truncated buffer)|(incorrect header)/g)
    ;
    del(path);
  });

  t.test('readDictStore() returns a dictionary file into a JSON object..', async t => {
    const path = genRandomFilePath(Constants.mockDir);
    await fileOps.save(path, dictSchema, mockDictData, true, false);
    t.same(mockDictData, mockDictData);
    del(path);
  });

  t.test('readDictStore() throws an error if data fails schema conversion.', async t => {
    const path = genRandomFilePath(Constants.mockDir);
    await writeFileAsync(path, JSON.stringify({ hello: ''}), { encoding: 'binary'});
    t.throws(
      () => fileOps.readDictStore(path),
      /(truncated buffer)|(incorrect header)/g)
    ;
    del(path);
  });
});