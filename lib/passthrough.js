'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _compilerBase = require('./compiler-base');

var _mimeTypes = require('@paulcbetts/mime-types');

var _mimeTypes2 = _interopRequireDefault(_mimeTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @access private
 *
 * This class is used for binary files and other files that should end up in
 * your cache directory, but aren't actually compiled
 */
class PassthroughCompiler extends _compilerBase.SimpleCompilerBase {
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
      mimeType: _mimeTypes2.default.lookup(filePath)
    };
  }

  getCompilerVersion() {
    return require(_path2.default.join(__dirname, '..', 'package.json')).version;
  }
}
exports.default = PassthroughCompiler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9wYXNzdGhyb3VnaC5qcyJdLCJuYW1lcyI6WyJQYXNzdGhyb3VnaENvbXBpbGVyIiwiY29uc3RydWN0b3IiLCJnZXRJbnB1dE1pbWVUeXBlcyIsImdldE91dHB1dE1pbWVUeXBlIiwiY29tcGlsZVN5bmMiLCJzb3VyY2VDb2RlIiwiZmlsZVBhdGgiLCJjb2RlIiwibWltZVR5cGUiLCJsb29rdXAiLCJnZXRDb21waWxlclZlcnNpb24iLCJyZXF1aXJlIiwiam9pbiIsIl9fZGlybmFtZSIsInZlcnNpb24iXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7O0FBQ0E7O0FBQ0E7Ozs7OztBQUVBOzs7Ozs7QUFNZSxNQUFNQSxtQkFBTiwwQ0FBcUQ7QUFDbEVDLGdCQUFjO0FBQ1o7QUFDRDs7QUFFRCxTQUFPQyxpQkFBUCxHQUEyQjtBQUN6QixXQUFPLENBQUMsWUFBRCxFQUFlLGVBQWYsQ0FBUDtBQUNEOztBQUVELFNBQU9DLGlCQUFQLEdBQTJCO0FBQ3pCLFdBQU8sSUFBUDtBQUNEOztBQUVEQyxjQUFZQyxVQUFaLEVBQXdCQyxRQUF4QixFQUFrQztBQUNoQyxXQUFPO0FBQ0xDLFlBQU1GLFVBREQ7QUFFTEcsZ0JBQVUsb0JBQVVDLE1BQVYsQ0FBaUJILFFBQWpCO0FBRkwsS0FBUDtBQUlEOztBQUVESSx1QkFBcUI7QUFDbkIsV0FBT0MsUUFBUSxlQUFLQyxJQUFMLENBQVVDLFNBQVYsRUFBcUIsSUFBckIsRUFBMkIsY0FBM0IsQ0FBUixFQUFvREMsT0FBM0Q7QUFDRDtBQXRCaUU7a0JBQS9DZCxtQiIsImZpbGUiOiJwYXNzdGhyb3VnaC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHtTaW1wbGVDb21waWxlckJhc2V9IGZyb20gJy4vY29tcGlsZXItYmFzZSc7XG5pbXBvcnQgbWltZVR5cGVzIGZyb20gJ0BwYXVsY2JldHRzL21pbWUtdHlwZXMnO1xuXG4vKipcbiAqIEBhY2Nlc3MgcHJpdmF0ZVxuICpcbiAqIFRoaXMgY2xhc3MgaXMgdXNlZCBmb3IgYmluYXJ5IGZpbGVzIGFuZCBvdGhlciBmaWxlcyB0aGF0IHNob3VsZCBlbmQgdXAgaW5cbiAqIHlvdXIgY2FjaGUgZGlyZWN0b3J5LCBidXQgYXJlbid0IGFjdHVhbGx5IGNvbXBpbGVkXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBhc3N0aHJvdWdoQ29tcGlsZXIgZXh0ZW5kcyBTaW1wbGVDb21waWxlckJhc2Uge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgc3RhdGljIGdldElucHV0TWltZVR5cGVzKCkge1xuICAgIHJldHVybiBbJ3RleHQvcGxhaW4nLCAnaW1hZ2Uvc3ZnK3htbCddO1xuICB9XG5cbiAgc3RhdGljIGdldE91dHB1dE1pbWVUeXBlKCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgY29tcGlsZVN5bmMoc291cmNlQ29kZSwgZmlsZVBhdGgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY29kZTogc291cmNlQ29kZSxcbiAgICAgIG1pbWVUeXBlOiBtaW1lVHlwZXMubG9va3VwKGZpbGVQYXRoKVxuICAgIH07XG4gIH1cblxuICBnZXRDb21waWxlclZlcnNpb24oKSB7XG4gICAgcmV0dXJuIHJlcXVpcmUocGF0aC5qb2luKF9fZGlybmFtZSwgJy4uJywgJ3BhY2thZ2UuanNvbicpKS52ZXJzaW9uO1xuICB9XG59XG4iXX0=