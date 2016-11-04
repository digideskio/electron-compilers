import path from 'path';
import {SimpleCompilerBase} from './compiler-base';
import mimeTypes from '@paulcbetts/mime-types';

/**
 * @access private
 *
 * This class is used for binary files and other files that should end up in
 * your cache directory, but aren't actually compiled
 */
export default class PassthroughCompiler extends SimpleCompilerBase {
  constructor() {
    super();
  }

  static getInputMimeTypes() {
    return ['text/plain', 'image/svg+xml'];
  }

  static getOutputMimeType() {
    return null;
  }

  compileSync(sourceCode, filePath) {
    return {
      code: sourceCode,
      mimeType: mimeTypes.lookup(filePath)
    };
  }

  getCompilerVersion() {
    return require(path.join(__dirname, '..', 'package.json')).version;
  }
}
