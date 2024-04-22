import fs from "fs";
import path from "path";
import { mkdirp } from "mkdirp";
const importRegex = /@import[^'"]+?['"](.+?)['"];?/g;
const commentRegex = /((?:\/\*(?:.|\s)*?\*\/)|(?:\/\/.*))/g;
export class ImportExpander {
    filePath = "";
    distPath = "";
    extName = "";
    cwd = "";
    expand(conf, fn, cont) {
        this.filePath = path.resolve(process.cwd(), conf.filePath);
        this.distPath = path.resolve(process.cwd(), conf.distPath);
        if (!conf.extName)
            this.extName = ".styl";
        else
            this.extName = "." + conf.extName;
        if (!conf.filePath || !fs.existsSync(this.filePath)) {
            console.error(`The main file path "${this.filePath}" is incorrect.`);
        }
        let result = this.parse();
        fn = fn && fn.bind(cont || this, result);
        this.writeToFile(this.distPath, result, fn);
    }
    parse() {
        let result = this.readFile(this.filePath);
        this.cwd = path.dirname(this.filePath);
        let prevResult = "";
        while (result !== prevResult) {
            prevResult = result;
            let current;
            let matches = [];
            let resNoComments = result.replace(commentRegex, "");
            while ((current = importRegex.exec(resNoComments)) !== null)
                matches.push(current);
            for (const match of matches) {
                result = result.replace(match[0], this.readFile(match[1]));
            }
        }
        return result;
    }
    addExt(fileName) {
        if (fileName.includes(this.extName))
            return fileName;
        return fileName + this.extName;
    }
    readFile(fileName) {
        let file = this.addExt(path.join(this.cwd, fileName));
        if (!fs.existsSync(file))
            file = this.addExt(path.join(this.cwd, "_" + fileName));
        let res = "";
        try {
            res = fs.readFileSync(file, { encoding: "utf-8" });
        }
        catch (e) {
            console.error(`Can't read file "${file}".`);
        }
        return res;
    }
    writeToFile(file, res, fn) {
        if (!fs.existsSync(path.dirname(file)))
            mkdirp.sync(path.dirname(file));
        fs.writeFile(file, res, function () {
            if (fn)
                fn();
        }.bind(this));
    }
}
var ie = new ImportExpander();
export default function importExpand(conf, fn, cont) {
    ie.expand(conf, fn, cont);
}
