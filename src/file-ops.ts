import { existsSync, mkdirSync, readFileSync, writeFile } from "fs";
import { gunzipSync, gzip } from 'zlib';
import { Type as SchemaType } from 'avsc';
import { Replies } from "./types";
import { promisify } from "util";


const gzipPromise = promisify(gzip);


export class FileOperations {

  private isSaving = false;


  constructor() { return; }


  createFolder(path: string): boolean {
    if (existsSync(path)) return true;
    mkdirSync(path);
    return true;
  }


  save(path: string, schema: SchemaType, data: unknown, compress: boolean, limitSave = true): Promise<null> {
    return new Promise((rs, rj) => {
      const [bufErr, buf] = this.bufferFromSchema(data, schema);
      if (bufErr) return rj(bufErr);

      this.writeBinary(path, buf, compress, limitSave)
        .then(() => rs(null))
        .catch(err => rj(err))
      ;
    });
  }

  // saveRaw(path: string, data: unknown): Promise<null> {
  //   return new Promise((rs, rj) => {
  //     const isSaving = this.checkIsSaving();
  //     if (isSaving) return rj(isSaving);

  //     writeFile(path, JSON.stringify(data), fileErr => {
  //       if (fileErr) rj(fileErr);
  //       else rs(null);
  //     });
  //   });
  // }


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
    const dataToSave =
      compress
        ? await gzipPromise(data) as Buffer
        : data
    ;

    return new Promise((rs, rj) => {
      writeFile(path, dataToSave, { encoding: 'binary' }, err => {
        this.isSaving = false;
        if (err) rj(err);
        else rs(null);
      });
    });
  }


  // private checkIsSaving() {
  //   return (
  //     this.isSaving
  //       ? Error('Cannot save until current save operation completes.')
  //       : null
  //   );
  // }

}



