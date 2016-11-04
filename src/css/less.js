import path from 'path';
import {CompilerBase} from '../compiler-base';

const mimeTypes = ['text/less'];
let lessjs = null;

/**
 * @access private
 */
export default class LessCompiler extends CompilerBase {
  constructor() {
    super();

    this.compilerOptions = {
      sourceMap: { sourceMapFileInline: true }
    };
    this.resolvedOptions = null;
    this.seenFilePaths = {};
  }

  static getInputMimeTypes() {
    return mimeTypes;
  }

  static getOutputMimeType() {
    return 'text/css';
  }

  async shouldCompileFile(fileName, compilerContext) {
    return true;
  }

  async determineDependentFiles(sourceCode, filePath, compilerContext) {
    return [];
  }

  async compile(sourceCode, filePath, compilerContext) {
    lessjs = lessjs || require('less');

    let thisPath = path.dirname(filePath);
    this.seenFilePaths[thisPath] = true;

    const opts = this.getOptionsForPath(filePath, compilerContext);
    let result = await lessjs.render(sourceCode, opts);

    return {
      code: result.css,
      mimeType: 'text/css'
    };
  }

  getOptionsForPath(filePath, compilerContext) {
    if (!this.resolvedOptions) {
      const {paths, rootpath, basepath} = this.compilerOptions;
      const {appRoot} = compilerContext;

      this.resolvedOptions = Object.assign({}, this.compilerOptions, {
        paths: (paths || []).map((relativePath) => path.resolve(appRoot, relativePath)),
        rootpath: rootpath ? path.resolve(appRoot, rootpath) : undefined,
        basepath: basepath ? path.resolve(appRoot, basepath) : undefined,
      });
    }

    const opts = Object.assign({}, this.resolvedOptions, {
      filename: path.basename(filePath),
    });

    if (opts.pathsIncludeSeen !== false) {
      opts.paths = opts.paths.concat(Object.keys(this.seenFilePaths));
    }

    // always allow file-relative imports
    opts.paths.push(path.dirname(filePath));

    return opts;
  }

  shouldCompileFileSync(fileName, compilerContext) {
    return true;
  }

  determineDependentFilesSync(sourceCode, filePath, compilerContext) {
    return [];
  }

  compileSync(sourceCode, filePath, compilerContext) {
    lessjs = lessjs || require('less');

    let source = '';
    let error = null;

    let thisPath = path.dirname(filePath);
    this.seenFilePaths[thisPath] = true;

    const opts = Object.assign(this.getOptionsForPath(filePath, compilerContext), {
      fileAsync: false, async: false, syncImport: true
    });

    lessjs.render(sourceCode, opts, (err, out) => {
      if (err) {
        error = err;
      } else {
        // NB: Because we've forced less to work in sync mode, we can do this
        source = out.css;
      }
    });

    if (error) {
      throw error;
    }

    return {
      code: source,
      mimeType: 'text/css'
    };
  }

  getCompilerVersion() {
    return require('less/package.json').version;
  }
}
