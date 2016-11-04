'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _compilerBase = require('../compiler-base');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const mimeTypes = ['text/jsx', 'application/javascript'];
let babel = null;

/**
 * @access private
 */
class BabelCompiler extends _compilerBase.CompilerBase {
  constructor() {
    super();
  }

  static getInputMimeTypes() {
    return mimeTypes;
  }

  static getOutputMimeType() {
    return 'application/javascript';
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

  // NB: This method exists to stop Babel from trying to load plugins from the
  // app's node_modules directory, which in a production app doesn't have Babel
  // installed in it. Instead, we try to load from our entry point's node_modules
  // directory (i.e. Grunt perhaps), and if it doesn't work, just keep going.
  attemptToPreload(names, prefix) {
    const fixupModule = exp => {
      // NB: Some plugins like transform-decorators-legacy, use import/export
      // semantics, and others don't
      if ('default' in exp) return exp['default'];
      return exp;
    };

    const preloadStrategies = [() => names.map(x => fixupModule(require.main.require(`babel-${ prefix }-${ x }`))), () => {
      let nodeModulesAboveUs = _path2.default.resolve(__dirname, '..', '..', '..');
      return names.map(x => fixupModule(require(_path2.default.join(nodeModulesAboveUs, `babel-${ prefix }-${ x }`))));
    }, () => names.map(x => fixupModule(require(`babel-${ prefix }-${ x }`)))];

    for (let strategy of preloadStrategies) {
      try {
        return strategy();
      } catch (e) {
        continue;
      }
    }

    return null;
  }

  compile(sourceCode, filePath, compilerContext) {
    var _this = this;

    return _asyncToGenerator(function* () {
      babel = babel || require('babel-core');

      let opts = Object.assign({}, _this.compilerOptions, {
        filename: filePath,
        ast: false,
        babelrc: false
      });

      if ('plugins' in opts) {
        let plugins = _this.attemptToPreload(opts.plugins, 'plugin');
        if (plugins && plugins.length === opts.plugins.length) opts.plugins = plugins;
      }

      if ('presets' in opts) {
        let presets = _this.attemptToPreload(opts.presets, 'preset');
        if (presets && presets.length === opts.presets.length) opts.presets = presets;
      }

      return {
        code: babel.transform(sourceCode, opts).code,
        mimeType: 'application/javascript'
      };
    })();
  }

  shouldCompileFileSync(fileName, compilerContext) {
    return true;
  }

  determineDependentFilesSync(sourceCode, filePath, compilerContext) {
    return [];
  }

  compileSync(sourceCode, filePath, compilerContext) {
    babel = babel || require('babel-core');

    let opts = Object.assign({}, this.compilerOptions, {
      filename: filePath,
      ast: false,
      babelrc: false
    });

    if ('plugins' in opts) {
      let plugins = this.attemptToPreload(opts.plugins, 'plugin');
      if (plugins && plugins.length === opts.plugins.length) opts.plugins = plugins;
    }

    if ('presets' in opts) {
      let presets = this.attemptToPreload(opts.presets, 'preset');
      if (presets && presets.length === opts.presets.length) opts.presets = presets;
    }

    return {
      code: babel.transform(sourceCode, opts).code,
      mimeType: 'application/javascript'
    };
  }

  getCompilerVersion() {
    return require('babel-core/package.json').version;
  }
}
exports.default = BabelCompiler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9qcy9iYWJlbC5qcyJdLCJuYW1lcyI6WyJtaW1lVHlwZXMiLCJiYWJlbCIsIkJhYmVsQ29tcGlsZXIiLCJjb25zdHJ1Y3RvciIsImdldElucHV0TWltZVR5cGVzIiwiZ2V0T3V0cHV0TWltZVR5cGUiLCJzaG91bGRDb21waWxlRmlsZSIsImZpbGVOYW1lIiwiY29tcGlsZXJDb250ZXh0IiwiZGV0ZXJtaW5lRGVwZW5kZW50RmlsZXMiLCJzb3VyY2VDb2RlIiwiZmlsZVBhdGgiLCJhdHRlbXB0VG9QcmVsb2FkIiwibmFtZXMiLCJwcmVmaXgiLCJmaXh1cE1vZHVsZSIsImV4cCIsInByZWxvYWRTdHJhdGVnaWVzIiwibWFwIiwieCIsInJlcXVpcmUiLCJtYWluIiwibm9kZU1vZHVsZXNBYm92ZVVzIiwicmVzb2x2ZSIsIl9fZGlybmFtZSIsImpvaW4iLCJzdHJhdGVneSIsImUiLCJjb21waWxlIiwib3B0cyIsIk9iamVjdCIsImFzc2lnbiIsImNvbXBpbGVyT3B0aW9ucyIsImZpbGVuYW1lIiwiYXN0IiwiYmFiZWxyYyIsInBsdWdpbnMiLCJsZW5ndGgiLCJwcmVzZXRzIiwiY29kZSIsInRyYW5zZm9ybSIsIm1pbWVUeXBlIiwic2hvdWxkQ29tcGlsZUZpbGVTeW5jIiwiZGV0ZXJtaW5lRGVwZW5kZW50RmlsZXNTeW5jIiwiY29tcGlsZVN5bmMiLCJnZXRDb21waWxlclZlcnNpb24iLCJ2ZXJzaW9uIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTs7OztBQUNBOzs7Ozs7QUFFQSxNQUFNQSxZQUFZLENBQUMsVUFBRCxFQUFhLHdCQUFiLENBQWxCO0FBQ0EsSUFBSUMsUUFBUSxJQUFaOztBQUdBOzs7QUFHZSxNQUFNQyxhQUFOLG9DQUF5QztBQUN0REMsZ0JBQWM7QUFDWjtBQUNEOztBQUVELFNBQU9DLGlCQUFQLEdBQTJCO0FBQ3pCLFdBQU9KLFNBQVA7QUFDRDs7QUFFRCxTQUFPSyxpQkFBUCxHQUEyQjtBQUN6QixXQUFPLHdCQUFQO0FBQ0Q7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RSxXQUFPLEVBQVA7QUFDRDs7QUFFRG9DLGNBQVlsQyxVQUFaLEVBQXdCQyxRQUF4QixFQUFrQ0gsZUFBbEMsRUFBbUQ7QUFDakRQLFlBQVFBLFNBQVNtQixRQUFRLFlBQVIsQ0FBakI7O0FBRUEsUUFBSVMsT0FBT0MsT0FBT0MsTUFBUCxDQUFjLEVBQWQsRUFBa0IsS0FBS0MsZUFBdkIsRUFBd0M7QUFDakRDLGdCQUFVdEIsUUFEdUM7QUFFakR1QixXQUFLLEtBRjRDO0FBR2pEQyxlQUFTO0FBSHdDLEtBQXhDLENBQVg7O0FBTUEsUUFBSSxhQUFhTixJQUFqQixFQUF1QjtBQUNyQixVQUFJTyxVQUFVLEtBQUt4QixnQkFBTCxDQUFzQmlCLEtBQUtPLE9BQTNCLEVBQW9DLFFBQXBDLENBQWQ7QUFDQSxVQUFJQSxXQUFXQSxRQUFRQyxNQUFSLEtBQW1CUixLQUFLTyxPQUFMLENBQWFDLE1BQS9DLEVBQXVEUixLQUFLTyxPQUFMLEdBQWVBLE9BQWY7QUFDeEQ7O0FBRUQsUUFBSSxhQUFhUCxJQUFqQixFQUF1QjtBQUNyQixVQUFJUyxVQUFVLEtBQUsxQixnQkFBTCxDQUFzQmlCLEtBQUtTLE9BQTNCLEVBQW9DLFFBQXBDLENBQWQ7QUFDQSxVQUFJQSxXQUFXQSxRQUFRRCxNQUFSLEtBQW1CUixLQUFLUyxPQUFMLENBQWFELE1BQS9DLEVBQXVEUixLQUFLUyxPQUFMLEdBQWVBLE9BQWY7QUFDeEQ7O0FBRUQsV0FBTztBQUNMQyxZQUFNdEMsTUFBTXVDLFNBQU4sQ0FBZ0I5QixVQUFoQixFQUE0Qm1CLElBQTVCLEVBQWtDVSxJQURuQztBQUVMRSxnQkFBVTtBQUZMLEtBQVA7QUFJRDs7QUFFREksdUJBQXFCO0FBQ25CLFdBQU96QixRQUFRLHlCQUFSLEVBQW1DMEIsT0FBMUM7QUFDRDtBQWpIcUQ7a0JBQW5DNUMsYSIsImZpbGUiOiJiYWJlbC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHtDb21waWxlckJhc2V9IGZyb20gJy4uL2NvbXBpbGVyLWJhc2UnO1xuXG5jb25zdCBtaW1lVHlwZXMgPSBbJ3RleHQvanN4JywgJ2FwcGxpY2F0aW9uL2phdmFzY3JpcHQnXTtcbmxldCBiYWJlbCA9IG51bGw7XG5cblxuLyoqXG4gKiBAYWNjZXNzIHByaXZhdGVcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQmFiZWxDb21waWxlciBleHRlbmRzIENvbXBpbGVyQmFzZSB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICBzdGF0aWMgZ2V0SW5wdXRNaW1lVHlwZXMoKSB7XG4gICAgcmV0dXJuIG1pbWVUeXBlcztcbiAgfVxuXG4gIHN0YXRpYyBnZXRPdXRwdXRNaW1lVHlwZSgpIHtcbiAgICByZXR1cm4gJ2FwcGxpY2F0aW9uL2phdmFzY3JpcHQnO1xuICB9XG5cbiAgYXN5bmMgc2hvdWxkQ29tcGlsZUZpbGUoZmlsZU5hbWUsIGNvbXBpbGVyQ29udGV4dCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgYXN5bmMgZGV0ZXJtaW5lRGVwZW5kZW50RmlsZXMoc291cmNlQ29kZSwgZmlsZVBhdGgsIGNvbXBpbGVyQ29udGV4dCkge1xuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIC8vIE5COiBUaGlzIG1ldGhvZCBleGlzdHMgdG8gc3RvcCBCYWJlbCBmcm9tIHRyeWluZyB0byBsb2FkIHBsdWdpbnMgZnJvbSB0aGVcbiAgLy8gYXBwJ3Mgbm9kZV9tb2R1bGVzIGRpcmVjdG9yeSwgd2hpY2ggaW4gYSBwcm9kdWN0aW9uIGFwcCBkb2Vzbid0IGhhdmUgQmFiZWxcbiAgLy8gaW5zdGFsbGVkIGluIGl0LiBJbnN0ZWFkLCB3ZSB0cnkgdG8gbG9hZCBmcm9tIG91ciBlbnRyeSBwb2ludCdzIG5vZGVfbW9kdWxlc1xuICAvLyBkaXJlY3RvcnkgKGkuZS4gR3J1bnQgcGVyaGFwcyksIGFuZCBpZiBpdCBkb2Vzbid0IHdvcmssIGp1c3Qga2VlcCBnb2luZy5cbiAgYXR0ZW1wdFRvUHJlbG9hZChuYW1lcywgcHJlZml4KSB7XG4gICAgY29uc3QgZml4dXBNb2R1bGUgPSAoZXhwKSA9PiB7XG4gICAgICAvLyBOQjogU29tZSBwbHVnaW5zIGxpa2UgdHJhbnNmb3JtLWRlY29yYXRvcnMtbGVnYWN5LCB1c2UgaW1wb3J0L2V4cG9ydFxuICAgICAgLy8gc2VtYW50aWNzLCBhbmQgb3RoZXJzIGRvbid0XG4gICAgICBpZiAoJ2RlZmF1bHQnIGluIGV4cCkgcmV0dXJuIGV4cFsnZGVmYXVsdCddO1xuICAgICAgcmV0dXJuIGV4cDtcbiAgICB9O1xuXG4gICAgY29uc3QgcHJlbG9hZFN0cmF0ZWdpZXMgPSBbXG4gICAgICAoKSA9PiBuYW1lcy5tYXAoKHgpID0+IGZpeHVwTW9kdWxlKHJlcXVpcmUubWFpbi5yZXF1aXJlKGBiYWJlbC0ke3ByZWZpeH0tJHt4fWApKSksXG4gICAgICAoKSA9PiB7XG4gICAgICAgIGxldCBub2RlTW9kdWxlc0Fib3ZlVXMgPSBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4nLCAnLi4nLCAnLi4nKTtcbiAgICAgICAgcmV0dXJuIG5hbWVzLm1hcCgoeCkgPT4gZml4dXBNb2R1bGUocmVxdWlyZShwYXRoLmpvaW4obm9kZU1vZHVsZXNBYm92ZVVzLCBgYmFiZWwtJHtwcmVmaXh9LSR7eH1gKSkpKTtcbiAgICAgIH0sXG4gICAgICAoKSA9PiBuYW1lcy5tYXAoKHgpID0+IGZpeHVwTW9kdWxlKHJlcXVpcmUoYGJhYmVsLSR7cHJlZml4fS0ke3h9YCkpKVxuICAgIF07XG5cbiAgICBmb3IgKGxldCBzdHJhdGVneSBvZiBwcmVsb2FkU3RyYXRlZ2llcykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIHN0cmF0ZWd5KCk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgYXN5bmMgY29tcGlsZShzb3VyY2VDb2RlLCBmaWxlUGF0aCwgY29tcGlsZXJDb250ZXh0KSB7XG4gICAgYmFiZWwgPSBiYWJlbCB8fCByZXF1aXJlKCdiYWJlbC1jb3JlJyk7XG5cbiAgICBsZXQgb3B0cyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuY29tcGlsZXJPcHRpb25zLCB7XG4gICAgICBmaWxlbmFtZTogZmlsZVBhdGgsXG4gICAgICBhc3Q6IGZhbHNlLFxuICAgICAgYmFiZWxyYzogZmFsc2VcbiAgICB9KTtcblxuICAgIGlmICgncGx1Z2lucycgaW4gb3B0cykge1xuICAgICAgbGV0IHBsdWdpbnMgPSB0aGlzLmF0dGVtcHRUb1ByZWxvYWQob3B0cy5wbHVnaW5zLCAncGx1Z2luJyk7XG4gICAgICBpZiAocGx1Z2lucyAmJiBwbHVnaW5zLmxlbmd0aCA9PT0gb3B0cy5wbHVnaW5zLmxlbmd0aCkgb3B0cy5wbHVnaW5zID0gcGx1Z2lucztcbiAgICB9XG5cbiAgICBpZiAoJ3ByZXNldHMnIGluIG9wdHMpIHtcbiAgICAgIGxldCBwcmVzZXRzID0gdGhpcy5hdHRlbXB0VG9QcmVsb2FkKG9wdHMucHJlc2V0cywgJ3ByZXNldCcpO1xuICAgICAgaWYgKHByZXNldHMgJiYgcHJlc2V0cy5sZW5ndGggPT09IG9wdHMucHJlc2V0cy5sZW5ndGgpIG9wdHMucHJlc2V0cyA9IHByZXNldHM7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGNvZGU6IGJhYmVsLnRyYW5zZm9ybShzb3VyY2VDb2RlLCBvcHRzKS5jb2RlLFxuICAgICAgbWltZVR5cGU6ICdhcHBsaWNhdGlvbi9qYXZhc2NyaXB0J1xuICAgIH07XG4gIH1cblxuICBzaG91bGRDb21waWxlRmlsZVN5bmMoZmlsZU5hbWUsIGNvbXBpbGVyQ29udGV4dCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgZGV0ZXJtaW5lRGVwZW5kZW50RmlsZXNTeW5jKHNvdXJjZUNvZGUsIGZpbGVQYXRoLCBjb21waWxlckNvbnRleHQpIHtcbiAgICByZXR1cm4gW107XG4gIH1cblxuICBjb21waWxlU3luYyhzb3VyY2VDb2RlLCBmaWxlUGF0aCwgY29tcGlsZXJDb250ZXh0KSB7XG4gICAgYmFiZWwgPSBiYWJlbCB8fCByZXF1aXJlKCdiYWJlbC1jb3JlJyk7XG5cbiAgICBsZXQgb3B0cyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuY29tcGlsZXJPcHRpb25zLCB7XG4gICAgICBmaWxlbmFtZTogZmlsZVBhdGgsXG4gICAgICBhc3Q6IGZhbHNlLFxuICAgICAgYmFiZWxyYzogZmFsc2VcbiAgICB9KTtcblxuICAgIGlmICgncGx1Z2lucycgaW4gb3B0cykge1xuICAgICAgbGV0IHBsdWdpbnMgPSB0aGlzLmF0dGVtcHRUb1ByZWxvYWQob3B0cy5wbHVnaW5zLCAncGx1Z2luJyk7XG4gICAgICBpZiAocGx1Z2lucyAmJiBwbHVnaW5zLmxlbmd0aCA9PT0gb3B0cy5wbHVnaW5zLmxlbmd0aCkgb3B0cy5wbHVnaW5zID0gcGx1Z2lucztcbiAgICB9XG5cbiAgICBpZiAoJ3ByZXNldHMnIGluIG9wdHMpIHtcbiAgICAgIGxldCBwcmVzZXRzID0gdGhpcy5hdHRlbXB0VG9QcmVsb2FkKG9wdHMucHJlc2V0cywgJ3ByZXNldCcpO1xuICAgICAgaWYgKHByZXNldHMgJiYgcHJlc2V0cy5sZW5ndGggPT09IG9wdHMucHJlc2V0cy5sZW5ndGgpIG9wdHMucHJlc2V0cyA9IHByZXNldHM7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGNvZGU6IGJhYmVsLnRyYW5zZm9ybShzb3VyY2VDb2RlLCBvcHRzKS5jb2RlLFxuICAgICAgbWltZVR5cGU6ICdhcHBsaWNhdGlvbi9qYXZhc2NyaXB0J1xuICAgIH07XG4gIH1cblxuICBnZXRDb21waWxlclZlcnNpb24oKSB7XG4gICAgcmV0dXJuIHJlcXVpcmUoJ2JhYmVsLWNvcmUvcGFja2FnZS5qc29uJykudmVyc2lvbjtcbiAgfVxufVxuIl19