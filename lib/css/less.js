'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _compilerBase = require('../compiler-base');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const mimeTypes = ['text/less'];
let lessjs = null;

/**
 * @access private
 */
class LessCompiler extends _compilerBase.CompilerBase {
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

  shouldCompileFile(fileName, compilerContext) {
    return _asyncToGenerator(function* () {
      return true;
    })();
  }

  determineDependentFiles(sourceCode, filePath, compilerContext) {
    return _asyncToGenerator(function* () {
      return [];
    })();
  }

  compile(sourceCode, filePath, compilerContext) {
    var _this = this;

    return _asyncToGenerator(function* () {
      lessjs = lessjs || require('less');

      let thisPath = _path2.default.dirname(filePath);
      _this.seenFilePaths[thisPath] = true;

      const opts = _this.getOptionsForPath(filePath, compilerContext);
      let result = yield lessjs.render(sourceCode, opts);

      return {
        code: result.css,
        mimeType: 'text/css'
      };
    })();
  }

  getOptionsForPath(filePath, compilerContext) {
    if (!this.resolvedOptions) {
      var _compilerOptions = this.compilerOptions;
      const paths = _compilerOptions.paths,
            rootpath = _compilerOptions.rootpath,
            basepath = _compilerOptions.basepath;
      const appRoot = compilerContext.appRoot;


      this.resolvedOptions = Object.assign({}, this.compilerOptions, {
        paths: (paths || []).map(relativePath => _path2.default.resolve(appRoot, relativePath)),
        rootpath: rootpath ? _path2.default.resolve(appRoot, rootpath) : undefined,
        basepath: basepath ? _path2.default.resolve(appRoot, basepath) : undefined
      });
    }

    const opts = Object.assign({}, this.resolvedOptions, {
      filename: _path2.default.basename(filePath)
    });

    if (opts.pathsIncludeSeen !== false) {
      opts.paths = opts.paths.concat(Object.keys(this.seenFilePaths));
    }

    // always allow file-relative imports
    opts.paths.push(_path2.default.dirname(filePath));

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

    let thisPath = _path2.default.dirname(filePath);
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
exports.default = LessCompiler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jc3MvbGVzcy5qcyJdLCJuYW1lcyI6WyJtaW1lVHlwZXMiLCJsZXNzanMiLCJMZXNzQ29tcGlsZXIiLCJjb25zdHJ1Y3RvciIsImNvbXBpbGVyT3B0aW9ucyIsInNvdXJjZU1hcCIsInNvdXJjZU1hcEZpbGVJbmxpbmUiLCJyZXNvbHZlZE9wdGlvbnMiLCJzZWVuRmlsZVBhdGhzIiwiZ2V0SW5wdXRNaW1lVHlwZXMiLCJzaG91bGRDb21waWxlRmlsZSIsImZpbGVOYW1lIiwiY29tcGlsZXJDb250ZXh0IiwiZGV0ZXJtaW5lRGVwZW5kZW50RmlsZXMiLCJzb3VyY2VDb2RlIiwiZmlsZVBhdGgiLCJjb21waWxlIiwicmVxdWlyZSIsInRoaXNQYXRoIiwiZGlybmFtZSIsIm9wdHMiLCJnZXRPcHRpb25zRm9yUGF0aCIsInJlc3VsdCIsInJlbmRlciIsImNvZGUiLCJjc3MiLCJtaW1lVHlwZSIsInBhdGhzIiwicm9vdHBhdGgiLCJiYXNlcGF0aCIsImFwcFJvb3QiLCJPYmplY3QiLCJhc3NpZ24iLCJtYXAiLCJyZWxhdGl2ZVBhdGgiLCJyZXNvbHZlIiwidW5kZWZpbmVkIiwiZmlsZW5hbWUiLCJiYXNlbmFtZSIsInBhdGhzSW5jbHVkZVNlZW4iLCJjb25jYXQiLCJrZXlzIiwicHVzaCIsInNob3VsZENvbXBpbGVGaWxlU3luYyIsImRldGVybWluZURlcGVuZGVudEZpbGVzU3luYyIsImNvbXBpbGVTeW5jIiwic291cmNlIiwiZXJyb3IiLCJmaWxlQXN5bmMiLCJhc3luYyIsInN5bmNJbXBvcnQiLCJlcnIiLCJvdXQiLCJnZXRDb21waWxlclZlcnNpb24iLCJ2ZXJzaW9uIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTs7OztBQUNBOzs7Ozs7QUFFQSxNQUFNQSxZQUFZLENBQUMsV0FBRCxDQUFsQjtBQUNBLElBQUlDLFNBQVMsSUFBYjs7QUFFQTs7O0FBR2UsTUFBTUMsWUFBTixvQ0FBd0M7QUFDckRDLGdCQUFjO0FBQ1o7O0FBRUEsU0FBS0Ms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LEVBQWtDSCxlQUFsQyxFQUFtRDtBQUNqRFgsYUFBU0EsVUFBVWdCLFFBQVEsTUFBUixDQUFuQjs7QUFFQSxRQUFJNkIsU0FBUyxFQUFiO0FBQ0EsUUFBSUMsUUFBUSxJQUFaOztBQUVBLFFBQUk3QixXQUFXLGVBQUtDLE9BQUwsQ0FBYUosUUFBYixDQUFmO0FBQ0EsU0FBS1AsYUFBTCxDQUFtQlUsUUFBbkIsSUFBK0IsSUFBL0I7O0FBRUEsVUFBTUUsT0FBT1csT0FBT0MsTUFBUCxDQUFjLEtBQUtYLGlCQUFMLENBQXVCTixRQUF2QixFQUFpQ0gsZUFBakMsQ0FBZCxFQUFpRTtBQUM1RW9DLGlCQUFXLEtBRGlFLEVBQzFEQyxPQUFPLEtBRG1ELEVBQzVDQyxZQUFZO0FBRGdDLEtBQWpFLENBQWI7O0FBSUFqRCxXQUFPc0IsTUFBUCxDQUFjVCxVQUFkLEVBQTBCTSxJQUExQixFQUFnQyxDQUFDK0IsR0FBRCxFQUFNQyxHQUFOLEtBQWM7QUFDNUMsVUFBSUQsR0FBSixFQUFTO0FBQ1BKLGdCQUFRSSxHQUFSO0FBQ0QsT0FGRCxNQUVPO0FBQ0w7QUFDQUwsaUJBQVNNLElBQUkzQixHQUFiO0FBQ0Q7QUFDRixLQVBEOztBQVNBLFFBQUlzQixLQUFKLEVBQVc7QUFDVCxZQUFNQSxLQUFOO0FBQ0Q7O0FBRUQsV0FBTztBQUNMdkIsWUFBTXNCLE1BREQ7QUFFTHBCLGdCQUFVO0FBRkwsS0FBUDtBQUlEOztBQUVEMkIsdUJBQXFCO0FBQ25CLFdBQU9wQyxRQUFRLG1CQUFSLEVBQTZCcUMsT0FBcEM7QUFDRDtBQTFHb0Q7a0JBQWxDcEQsWSIsImZpbGUiOiJsZXNzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQge0NvbXBpbGVyQmFzZX0gZnJvbSAnLi4vY29tcGlsZXItYmFzZSc7XG5cbmNvbnN0IG1pbWVUeXBlcyA9IFsndGV4dC9sZXNzJ107XG5sZXQgbGVzc2pzID0gbnVsbDtcblxuLyoqXG4gKiBAYWNjZXNzIHByaXZhdGVcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTGVzc0NvbXBpbGVyIGV4dGVuZHMgQ29tcGlsZXJCYXNlIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuY29tcGlsZXJPcHRpb25zID0ge1xuICAgICAgc291cmNlTWFwOiB7IHNvdXJjZU1hcEZpbGVJbmxpbmU6IHRydWUgfVxuICAgIH07XG4gICAgdGhpcy5yZXNvbHZlZE9wdGlvbnMgPSBudWxsO1xuICAgIHRoaXMuc2VlbkZpbGVQYXRocyA9IHt9O1xuICB9XG5cbiAgc3RhdGljIGdldElucHV0TWltZVR5cGVzKCkge1xuICAgIHJldHVybiBtaW1lVHlwZXM7XG4gIH1cblxuICBhc3luYyBzaG91bGRDb21waWxlRmlsZShmaWxlTmFtZSwgY29tcGlsZXJDb250ZXh0KSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBhc3luYyBkZXRlcm1pbmVEZXBlbmRlbnRGaWxlcyhzb3VyY2VDb2RlLCBmaWxlUGF0aCwgY29tcGlsZXJDb250ZXh0KSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgYXN5bmMgY29tcGlsZShzb3VyY2VDb2RlLCBmaWxlUGF0aCwgY29tcGlsZXJDb250ZXh0KSB7XG4gICAgbGVzc2pzID0gbGVzc2pzIHx8IHJlcXVpcmUoJ2xlc3MnKTtcblxuICAgIGxldCB0aGlzUGF0aCA9IHBhdGguZGlybmFtZShmaWxlUGF0aCk7XG4gICAgdGhpcy5zZWVuRmlsZVBhdGhzW3RoaXNQYXRoXSA9IHRydWU7XG5cbiAgICBjb25zdCBvcHRzID0gdGhpcy5nZXRPcHRpb25zRm9yUGF0aChmaWxlUGF0aCwgY29tcGlsZXJDb250ZXh0KTtcbiAgICBsZXQgcmVzdWx0ID0gYXdhaXQgbGVzc2pzLnJlbmRlcihzb3VyY2VDb2RlLCBvcHRzKTtcblxuICAgIHJldHVybiB7XG4gICAgICBjb2RlOiByZXN1bHQuY3NzLFxuICAgICAgbWltZVR5cGU6ICd0ZXh0L2NzcydcbiAgICB9O1xuICB9XG5cbiAgZ2V0T3B0aW9uc0ZvclBhdGgoZmlsZVBhdGgsIGNvbXBpbGVyQ29udGV4dCkge1xuICAgIGlmICghdGhpcy5yZXNvbHZlZE9wdGlvbnMpIHtcbiAgICAgIGNvbnN0IHtwYXRocywgcm9vdHBhdGgsIGJhc2VwYXRofSA9IHRoaXMuY29tcGlsZXJPcHRpb25zO1xuICAgICAgY29uc3Qge2FwcFJvb3R9ID0gY29tcGlsZXJDb250ZXh0O1xuXG4gICAgICB0aGlzLnJlc29sdmVkT3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuY29tcGlsZXJPcHRpb25zLCB7XG4gICAgICAgIHBhdGhzOiAocGF0aHMgfHwgW10pLm1hcCgocmVsYXRpdmVQYXRoKSA9PiBwYXRoLnJlc29sdmUoYXBwUm9vdCwgcmVsYXRpdmVQYXRoKSksXG4gICAgICAgIHJvb3RwYXRoOiByb290cGF0aCA/IHBhdGgucmVzb2x2ZShhcHBSb290LCByb290cGF0aCkgOiB1bmRlZmluZWQsXG4gICAgICAgIGJhc2VwYXRoOiBiYXNlcGF0aCA/IHBhdGgucmVzb2x2ZShhcHBSb290LCBiYXNlcGF0aCkgOiB1bmRlZmluZWQsXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBjb25zdCBvcHRzID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5yZXNvbHZlZE9wdGlvbnMsIHtcbiAgICAgIGZpbGVuYW1lOiBwYXRoLmJhc2VuYW1lKGZpbGVQYXRoKSxcbiAgICB9KTtcblxuICAgIGlmIChvcHRzLnBhdGhzSW5jbHVkZVNlZW4gIT09IGZhbHNlKSB7XG4gICAgICBvcHRzLnBhdGhzID0gb3B0cy5wYXRocy5jb25jYXQoT2JqZWN0LmtleXModGhpcy5zZWVuRmlsZVBhdGhzKSk7XG4gICAgfVxuXG4gICAgLy8gYWx3YXlzIGFsbG93IGZpbGUtcmVsYXRpdmUgaW1wb3J0c1xuICAgIG9wdHMucGF0aHMucHVzaChwYXRoLmRpcm5hbWUoZmlsZVBhdGgpKTtcblxuICAgIHJldHVybiBvcHRzO1xuICB9XG5cbiAgc2hvdWxkQ29tcGlsZUZpbGVTeW5jKGZpbGVOYW1lLCBjb21waWxlckNvbnRleHQpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGRldGVybWluZURlcGVuZGVudEZpbGVzU3luYyhzb3VyY2VDb2RlLCBmaWxlUGF0aCwgY29tcGlsZXJDb250ZXh0KSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgY29tcGlsZVN5bmMoc291cmNlQ29kZSwgZmlsZVBhdGgsIGNvbXBpbGVyQ29udGV4dCkge1xuICAgIGxlc3NqcyA9IGxlc3NqcyB8fCByZXF1aXJlKCdsZXNzJyk7XG5cbiAgICBsZXQgc291cmNlID0gJyc7XG4gICAgbGV0IGVycm9yID0gbnVsbDtcblxuICAgIGxldCB0aGlzUGF0aCA9IHBhdGguZGlybmFtZShmaWxlUGF0aCk7XG4gICAgdGhpcy5zZWVuRmlsZVBhdGhzW3RoaXNQYXRoXSA9IHRydWU7XG5cbiAgICBjb25zdCBvcHRzID0gT2JqZWN0LmFzc2lnbih0aGlzLmdldE9wdGlvbnNGb3JQYXRoKGZpbGVQYXRoLCBjb21waWxlckNvbnRleHQpLCB7XG4gICAgICBmaWxlQXN5bmM6IGZhbHNlLCBhc3luYzogZmFsc2UsIHN5bmNJbXBvcnQ6IHRydWVcbiAgICB9KTtcblxuICAgIGxlc3Nqcy5yZW5kZXIoc291cmNlQ29kZSwgb3B0cywgKGVyciwgb3V0KSA9PiB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIGVycm9yID0gZXJyO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gTkI6IEJlY2F1c2Ugd2UndmUgZm9yY2VkIGxlc3MgdG8gd29yayBpbiBzeW5jIG1vZGUsIHdlIGNhbiBkbyB0aGlzXG4gICAgICAgIHNvdXJjZSA9IG91dC5jc3M7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAoZXJyb3IpIHtcbiAgICAgIHRocm93IGVycm9yO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBjb2RlOiBzb3VyY2UsXG4gICAgICBtaW1lVHlwZTogJ3RleHQvY3NzJ1xuICAgIH07XG4gIH1cblxuICBnZXRDb21waWxlclZlcnNpb24oKSB7XG4gICAgcmV0dXJuIHJlcXVpcmUoJ2xlc3MvcGFja2FnZS5qc29uJykudmVyc2lvbjtcbiAgfVxufVxuIl19