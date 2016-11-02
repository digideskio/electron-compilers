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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9qcy9iYWJlbC5qcyJdLCJuYW1lcyI6WyJtaW1lVHlwZXMiLCJiYWJlbCIsIkJhYmVsQ29tcGlsZXIiLCJjb25zdHJ1Y3RvciIsImdldElucHV0TWltZVR5cGVzIiwic2hvdWxkQ29tcGlsZUZpbGUiLCJmaWxlTmFtZSIsImNvbXBpbGVyQ29udGV4dCIsImRldGVybWluZURlcGVuZGVudEZpbGVzIiwic291cmNlQ29kZSIsImZpbGVQYXRoIiwiYXR0ZW1wdFRvUHJlbG9hZCIsIm5hbWVzIiwicHJlZml4IiwiZml4dXBNb2R1bGUiLCJleHAiLCJwcmVsb2FkU3RyYXRlZ2llcyIsIm1hcCIsIngiLCJyZXF1aXJlIiwibWFpbiIsIm5vZGVNb2R1bGVzQWJvdmVVcyIsInJlc29sdmUiLCJfX2Rpcm5hbWUiLCJqb2luIiwic3RyYXRlZ3kiLCJlIiwiY29tcGlsZSIsIm9wdHMiLCJPYmplY3QiLCJhc3NpZ24iLCJjb21waWxlck9wdGlvbnMiLCJmaWxlbmFtZSIsImFzdCIsImJhYmVscmMiLCJwbHVnaW5zIiwibGVuZ3RoIiwicHJlc2V0cyIsImNvZGUiLCJ0cmFuc2Zvcm0iLCJtaW1lVHlwZSIsInNob3VsZENvbXBpbGVGaWxlU3luYyIsImRldGVybWluZURlcGVuZGVudEZpbGVzU3luYyIsImNvbXBpbGVTeW5jIiwiZ2V0Q29tcGlsZXJWZXJzaW9uIiwidmVyc2lvbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7Ozs7QUFDQTs7Ozs7O0FBRUEsTUFBTUEsWUFBWSxDQUFDLFVBQUQsRUFBYSx3QkFBYixDQUFsQjtBQUNBLElBQUlDLFFBQVEsSUFBWjs7QUFHQTs7O0FBR2UsTUFBTUMsYUFBTixvQ0FBeUM7QUFDdERDLGdCQUFjO0FBQ1o7QUFDRDs7QUFFRCxTQUFPQyxpQkFBUCxHQUEyQjtBQUN6QixXQUFPSixTQUFQO0FBQ0Q7O0FBRUtLLG1CQUFOLENBQXdCQyxRQUF4QixFQUFrQ0MsZUFBbEMsRUFBbUQ7QUFBQTtBQUNqRCxhQUFPLElBQVA7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bUQ7QUFDakROLFlBQVFBLFNBQVNrQixRQUFRLFlBQVIsQ0FBakI7O0FBRUEsUUFBSVMsT0FBT0MsT0FBT0MsTUFBUCxDQUFjLEVBQWQsRUFBa0IsS0FBS0MsZUFBdkIsRUFBd0M7QUFDakRDLGdCQUFVdEIsUUFEdUM7QUFFakR1QixXQUFLLEtBRjRDO0FBR2pEQyxlQUFTO0FBSHdDLEtBQXhDLENBQVg7O0FBTUEsUUFBSSxhQUFhTixJQUFqQixFQUF1QjtBQUNyQixVQUFJTyxVQUFVLEtBQUt4QixnQkFBTCxDQUFzQmlCLEtBQUtPLE9BQTNCLEVBQW9DLFFBQXBDLENBQWQ7QUFDQSxVQUFJQSxXQUFXQSxRQUFRQyxNQUFSLEtBQW1CUixLQUFLTyxPQUFMLENBQWFDLE1BQS9DLEVBQXVEUixLQUFLTyxPQUFMLEdBQWVBLE9BQWY7QUFDeEQ7O0FBRUQsUUFBSSxhQUFhUCxJQUFqQixFQUF1QjtBQUNyQixVQUFJUyxVQUFVLEtBQUsxQixnQkFBTCxDQUFzQmlCLEtBQUtTLE9BQTNCLEVBQW9DLFFBQXBDLENBQWQ7QUFDQSxVQUFJQSxXQUFXQSxRQUFRRCxNQUFSLEtBQW1CUixLQUFLUyxPQUFMLENBQWFELE1BQS9DLEVBQXVEUixLQUFLUyxPQUFMLEdBQWVBLE9BQWY7QUFDeEQ7O0FBRUQsV0FBTztBQUNMQyxZQUFNckMsTUFBTXNDLFNBQU4sQ0FBZ0I5QixVQUFoQixFQUE0Qm1CLElBQTVCLEVBQWtDVSxJQURuQztBQUVMRSxnQkFBVTtBQUZMLEtBQVA7QUFJRDs7QUFFREksdUJBQXFCO0FBQ25CLFdBQU96QixRQUFRLHlCQUFSLEVBQW1DMEIsT0FBMUM7QUFDRDtBQTdHcUQ7a0JBQW5DM0MsYSIsImZpbGUiOiJiYWJlbC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHtDb21waWxlckJhc2V9IGZyb20gJy4uL2NvbXBpbGVyLWJhc2UnO1xuXG5jb25zdCBtaW1lVHlwZXMgPSBbJ3RleHQvanN4JywgJ2FwcGxpY2F0aW9uL2phdmFzY3JpcHQnXTtcbmxldCBiYWJlbCA9IG51bGw7XG5cblxuLyoqXG4gKiBAYWNjZXNzIHByaXZhdGVcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQmFiZWxDb21waWxlciBleHRlbmRzIENvbXBpbGVyQmFzZSB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICBzdGF0aWMgZ2V0SW5wdXRNaW1lVHlwZXMoKSB7XG4gICAgcmV0dXJuIG1pbWVUeXBlcztcbiAgfVxuXG4gIGFzeW5jIHNob3VsZENvbXBpbGVGaWxlKGZpbGVOYW1lLCBjb21waWxlckNvbnRleHQpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGFzeW5jIGRldGVybWluZURlcGVuZGVudEZpbGVzKHNvdXJjZUNvZGUsIGZpbGVQYXRoLCBjb21waWxlckNvbnRleHQpIHtcbiAgICByZXR1cm4gW107XG4gIH1cblxuICAvLyBOQjogVGhpcyBtZXRob2QgZXhpc3RzIHRvIHN0b3AgQmFiZWwgZnJvbSB0cnlpbmcgdG8gbG9hZCBwbHVnaW5zIGZyb20gdGhlXG4gIC8vIGFwcCdzIG5vZGVfbW9kdWxlcyBkaXJlY3RvcnksIHdoaWNoIGluIGEgcHJvZHVjdGlvbiBhcHAgZG9lc24ndCBoYXZlIEJhYmVsXG4gIC8vIGluc3RhbGxlZCBpbiBpdC4gSW5zdGVhZCwgd2UgdHJ5IHRvIGxvYWQgZnJvbSBvdXIgZW50cnkgcG9pbnQncyBub2RlX21vZHVsZXNcbiAgLy8gZGlyZWN0b3J5IChpLmUuIEdydW50IHBlcmhhcHMpLCBhbmQgaWYgaXQgZG9lc24ndCB3b3JrLCBqdXN0IGtlZXAgZ29pbmcuXG4gIGF0dGVtcHRUb1ByZWxvYWQobmFtZXMsIHByZWZpeCkge1xuICAgIGNvbnN0IGZpeHVwTW9kdWxlID0gKGV4cCkgPT4ge1xuICAgICAgLy8gTkI6IFNvbWUgcGx1Z2lucyBsaWtlIHRyYW5zZm9ybS1kZWNvcmF0b3JzLWxlZ2FjeSwgdXNlIGltcG9ydC9leHBvcnRcbiAgICAgIC8vIHNlbWFudGljcywgYW5kIG90aGVycyBkb24ndFxuICAgICAgaWYgKCdkZWZhdWx0JyBpbiBleHApIHJldHVybiBleHBbJ2RlZmF1bHQnXTtcbiAgICAgIHJldHVybiBleHA7XG4gICAgfTtcblxuICAgIGNvbnN0IHByZWxvYWRTdHJhdGVnaWVzID0gW1xuICAgICAgKCkgPT4gbmFtZXMubWFwKCh4KSA9PiBmaXh1cE1vZHVsZShyZXF1aXJlLm1haW4ucmVxdWlyZShgYmFiZWwtJHtwcmVmaXh9LSR7eH1gKSkpLFxuICAgICAgKCkgPT4ge1xuICAgICAgICBsZXQgbm9kZU1vZHVsZXNBYm92ZVVzID0gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uJywgJy4uJywgJy4uJyk7XG4gICAgICAgIHJldHVybiBuYW1lcy5tYXAoKHgpID0+IGZpeHVwTW9kdWxlKHJlcXVpcmUocGF0aC5qb2luKG5vZGVNb2R1bGVzQWJvdmVVcywgYGJhYmVsLSR7cHJlZml4fS0ke3h9YCkpKSk7XG4gICAgICB9LFxuICAgICAgKCkgPT4gbmFtZXMubWFwKCh4KSA9PiBmaXh1cE1vZHVsZShyZXF1aXJlKGBiYWJlbC0ke3ByZWZpeH0tJHt4fWApKSlcbiAgICBdO1xuXG4gICAgZm9yIChsZXQgc3RyYXRlZ3kgb2YgcHJlbG9hZFN0cmF0ZWdpZXMpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBzdHJhdGVneSgpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGFzeW5jIGNvbXBpbGUoc291cmNlQ29kZSwgZmlsZVBhdGgsIGNvbXBpbGVyQ29udGV4dCkge1xuICAgIGJhYmVsID0gYmFiZWwgfHwgcmVxdWlyZSgnYmFiZWwtY29yZScpO1xuXG4gICAgbGV0IG9wdHMgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmNvbXBpbGVyT3B0aW9ucywge1xuICAgICAgZmlsZW5hbWU6IGZpbGVQYXRoLFxuICAgICAgYXN0OiBmYWxzZSxcbiAgICAgIGJhYmVscmM6IGZhbHNlXG4gICAgfSk7XG5cbiAgICBpZiAoJ3BsdWdpbnMnIGluIG9wdHMpIHtcbiAgICAgIGxldCBwbHVnaW5zID0gdGhpcy5hdHRlbXB0VG9QcmVsb2FkKG9wdHMucGx1Z2lucywgJ3BsdWdpbicpO1xuICAgICAgaWYgKHBsdWdpbnMgJiYgcGx1Z2lucy5sZW5ndGggPT09IG9wdHMucGx1Z2lucy5sZW5ndGgpIG9wdHMucGx1Z2lucyA9IHBsdWdpbnM7XG4gICAgfVxuXG4gICAgaWYgKCdwcmVzZXRzJyBpbiBvcHRzKSB7XG4gICAgICBsZXQgcHJlc2V0cyA9IHRoaXMuYXR0ZW1wdFRvUHJlbG9hZChvcHRzLnByZXNldHMsICdwcmVzZXQnKTtcbiAgICAgIGlmIChwcmVzZXRzICYmIHByZXNldHMubGVuZ3RoID09PSBvcHRzLnByZXNldHMubGVuZ3RoKSBvcHRzLnByZXNldHMgPSBwcmVzZXRzO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBjb2RlOiBiYWJlbC50cmFuc2Zvcm0oc291cmNlQ29kZSwgb3B0cykuY29kZSxcbiAgICAgIG1pbWVUeXBlOiAnYXBwbGljYXRpb24vamF2YXNjcmlwdCdcbiAgICB9O1xuICB9XG5cbiAgc2hvdWxkQ29tcGlsZUZpbGVTeW5jKGZpbGVOYW1lLCBjb21waWxlckNvbnRleHQpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGRldGVybWluZURlcGVuZGVudEZpbGVzU3luYyhzb3VyY2VDb2RlLCBmaWxlUGF0aCwgY29tcGlsZXJDb250ZXh0KSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgY29tcGlsZVN5bmMoc291cmNlQ29kZSwgZmlsZVBhdGgsIGNvbXBpbGVyQ29udGV4dCkge1xuICAgIGJhYmVsID0gYmFiZWwgfHwgcmVxdWlyZSgnYmFiZWwtY29yZScpO1xuXG4gICAgbGV0IG9wdHMgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmNvbXBpbGVyT3B0aW9ucywge1xuICAgICAgZmlsZW5hbWU6IGZpbGVQYXRoLFxuICAgICAgYXN0OiBmYWxzZSxcbiAgICAgIGJhYmVscmM6IGZhbHNlXG4gICAgfSk7XG5cbiAgICBpZiAoJ3BsdWdpbnMnIGluIG9wdHMpIHtcbiAgICAgIGxldCBwbHVnaW5zID0gdGhpcy5hdHRlbXB0VG9QcmVsb2FkKG9wdHMucGx1Z2lucywgJ3BsdWdpbicpO1xuICAgICAgaWYgKHBsdWdpbnMgJiYgcGx1Z2lucy5sZW5ndGggPT09IG9wdHMucGx1Z2lucy5sZW5ndGgpIG9wdHMucGx1Z2lucyA9IHBsdWdpbnM7XG4gICAgfVxuXG4gICAgaWYgKCdwcmVzZXRzJyBpbiBvcHRzKSB7XG4gICAgICBsZXQgcHJlc2V0cyA9IHRoaXMuYXR0ZW1wdFRvUHJlbG9hZChvcHRzLnByZXNldHMsICdwcmVzZXQnKTtcbiAgICAgIGlmIChwcmVzZXRzICYmIHByZXNldHMubGVuZ3RoID09PSBvcHRzLnByZXNldHMubGVuZ3RoKSBvcHRzLnByZXNldHMgPSBwcmVzZXRzO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBjb2RlOiBiYWJlbC50cmFuc2Zvcm0oc291cmNlQ29kZSwgb3B0cykuY29kZSxcbiAgICAgIG1pbWVUeXBlOiAnYXBwbGljYXRpb24vamF2YXNjcmlwdCdcbiAgICB9O1xuICB9XG5cbiAgZ2V0Q29tcGlsZXJWZXJzaW9uKCkge1xuICAgIHJldHVybiByZXF1aXJlKCdiYWJlbC1jb3JlL3BhY2thZ2UuanNvbicpLnZlcnNpb247XG4gIH1cbn1cbiJdfQ==