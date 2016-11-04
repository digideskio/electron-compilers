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

  static getOutputMimeType() {
    return 'text/css';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jc3MvbGVzcy5qcyJdLCJuYW1lcyI6WyJtaW1lVHlwZXMiLCJsZXNzanMiLCJMZXNzQ29tcGlsZXIiLCJjb25zdHJ1Y3RvciIsImNvbXBpbGVyT3B0aW9ucyIsInNvdXJjZU1hcCIsInNvdXJjZU1hcEZpbGVJbmxpbmUiLCJyZXNvbHZlZE9wdGlvbnMiLCJzZWVuRmlsZVBhdGhzIiwiZ2V0SW5wdXRNaW1lVHlwZXMiLCJnZXRPdXRwdXRNaW1lVHlwZSIsInNob3VsZENvbXBpbGVGaWxlIiwiZmlsZU5hbWUiLCJjb21waWxlckNvbnRleHQiLCJkZXRlcm1pbmVEZXBlbmRlbnRGaWxlcyIsInNvdXJjZUNvZGUiLCJmaWxlUGF0aCIsImNvbXBpbGUiLCJyZXF1aXJlIiwidGhpc1BhdGgiLCJkaXJuYW1lIiwib3B0cyIsImdldE9wdGlvbnNGb3JQYXRoIiwicmVzdWx0IiwicmVuZGVyIiwiY29kZSIsImNzcyIsIm1pbWVUeXBlIiwicGF0aHMiLCJyb290cGF0aCIsImJhc2VwYXRoIiwiYXBwUm9vdCIsIk9iamVjdCIsImFzc2lnbiIsIm1hcCIsInJlbGF0aXZlUGF0aCIsInJlc29sdmUiLCJ1bmRlZmluZWQiLCJmaWxlbmFtZSIsImJhc2VuYW1lIiwicGF0aHNJbmNsdWRlU2VlbiIsImNvbmNhdCIsImtleXMiLCJwdXNoIiwic2hvdWxkQ29tcGlsZUZpbGVTeW5jIiwiZGV0ZXJtaW5lRGVwZW5kZW50RmlsZXNTeW5jIiwiY29tcGlsZVN5bmMiLCJzb3VyY2UiLCJlcnJvciIsImZpbGVBc3luYyIsImFzeW5jIiwic3luY0ltcG9ydCIsImVyciIsIm91dCIsImdldENvbXBpbGVyVmVyc2lvbiIsInZlcnNpb24iXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7O0FBQ0E7Ozs7OztBQUVBLE1BQU1BLFlBQVksQ0FBQyxXQUFELENBQWxCO0FBQ0EsSUFBSUMsU0FBUyxJQUFiOztBQUVBOzs7QUFHZSxNQUFNQyxZQUFOLG9DQUF3QztBQUNyREMsZ0JB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ZUFBbEQsRUFBbUU7QUFDakUsV0FBTyxFQUFQO0FBQ0Q7O0FBRURpQyxjQUFZL0IsVUFBWixFQUF3QkMsUUFBeEIsRUFBa0NILGVBQWxDLEVBQW1EO0FBQ2pEWixhQUFTQSxVQUFVaUIsUUFBUSxNQUFSLENBQW5COztBQUVBLFFBQUk2QixTQUFTLEVBQWI7QUFDQSxRQUFJQyxRQUFRLElBQVo7O0FBRUEsUUFBSTdCLFdBQVcsZUFBS0MsT0FBTCxDQUFhSixRQUFiLENBQWY7QUFDQSxTQUFLUixhQUFMLENBQW1CVyxRQUFuQixJQUErQixJQUEvQjs7QUFFQSxVQUFNRSxPQUFPVyxPQUFPQyxNQUFQLENBQWMsS0FBS1gsaUJBQUwsQ0FBdUJOLFFBQXZCLEVBQWlDSCxlQUFqQyxDQUFkLEVBQWlFO0FBQzVFb0MsaUJBQVcsS0FEaUUsRUFDMURDLE9BQU8sS0FEbUQsRUFDNUNDLFlBQVk7QUFEZ0MsS0FBakUsQ0FBYjs7QUFJQWxELFdBQU91QixNQUFQLENBQWNULFVBQWQsRUFBMEJNLElBQTFCLEVBQWdDLENBQUMrQixHQUFELEVBQU1DLEdBQU4sS0FBYztBQUM1QyxVQUFJRCxHQUFKLEVBQVM7QUFDUEosZ0JBQVFJLEdBQVI7QUFDRCxPQUZELE1BRU87QUFDTDtBQUNBTCxpQkFBU00sSUFBSTNCLEdBQWI7QUFDRDtBQUNGLEtBUEQ7O0FBU0EsUUFBSXNCLEtBQUosRUFBVztBQUNULFlBQU1BLEtBQU47QUFDRDs7QUFFRCxXQUFPO0FBQ0x2QixZQUFNc0IsTUFERDtBQUVMcEIsZ0JBQVU7QUFGTCxLQUFQO0FBSUQ7O0FBRUQyQix1QkFBcUI7QUFDbkIsV0FBT3BDLFFBQVEsbUJBQVIsRUFBNkJxQyxPQUFwQztBQUNEO0FBOUdvRDtrQkFBbENyRCxZIiwiZmlsZSI6Imxlc3MuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7Q29tcGlsZXJCYXNlfSBmcm9tICcuLi9jb21waWxlci1iYXNlJztcblxuY29uc3QgbWltZVR5cGVzID0gWyd0ZXh0L2xlc3MnXTtcbmxldCBsZXNzanMgPSBudWxsO1xuXG4vKipcbiAqIEBhY2Nlc3MgcHJpdmF0ZVxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMZXNzQ29tcGlsZXIgZXh0ZW5kcyBDb21waWxlckJhc2Uge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5jb21waWxlck9wdGlvbnMgPSB7XG4gICAgICBzb3VyY2VNYXA6IHsgc291cmNlTWFwRmlsZUlubGluZTogdHJ1ZSB9XG4gICAgfTtcbiAgICB0aGlzLnJlc29sdmVkT3B0aW9ucyA9IG51bGw7XG4gICAgdGhpcy5zZWVuRmlsZVBhdGhzID0ge307XG4gIH1cblxuICBzdGF0aWMgZ2V0SW5wdXRNaW1lVHlwZXMoKSB7XG4gICAgcmV0dXJuIG1pbWVUeXBlcztcbiAgfVxuXG4gIHN0YXRpYyBnZXRPdXRwdXRNaW1lVHlwZSgpIHtcbiAgICByZXR1cm4gJ3RleHQvY3NzJztcbiAgfVxuXG4gIGFzeW5jIHNob3VsZENvbXBpbGVGaWxlKGZpbGVOYW1lLCBjb21waWxlckNvbnRleHQpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGFzeW5jIGRldGVybWluZURlcGVuZGVudEZpbGVzKHNvdXJjZUNvZGUsIGZpbGVQYXRoLCBjb21waWxlckNvbnRleHQpIHtcbiAgICByZXR1cm4gW107XG4gIH1cblxuICBhc3luYyBjb21waWxlKHNvdXJjZUNvZGUsIGZpbGVQYXRoLCBjb21waWxlckNvbnRleHQpIHtcbiAgICBsZXNzanMgPSBsZXNzanMgfHwgcmVxdWlyZSgnbGVzcycpO1xuXG4gICAgbGV0IHRoaXNQYXRoID0gcGF0aC5kaXJuYW1lKGZpbGVQYXRoKTtcbiAgICB0aGlzLnNlZW5GaWxlUGF0aHNbdGhpc1BhdGhdID0gdHJ1ZTtcblxuICAgIGNvbnN0IG9wdHMgPSB0aGlzLmdldE9wdGlvbnNGb3JQYXRoKGZpbGVQYXRoLCBjb21waWxlckNvbnRleHQpO1xuICAgIGxldCByZXN1bHQgPSBhd2FpdCBsZXNzanMucmVuZGVyKHNvdXJjZUNvZGUsIG9wdHMpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGNvZGU6IHJlc3VsdC5jc3MsXG4gICAgICBtaW1lVHlwZTogJ3RleHQvY3NzJ1xuICAgIH07XG4gIH1cblxuICBnZXRPcHRpb25zRm9yUGF0aChmaWxlUGF0aCwgY29tcGlsZXJDb250ZXh0KSB7XG4gICAgaWYgKCF0aGlzLnJlc29sdmVkT3B0aW9ucykge1xuICAgICAgY29uc3Qge3BhdGhzLCByb290cGF0aCwgYmFzZXBhdGh9ID0gdGhpcy5jb21waWxlck9wdGlvbnM7XG4gICAgICBjb25zdCB7YXBwUm9vdH0gPSBjb21waWxlckNvbnRleHQ7XG5cbiAgICAgIHRoaXMucmVzb2x2ZWRPcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5jb21waWxlck9wdGlvbnMsIHtcbiAgICAgICAgcGF0aHM6IChwYXRocyB8fCBbXSkubWFwKChyZWxhdGl2ZVBhdGgpID0+IHBhdGgucmVzb2x2ZShhcHBSb290LCByZWxhdGl2ZVBhdGgpKSxcbiAgICAgICAgcm9vdHBhdGg6IHJvb3RwYXRoID8gcGF0aC5yZXNvbHZlKGFwcFJvb3QsIHJvb3RwYXRoKSA6IHVuZGVmaW5lZCxcbiAgICAgICAgYmFzZXBhdGg6IGJhc2VwYXRoID8gcGF0aC5yZXNvbHZlKGFwcFJvb3QsIGJhc2VwYXRoKSA6IHVuZGVmaW5lZCxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGNvbnN0IG9wdHMgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLnJlc29sdmVkT3B0aW9ucywge1xuICAgICAgZmlsZW5hbWU6IHBhdGguYmFzZW5hbWUoZmlsZVBhdGgpLFxuICAgIH0pO1xuXG4gICAgaWYgKG9wdHMucGF0aHNJbmNsdWRlU2VlbiAhPT0gZmFsc2UpIHtcbiAgICAgIG9wdHMucGF0aHMgPSBvcHRzLnBhdGhzLmNvbmNhdChPYmplY3Qua2V5cyh0aGlzLnNlZW5GaWxlUGF0aHMpKTtcbiAgICB9XG5cbiAgICAvLyBhbHdheXMgYWxsb3cgZmlsZS1yZWxhdGl2ZSBpbXBvcnRzXG4gICAgb3B0cy5wYXRocy5wdXNoKHBhdGguZGlybmFtZShmaWxlUGF0aCkpO1xuXG4gICAgcmV0dXJuIG9wdHM7XG4gIH1cblxuICBzaG91bGRDb21waWxlRmlsZVN5bmMoZmlsZU5hbWUsIGNvbXBpbGVyQ29udGV4dCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgZGV0ZXJtaW5lRGVwZW5kZW50RmlsZXNTeW5jKHNvdXJjZUNvZGUsIGZpbGVQYXRoLCBjb21waWxlckNvbnRleHQpIHtcbiAgICByZXR1cm4gW107XG4gIH1cblxuICBjb21waWxlU3luYyhzb3VyY2VDb2RlLCBmaWxlUGF0aCwgY29tcGlsZXJDb250ZXh0KSB7XG4gICAgbGVzc2pzID0gbGVzc2pzIHx8IHJlcXVpcmUoJ2xlc3MnKTtcblxuICAgIGxldCBzb3VyY2UgPSAnJztcbiAgICBsZXQgZXJyb3IgPSBudWxsO1xuXG4gICAgbGV0IHRoaXNQYXRoID0gcGF0aC5kaXJuYW1lKGZpbGVQYXRoKTtcbiAgICB0aGlzLnNlZW5GaWxlUGF0aHNbdGhpc1BhdGhdID0gdHJ1ZTtcblxuICAgIGNvbnN0IG9wdHMgPSBPYmplY3QuYXNzaWduKHRoaXMuZ2V0T3B0aW9uc0ZvclBhdGgoZmlsZVBhdGgsIGNvbXBpbGVyQ29udGV4dCksIHtcbiAgICAgIGZpbGVBc3luYzogZmFsc2UsIGFzeW5jOiBmYWxzZSwgc3luY0ltcG9ydDogdHJ1ZVxuICAgIH0pO1xuXG4gICAgbGVzc2pzLnJlbmRlcihzb3VyY2VDb2RlLCBvcHRzLCAoZXJyLCBvdXQpID0+IHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgZXJyb3IgPSBlcnI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBOQjogQmVjYXVzZSB3ZSd2ZSBmb3JjZWQgbGVzcyB0byB3b3JrIGluIHN5bmMgbW9kZSwgd2UgY2FuIGRvIHRoaXNcbiAgICAgICAgc291cmNlID0gb3V0LmNzcztcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmIChlcnJvcikge1xuICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGNvZGU6IHNvdXJjZSxcbiAgICAgIG1pbWVUeXBlOiAndGV4dC9jc3MnXG4gICAgfTtcbiAgfVxuXG4gIGdldENvbXBpbGVyVmVyc2lvbigpIHtcbiAgICByZXR1cm4gcmVxdWlyZSgnbGVzcy9wYWNrYWdlLmpzb24nKS52ZXJzaW9uO1xuICB9XG59XG4iXX0=