import {SimpleCompilerBase} from '../compiler-base';

const inputMimeTypes = ['text/cson'];
let CSON = null;

/**
 * @access private
 */
export default class CSONCompiler extends SimpleCompilerBase {
  constructor() {
    super();
  }

  static getInputMimeTypes() {
    return inputMimeTypes;
  }

  static getOutputMimeType() {
    return 'application/json';
  }

  compileSync(sourceCode, filePath) {
    CSON = CSON || require('cson');
    let result = CSON.parse(sourceCode);
    return {
      code: JSON.stringify(result),
      mimeType: 'application/json'
    };
  }

  getCompilerVersion() {
    return require('cson/package.json').version;
  }
}
