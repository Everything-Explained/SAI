import { existsSync, mkdirSync, readFileSync, writeFile } from "fs";
import { gunzipSync, gzip } from 'zlib';
import { Type as SchemaType } from 'avsc';
import { Replies } from "../variables/types";
import { promisify } from "util";


const gzipAsync = promisify(gzip);
const writeFileAsync = promisify(writeFile);


export class FileOperations {
  private isSaving = false;


  constructor() { return; }


  createFolder(path: string): boolean {
    if (existsSync(path)) return true;
    mkdirSync(path);
    return true;
  }

  save(path: string, schema: SchemaType, data: unknown, compress: boolean, limitSave = true): Promise<unknown> {
    const [bufErr, buf] = this.bufferFromSchema(data, schema);
    if (bufErr) return Promise.reject(bufErr);
    return this.writeBinary(path, buf, compress, limitSave);
  }

  readReplyStore(filePath: string, schema: SchemaType): Replies {
    const zippedReplies = readFileSync(filePath);
    const unzippedReplies = gunzipSync(zippedReplies);
    return schema.fromBuffer(unzippedReplies);
  }

  readDictStore(filePath: string, schema: SchemaType): string[][] {
    const zippedWords = readFileSync(filePath);
    const unzippedWords = gunzipSync(zippedWords);
    return schema.fromBuffer(unzippedWords);
  }


  private bufferFromSchema(data: unknown, schema: SchemaType): [Error|null, Buffer] {
    if (schema.isValid(data)) {
      return [null, schema.toBuffer(data)];
    }
    return [Error(
      'data fails schema validation; ' +
      'compare data with schema for inconsistencies.'
    ), Buffer.from('')];
  }

  private async writeBinary(path: string, data: Buffer, compress: boolean, limitSave: boolean) {
    if (limitSave && this.isSaving) {
      return Promise.reject(
        Error('Cannot save until current save operation completes.')
      );
    }
    this.isSaving = true;
    try {
      const dataToSave =
        compress ? await gzipAsync(data) as Buffer : data
      ;
      await writeFileAsync(path, dataToSave, { encoding: 'binary' });
      return Promise.resolve(null);
    }
    catch (e) { return Promise.reject(e); }
    finally   { this.isSaving = false; }
  }
}



