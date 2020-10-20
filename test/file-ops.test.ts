import { FileOps } from "../lib/core/file-ops";
import del from 'del';
import { existsSync, writeFile } from "fs";
import t from 'tape';
import { Type as AvroType } from 'avsc';
import { paritySchema } from "../lib/database/parity_manager";
import { Inquiry, inquiryScheme } from "../lib/database/inquiry_manager";
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

const mockParityData = [
  ['large', 'big'],
  ['small', 'tiny']
];


const writeFileAsync = promisify(writeFile);

const getRndNum = (range: number) => {
  return Math.floor(Math.random() * range);
};

const mockFolder = `${Constants.mockDir}/file-ops`;

const genRandomFilePath = () => {
  fileOps.createFolder(`${mockFolder}`);
  return `${mockFolder}/test${getRndNum(10000)}.gzip`;
};


t('File Operations', async t => {

  t.test('createFolder() returns true on successful folder creation.', async t => {
    const path = `${mockFolder}`;
    fileOps.createFolder(path);
    t.ok(existsSync(path));
  });
  t.test('createFolder() returns true if folder already exists.', async t => {
    const path = `${mockFolder}`;
    fileOps.createFolder(path);
    t.ok(fileOps.createFolder(path));
  });

  t.test('save() returns promised null on success.', t => {
    t.plan(1);
    const path = genRandomFilePath();
    fileOps.save(path, testScheme, ['valid', 'value'], false)
    .then(data => t.equal(data, null));
  });
  t.test('save() returns promise rejection when saving too fast.', t => {
    t.plan(1);
    const saveFirstPath = genRandomFilePath();
    fileOps
      .save(saveFirstPath, testScheme, ['valid', 'value'], false)
    ;
    const path = genRandomFilePath();
    fileOps.save(path, testScheme, ['valid value'], false)
      .then(() => t.fail('Saved during another save operation (whoops).'))
      .catch((err: Error) => t.ok(~err.message.indexOf('Cannot save')))
    ;
  });
  t.test('save() returns promise rejection on invalid scheme value.', t => {
    t.plan(1);
    const path = genRandomFilePath();
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
    const path = genRandomFilePath();
    fileOps
      .save(path, testScheme, ['valid', 'value'], true, false)
      .then(resp => t.equal(resp, null))
    ;
  });

  t.test('readInquiryStore() returns an InquiryRecord Array.', async t => {
    const path = genRandomFilePath();
    await fileOps.save(path, inquiryScheme, mockInquiryData, true, false);
    const inquiries = fileOps.readInquiryStore(path);
    t.ok(Array.isArray(inquiries));
    t.is(inquiries[0].compare(mockInquiryData[0]), 0);
  });
  t.test('readInquiryStore() throws an error if data fails schema conversion.', async t => {
    const path = genRandomFilePath();
    await writeFileAsync(path, JSON.stringify({ hello: ''}), { encoding: 'binary'});
    t.throws(
      () => fileOps.readInquiryStore(path),
      /(truncated buffer)|(incorrect header)/g)
    ;
  });

  t.test('readParityStore() returns a parity storage file into a JSON object..', async t => {
    const path = genRandomFilePath();
    await fileOps.save(path, paritySchema, mockParityData, true, false);
    const savedParityData = fileOps.readParityStore(path);
    t.same(mockParityData, savedParityData);
  });
  t.test('readParityStore() throws an error if data fails schema conversion.', async t => {
    const path = genRandomFilePath();
    await writeFileAsync(path, JSON.stringify({ hello: ''}), { encoding: 'binary'});
    t.throws(
      () => fileOps.readParityStore(path),
      /(truncated buffer)|(incorrect header)/g)
    ;
    del(mockFolder); // ############# Cleanup for ALL tests #############
  });
});