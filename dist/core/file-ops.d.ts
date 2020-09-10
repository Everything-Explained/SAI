import { Type as SchemaType } from 'avsc';
import { RepoItem } from "../database/repository";
export declare class FileOps {
    private _isSaving;
    constructor();
    createFolder(path: string): boolean;
    save(path: string, schema: SchemaType, data: unknown, compress: boolean, limitSave?: boolean): Promise<null>;
    saveDictionary(path: string, data: unknown, limitSave?: boolean): Promise<null>;
    readRepoStore(filePath: string): RepoItem[];
    readDictStore(filePath: string): string[][];
    private bufferFromSchema;
    private writeBinary;
}
