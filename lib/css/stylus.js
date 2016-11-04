'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _compilerBase = require('../compiler-base');

var _path = require('path');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const mimeTypes = ['text/stylus'];

let stylusjs = null;
let nib = null;

function each(obj, sel) {
  for (let k in obj) {
    sel(obj[k], k);
  }
}

/**
 * @access private
 */
class StylusCompiler extends _compilerBase.CompilerBase {
  constructor() {
    super();

    this.compilerOptions = {
      sourcemap: 'inline',
      import: ['nib']
    };
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
      nib = nib || require('nib');
      stylusjs = stylusjs || require('stylus');
      let opts = _this.makeOpts(filePath);

      let code = yield new Promise(function (res, rej) {
        let styl = stylusjs(sourceCode, opts);

        _this.applyOpts(opts, styl);

        styl.render(function (err, css) {
          if (err) {
            rej(err);
          } else {
            res(css);
          }
        });
      });

      return {
        code, mimeType: 'text/css'
      };
    })();
  }

  makeOpts(filePath) {
    let opts = Object.assign({}, this.compilerOptions, {
      filename: (0, _path.basename)(filePath)
    });

    if (opts.import && !Array.isArray(opts.import)) {
      opts.import = [opts.import];
    }

    if (opts.import && opts.import.indexOf('nib') >= 0) {
      opts.use = opts.use || [];

      if (!Array.isArray(opts.use)) {
        opts.use = [opts.use];
      }

      opts.use.push(nib());
    }

    return opts;
  }

  applyOpts(opts, stylus) {
    each(opts, (val, key) => {
      switch (key) {
        case 'set':
        case 'define':
          each(val, (v, k) => stylus[key](k, v));
          break;
        case 'include':
        case 'import':
        case 'use':
          each(val, v => stylus[key](v));
          break;
      }
    });
  }

  shouldCompileFileSync(fileName, compilerContext) {
    return true;
  }

  determineDependentFilesSync(sourceCode, filePath, compilerContext) {
    return [];
  }

  compileSync(sourceCode, filePath, compilerContext) {
    nib = nib || require('nib');
    stylusjs = stylusjs || require('stylus');

    let opts = this.makeOpts(filePath),
        styl = stylusjs(sourceCode, opts);

    this.applyOpts(opts, styl);

    return {
      code: styl.render(),
      mimeType: 'text/css'
    };
  }

  getCompilerVersion() {
    return require('stylus/package.json').version;
  }
}
exports.default = StylusCompiler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jc3Mvc3R5bHVzLmpzIl0sIm5hbWVzIjpbIm1pbWVUeXBlcyIsInN0eWx1c2pzIiwibmliIiwiZWFjaCIsIm9iaiIsInNlbCIsImsiLCJTdHlsdXNDb21waWxlciIsImNvbnN0cnVjdG9yIiwiY29tcGlsZXJPcHRpb25zIiwic291cmNlbWFwIiwiaW1wb3J0IiwiZ2V0SW5wdXRNaW1lVHlwZXMiLCJnZXRPdXRwdXRNaW1lVHlwZSIsInNob3VsZENvbXBpbGVGaWxlIiwiZmlsZU5hbWUiLCJjb21waWxlckNvbnRleHQiLCJkZXRlcm1pbmVEZXBlbmRlbnRGaWxlcyIsInNvdXJjZUNvZGUiLCJmaWxlUGF0aCIsImNvbXBpbGUiLCJyZXF1aXJlIiwib3B0cyIsIm1ha2VPcHRzIiwiY29kZSIsIlByb21pc2UiLCJyZXMiLCJyZWoiLCJzdHlsIiwiYXBwbHlPcHRzIiwicmVuZGVyIiwiZXJyIiwiY3NzIiwibWltZVR5cGUiLCJPYmplY3QiLCJhc3NpZ24iLCJmaWxlbmFtZSIsIkFycmF5IiwiaXNBcnJheSIsImluZGV4T2YiLCJ1c2UiLCJwdXNoIiwic3R5bHVzIiwidmFsIiwia2V5IiwidiIsInNob3VsZENvbXBpbGVGaWxlU3luYyIsImRldGVybWluZURlcGVuZGVudEZpbGVzU3luYyIsImNvbXBpbGVTeW5jIiwiZ2V0Q29tcGlsZXJWZXJzaW9uIiwidmVyc2lvbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7O0FBQ0E7Ozs7QUFFQSxNQUFNQSxZQUFZLENBQUMsYUFBRCxDQUFsQjs7QUFFQSxJQUFJQyxXQUFXLElBQWY7QUFDQSxJQUFJQyxNQUFNLElBQVY7O0FBRUEsU0FBU0MsSUFBVCxDQUFjQyxHQUFkLEVBQW1CQyxHQUFuQixFQUF3QjtBQUN0QixPQUFLLElBQUlDLENBQVQsSUFBY0YsR0FBZCxFQUFtQjtBQUNqQkMsUUFBSUQsSUFBSUUsQ0FBSixDQUFKLEVBQVlBLENBQVo7QUFDRDtBQUNGOztBQUVEOzs7QUFHZSxNQUFNQyxjQUFO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LElBQU9ILE9BQU9FLEdBQVAsRUFBWUMsQ0FBWixDQUFqQjtBQUNBO0FBVEY7QUFXRCxLQVpEO0FBYUQ7O0FBRURDLHdCQUFzQi9CLFFBQXRCLEVBQWdDQyxlQUFoQyxFQUFpRDtBQUMvQyxXQUFPLElBQVA7QUFDRDs7QUFFRCtCLDhCQUE0QjdCLFVBQTVCLEVBQXdDQyxRQUF4QyxFQUFrREgsZUFBbEQsRUFBbUU7QUFDakUsV0FBTyxFQUFQO0FBQ0Q7O0FBRURnQyxjQUFZOUIsVUFBWixFQUF3QkMsUUFBeEIsRUFBa0NILGVBQWxDLEVBQW1EO0FBQ2pEZCxVQUFNQSxPQUFPbUIsUUFBUSxLQUFSLENBQWI7QUFDQXBCLGVBQVdBLFlBQVlvQixRQUFRLFFBQVIsQ0FBdkI7O0FBRUEsUUFBSUMsT0FBTyxLQUFLQyxRQUFMLENBQWNKLFFBQWQsQ0FBWDtBQUFBLFFBQW9DUyxPQUFPM0IsU0FBU2lCLFVBQVQsRUFBcUJJLElBQXJCLENBQTNDOztBQUVBLFNBQUtPLFNBQUwsQ0FBZVAsSUFBZixFQUFxQk0sSUFBckI7O0FBRUEsV0FBTztBQUNMSixZQUFNSSxLQUFLRSxNQUFMLEVBREQ7QUFFTEcsZ0JBQVU7QUFGTCxLQUFQO0FBSUQ7O0FBRURnQix1QkFBcUI7QUFDbkIsV0FBTzVCLFFBQVEscUJBQVIsRUFBK0I2QixPQUF0QztBQUNEO0FBakhzRDtrQkFBcEMzQyxjIiwiZmlsZSI6InN0eWx1cy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Q29tcGlsZXJCYXNlfSBmcm9tICcuLi9jb21waWxlci1iYXNlJztcbmltcG9ydCB7YmFzZW5hbWV9IGZyb20gJ3BhdGgnO1xuXG5jb25zdCBtaW1lVHlwZXMgPSBbJ3RleHQvc3R5bHVzJ107XG5cbmxldCBzdHlsdXNqcyA9IG51bGw7XG5sZXQgbmliID0gbnVsbDtcblxuZnVuY3Rpb24gZWFjaChvYmosIHNlbCkge1xuICBmb3IgKGxldCBrIGluIG9iaikge1xuICAgIHNlbChvYmpba10sIGspO1xuICB9XG59XG5cbi8qKlxuICogQGFjY2VzcyBwcml2YXRlXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN0eWx1c0NvbXBpbGVyIGV4dGVuZHMgQ29tcGlsZXJCYXNlIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuY29tcGlsZXJPcHRpb25zID0ge1xuICAgICAgc291cmNlbWFwOiAnaW5saW5lJyxcbiAgICAgIGltcG9ydDogWyduaWInXVxuICAgIH07XG4gIH1cblxuICBzdGF0aWMgZ2V0SW5wdXRNaW1lVHlwZXMoKSB7XG4gICAgcmV0dXJuIG1pbWVUeXBlcztcbiAgfVxuXG4gIHN0YXRpYyBnZXRPdXRwdXRNaW1lVHlwZSgpIHtcbiAgICByZXR1cm4gJ3RleHQvY3NzJztcbiAgfVxuXG4gIGFzeW5jIHNob3VsZENvbXBpbGVGaWxlKGZpbGVOYW1lLCBjb21waWxlckNvbnRleHQpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGFzeW5jIGRldGVybWluZURlcGVuZGVudEZpbGVzKHNvdXJjZUNvZGUsIGZpbGVQYXRoLCBjb21waWxlckNvbnRleHQpIHtcbiAgICByZXR1cm4gW107XG4gIH1cblxuICBhc3luYyBjb21waWxlKHNvdXJjZUNvZGUsIGZpbGVQYXRoLCBjb21waWxlckNvbnRleHQpIHtcbiAgICBuaWIgPSBuaWIgfHwgcmVxdWlyZSgnbmliJyk7XG4gICAgc3R5bHVzanMgPSBzdHlsdXNqcyB8fCByZXF1aXJlKCdzdHlsdXMnKTtcbiAgICBsZXQgb3B0cyA9IHRoaXMubWFrZU9wdHMoZmlsZVBhdGgpO1xuXG4gICAgbGV0IGNvZGUgPSBhd2FpdCBuZXcgUHJvbWlzZSgocmVzLHJlaikgPT4ge1xuICAgICAgbGV0IHN0eWwgPSBzdHlsdXNqcyhzb3VyY2VDb2RlLCBvcHRzKTtcblxuICAgICAgdGhpcy5hcHBseU9wdHMob3B0cywgc3R5bCk7XG5cbiAgICAgIHN0eWwucmVuZGVyKChlcnIsIGNzcykgPT4ge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgcmVqKGVycik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVzKGNzcyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGNvZGUsIG1pbWVUeXBlOiAndGV4dC9jc3MnXG4gICAgfTtcbiAgfVxuXG4gIG1ha2VPcHRzKGZpbGVQYXRoKSB7XG4gICAgbGV0IG9wdHMgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmNvbXBpbGVyT3B0aW9ucywge1xuICAgICAgZmlsZW5hbWU6IGJhc2VuYW1lKGZpbGVQYXRoKVxuICAgIH0pO1xuXG4gICAgaWYgKG9wdHMuaW1wb3J0ICYmICFBcnJheS5pc0FycmF5KG9wdHMuaW1wb3J0KSkge1xuICAgICAgb3B0cy5pbXBvcnQgPSBbb3B0cy5pbXBvcnRdO1xuICAgIH1cblxuICAgIGlmIChvcHRzLmltcG9ydCAmJiBvcHRzLmltcG9ydC5pbmRleE9mKCduaWInKSA+PSAwKSB7XG4gICAgICBvcHRzLnVzZSA9IG9wdHMudXNlIHx8IFtdO1xuXG4gICAgICBpZiAoIUFycmF5LmlzQXJyYXkob3B0cy51c2UpKSB7XG4gICAgICAgIG9wdHMudXNlID0gW29wdHMudXNlXTtcbiAgICAgIH1cblxuICAgICAgb3B0cy51c2UucHVzaChuaWIoKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG9wdHM7XG4gIH1cbiAgXG4gIFxuICBhcHBseU9wdHMob3B0cywgc3R5bHVzKSB7XG4gICAgZWFjaChvcHRzLCAodmFsLCBrZXkpID0+IHtcbiAgICAgIHN3aXRjaChrZXkpIHtcbiAgICAgIGNhc2UgJ3NldCc6XG4gICAgICBjYXNlICdkZWZpbmUnOlxuICAgICAgICBlYWNoKHZhbCwgKHYsIGspID0+IHN0eWx1c1trZXldKGssIHYpKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdpbmNsdWRlJzpcbiAgICAgIGNhc2UgJ2ltcG9ydCc6XG4gICAgICBjYXNlICd1c2UnOlxuICAgICAgICBlYWNoKHZhbCwgKHYpID0+IHN0eWx1c1trZXldKHYpKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBzaG91bGRDb21waWxlRmlsZVN5bmMoZmlsZU5hbWUsIGNvbXBpbGVyQ29udGV4dCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgZGV0ZXJtaW5lRGVwZW5kZW50RmlsZXNTeW5jKHNvdXJjZUNvZGUsIGZpbGVQYXRoLCBjb21waWxlckNvbnRleHQpIHtcbiAgICByZXR1cm4gW107XG4gIH1cblxuICBjb21waWxlU3luYyhzb3VyY2VDb2RlLCBmaWxlUGF0aCwgY29tcGlsZXJDb250ZXh0KSB7XG4gICAgbmliID0gbmliIHx8IHJlcXVpcmUoJ25pYicpO1xuICAgIHN0eWx1c2pzID0gc3R5bHVzanMgfHwgcmVxdWlyZSgnc3R5bHVzJyk7XG5cbiAgICBsZXQgb3B0cyA9IHRoaXMubWFrZU9wdHMoZmlsZVBhdGgpLCBzdHlsID0gc3R5bHVzanMoc291cmNlQ29kZSwgb3B0cyk7XG5cbiAgICB0aGlzLmFwcGx5T3B0cyhvcHRzLCBzdHlsKTtcblxuICAgIHJldHVybiB7XG4gICAgICBjb2RlOiBzdHlsLnJlbmRlcigpLFxuICAgICAgbWltZVR5cGU6ICd0ZXh0L2NzcydcbiAgICB9O1xuICB9XG5cbiAgZ2V0Q29tcGlsZXJWZXJzaW9uKCkge1xuICAgIHJldHVybiByZXF1aXJlKCdzdHlsdXMvcGFja2FnZS5qc29uJykudmVyc2lvbjtcbiAgfVxufVxuIl19