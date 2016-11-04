import {SimpleCompilerBase} from '../compiler-base';

/**
 * @access private
 */
export default class JSONCompiler extends SimpleCompilerBase {
  constructor() {
    super();
  }

  static getInputMimeTypes() {
    return 'application/json';
  }

  static getOutputMimeType() {
    return 'application/json';
  }

  compileSync(sourceCode) {
    return {
      code: JSON.stringify(JSON.parse(sourceCode)),
      mimeType: 'application/json',
    };
  }

  getCompilerVersion() {
    return require('cson/package.json').version;
  }
}
