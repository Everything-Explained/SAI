export declare class SAI {
    private dataFolder;
    private repoPath;
    private dictPath;
    private dict;
    private repo;
    private fileOps;
    constructor(dataFolderPath: string, isReady: (err: Error | null) => void);
    private init;
}
