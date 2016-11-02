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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jc3Mvc3R5bHVzLmpzIl0sIm5hbWVzIjpbIm1pbWVUeXBlcyIsInN0eWx1c2pzIiwibmliIiwiZWFjaCIsIm9iaiIsInNlbCIsImsiLCJTdHlsdXNDb21waWxlciIsImNvbnN0cnVjdG9yIiwiY29tcGlsZXJPcHRpb25zIiwic291cmNlbWFwIiwiaW1wb3J0IiwiZ2V0SW5wdXRNaW1lVHlwZXMiLCJzaG91bGRDb21waWxlRmlsZSIsImZpbGVOYW1lIiwiY29tcGlsZXJDb250ZXh0IiwiZGV0ZXJtaW5lRGVwZW5kZW50RmlsZXMiLCJzb3VyY2VDb2RlIiwiZmlsZVBhdGgiLCJjb21waWxlIiwicmVxdWlyZSIsIm9wdHMiLCJtYWtlT3B0cyIsImNvZGUiLCJQcm9taXNlIiwicmVzIiwicmVqIiwic3R5bCIsImFwcGx5T3B0cyIsInJlbmRlciIsImVyciIsImNzcyIsIm1pbWVUeXBlIiwiT2JqZWN0IiwiYXNzaWduIiwiZmlsZW5hbWUiLCJBcnJheSIsImlzQXJyYXkiLCJpbmRleE9mIiwidXNlIiwicHVzaCIsInN0eWx1cyIsInZhbCIsImtleSIsInYiLCJzaG91bGRDb21waWxlRmlsZVN5bmMiLCJkZXRlcm1pbmVEZXBlbmRlbnRGaWxlc1N5bmMiLCJjb21waWxlU3luYyIsImdldENvbXBpbGVyVmVyc2lvbiIsInZlcnNpb24iXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOztBQUNBOzs7O0FBRUEsTUFBTUEsWUFBWSxDQUFDLGFBQUQsQ0FBbEI7O0FBRUEsSUFBSUMsV0FBVyxJQUFmO0FBQ0EsSUFBSUMsTUFBTSxJQUFWOztBQUVBLFNBQVNDLElBQVQsQ0FBY0MsR0FBZCxFQUFtQkMsR0FBbkIsRUFBd0I7QUFDdEIsT0FBSyxJQUFJQyxDQUFULElBQWNGLEdBQWQsRUFBbUI7QUFDakJDLFFBQUlELElBQUlFLENBQUosQ0FBSixFQUFZQSxDQUFaO0FBQ0Q7QUFDRjs7QUFFRDs7O0FBR2UsTUFBTUMsY0FBTixvQ0FBMEM7QUFDdkRDLGdCQUFj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Qyx3QkFBc0IvQixRQUF0QixFQUFnQ0MsZUFBaEMsRUFBaUQ7QUFDL0MsV0FBTyxJQUFQO0FBQ0Q7O0FBRUQrQiw4QkFBNEI3QixVQUE1QixFQUF3Q0MsUUFBeEMsRUFBa0RILGVBQWxELEVBQW1FO0FBQ2pFLFdBQU8sRUFBUDtBQUNEOztBQUVEZ0MsY0FBWTlCLFVBQVosRUFBd0JDLFFBQXhCLEVBQWtDSCxlQUFsQyxFQUFtRDtBQUNqRGIsVUFBTUEsT0FBT2tCLFFBQVEsS0FBUixDQUFiO0FBQ0FuQixlQUFXQSxZQUFZbUIsUUFBUSxRQUFSLENBQXZCOztBQUVBLFFBQUlDLE9BQU8sS0FBS0MsUUFBTCxDQUFjSixRQUFkLENBQVg7QUFBQSxRQUFvQ1MsT0FBTzFCLFNBQVNnQixVQUFULEVBQXFCSSxJQUFyQixDQUEzQzs7QUFFQSxTQUFLTyxTQUFMLENBQWVQLElBQWYsRUFBcUJNLElBQXJCOztBQUVBLFdBQU87QUFDTEosWUFBTUksS0FBS0UsTUFBTCxFQUREO0FBRUxHLGdCQUFVO0FBRkwsS0FBUDtBQUlEOztBQUVEZ0IsdUJBQXFCO0FBQ25CLFdBQU81QixRQUFRLHFCQUFSLEVBQStCNkIsT0FBdEM7QUFDRDtBQTdHc0Q7a0JBQXBDMUMsYyIsImZpbGUiOiJzdHlsdXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0NvbXBpbGVyQmFzZX0gZnJvbSAnLi4vY29tcGlsZXItYmFzZSc7XG5pbXBvcnQge2Jhc2VuYW1lfSBmcm9tICdwYXRoJztcblxuY29uc3QgbWltZVR5cGVzID0gWyd0ZXh0L3N0eWx1cyddO1xuXG5sZXQgc3R5bHVzanMgPSBudWxsO1xubGV0IG5pYiA9IG51bGw7XG5cbmZ1bmN0aW9uIGVhY2gob2JqLCBzZWwpIHtcbiAgZm9yIChsZXQgayBpbiBvYmopIHtcbiAgICBzZWwob2JqW2tdLCBrKTtcbiAgfVxufVxuXG4vKipcbiAqIEBhY2Nlc3MgcHJpdmF0ZVxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTdHlsdXNDb21waWxlciBleHRlbmRzIENvbXBpbGVyQmFzZSB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLmNvbXBpbGVyT3B0aW9ucyA9IHtcbiAgICAgIHNvdXJjZW1hcDogJ2lubGluZScsXG4gICAgICBpbXBvcnQ6IFsnbmliJ11cbiAgICB9O1xuICB9XG5cbiAgc3RhdGljIGdldElucHV0TWltZVR5cGVzKCkge1xuICAgIHJldHVybiBtaW1lVHlwZXM7XG4gIH1cblxuICBhc3luYyBzaG91bGRDb21waWxlRmlsZShmaWxlTmFtZSwgY29tcGlsZXJDb250ZXh0KSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBhc3luYyBkZXRlcm1pbmVEZXBlbmRlbnRGaWxlcyhzb3VyY2VDb2RlLCBmaWxlUGF0aCwgY29tcGlsZXJDb250ZXh0KSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgYXN5bmMgY29tcGlsZShzb3VyY2VDb2RlLCBmaWxlUGF0aCwgY29tcGlsZXJDb250ZXh0KSB7XG4gICAgbmliID0gbmliIHx8IHJlcXVpcmUoJ25pYicpO1xuICAgIHN0eWx1c2pzID0gc3R5bHVzanMgfHwgcmVxdWlyZSgnc3R5bHVzJyk7XG4gICAgbGV0IG9wdHMgPSB0aGlzLm1ha2VPcHRzKGZpbGVQYXRoKTtcblxuICAgIGxldCBjb2RlID0gYXdhaXQgbmV3IFByb21pc2UoKHJlcyxyZWopID0+IHtcbiAgICAgIGxldCBzdHlsID0gc3R5bHVzanMoc291cmNlQ29kZSwgb3B0cyk7XG5cbiAgICAgIHRoaXMuYXBwbHlPcHRzKG9wdHMsIHN0eWwpO1xuXG4gICAgICBzdHlsLnJlbmRlcigoZXJyLCBjc3MpID0+IHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIHJlaihlcnIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlcyhjc3MpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHJldHVybiB7XG4gICAgICBjb2RlLCBtaW1lVHlwZTogJ3RleHQvY3NzJ1xuICAgIH07XG4gIH1cblxuICBtYWtlT3B0cyhmaWxlUGF0aCkge1xuICAgIGxldCBvcHRzID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5jb21waWxlck9wdGlvbnMsIHtcbiAgICAgIGZpbGVuYW1lOiBiYXNlbmFtZShmaWxlUGF0aClcbiAgICB9KTtcblxuICAgIGlmIChvcHRzLmltcG9ydCAmJiAhQXJyYXkuaXNBcnJheShvcHRzLmltcG9ydCkpIHtcbiAgICAgIG9wdHMuaW1wb3J0ID0gW29wdHMuaW1wb3J0XTtcbiAgICB9XG5cbiAgICBpZiAob3B0cy5pbXBvcnQgJiYgb3B0cy5pbXBvcnQuaW5kZXhPZignbmliJykgPj0gMCkge1xuICAgICAgb3B0cy51c2UgPSBvcHRzLnVzZSB8fCBbXTtcblxuICAgICAgaWYgKCFBcnJheS5pc0FycmF5KG9wdHMudXNlKSkge1xuICAgICAgICBvcHRzLnVzZSA9IFtvcHRzLnVzZV07XG4gICAgICB9XG5cbiAgICAgIG9wdHMudXNlLnB1c2gobmliKCkpO1xuICAgIH1cblxuICAgIHJldHVybiBvcHRzO1xuICB9XG4gIFxuICBcbiAgYXBwbHlPcHRzKG9wdHMsIHN0eWx1cykge1xuICAgIGVhY2gob3B0cywgKHZhbCwga2V5KSA9PiB7XG4gICAgICBzd2l0Y2goa2V5KSB7XG4gICAgICBjYXNlICdzZXQnOlxuICAgICAgY2FzZSAnZGVmaW5lJzpcbiAgICAgICAgZWFjaCh2YWwsICh2LCBrKSA9PiBzdHlsdXNba2V5XShrLCB2KSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnaW5jbHVkZSc6XG4gICAgICBjYXNlICdpbXBvcnQnOlxuICAgICAgY2FzZSAndXNlJzpcbiAgICAgICAgZWFjaCh2YWwsICh2KSA9PiBzdHlsdXNba2V5XSh2KSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgc2hvdWxkQ29tcGlsZUZpbGVTeW5jKGZpbGVOYW1lLCBjb21waWxlckNvbnRleHQpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGRldGVybWluZURlcGVuZGVudEZpbGVzU3luYyhzb3VyY2VDb2RlLCBmaWxlUGF0aCwgY29tcGlsZXJDb250ZXh0KSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgY29tcGlsZVN5bmMoc291cmNlQ29kZSwgZmlsZVBhdGgsIGNvbXBpbGVyQ29udGV4dCkge1xuICAgIG5pYiA9IG5pYiB8fCByZXF1aXJlKCduaWInKTtcbiAgICBzdHlsdXNqcyA9IHN0eWx1c2pzIHx8IHJlcXVpcmUoJ3N0eWx1cycpO1xuXG4gICAgbGV0IG9wdHMgPSB0aGlzLm1ha2VPcHRzKGZpbGVQYXRoKSwgc3R5bCA9IHN0eWx1c2pzKHNvdXJjZUNvZGUsIG9wdHMpO1xuXG4gICAgdGhpcy5hcHBseU9wdHMob3B0cywgc3R5bCk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgY29kZTogc3R5bC5yZW5kZXIoKSxcbiAgICAgIG1pbWVUeXBlOiAndGV4dC9jc3MnXG4gICAgfTtcbiAgfVxuXG4gIGdldENvbXBpbGVyVmVyc2lvbigpIHtcbiAgICByZXR1cm4gcmVxdWlyZSgnc3R5bHVzL3BhY2thZ2UuanNvbicpLnZlcnNpb247XG4gIH1cbn1cbiJdfQ==