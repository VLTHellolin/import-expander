interface ImportExpanderConfig {
    filePath: string;
    distPath: string;
    extName?: string;
}
export declare class ImportExpander {
    filePath: string;
    distPath: string;
    extName: string;
    private cwd;
    expand(conf: ImportExpanderConfig, fn: any, cont: any): void;
    private parse;
    private addExt;
    private readFile;
    private writeToFile;
}
export default function importExpand(conf: ImportExpanderConfig, fn: any, cont: any): void;
export {};
