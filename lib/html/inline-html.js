'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _mimeTypes = require('@paulcbetts/mime-types');

var _mimeTypes2 = _interopRequireDefault(_mimeTypes);

var _compilerBase = require('../compiler-base');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const inputMimeTypes = ['text/html'];
let cheerio = null;

const d = require('debug-electron')('electron-compile:inline-html');

/**
 * @access private
 */
class InlineHtmlCompiler extends _compilerBase.CompilerBase {
  constructor(compileBlock, compileBlockSync) {
    super();

    this.compileBlock = compileBlock;
    this.compileBlockSync = compileBlockSync;
  }

  static createFromCompilers(compilersByMimeType) {
    d(`Setting up inline HTML compilers: ${ JSON.stringify(Object.keys(compilersByMimeType)) }`);

    let compileBlock = (() => {
      var _ref = _asyncToGenerator(function* (sourceCode, filePath, mimeType, ctx) {
        let realType = mimeType;
        if (!mimeType && ctx.tag === 'script') realType = 'application/javascript';

        if (!realType) return sourceCode;

        let compiler = compilersByMimeType[realType] || compilersByMimeType['text/plain'];
        let ext = _mimeTypes2.default.extension(realType);
        let fakeFile = `${ filePath }:inline_${ ctx.count }.${ ext }`;

        d(`Compiling inline block for ${ filePath } with mimeType ${ mimeType }`);
        if (!(yield compiler.shouldCompileFile(fakeFile, ctx))) return sourceCode;
        return (yield compiler.compileSync(sourceCode, fakeFile, ctx)).code;
      });

      return function compileBlock(_x, _x2, _x3, _x4) {
        return _ref.apply(this, arguments);
      };
    })();

    let compileBlockSync = (sourceCode, filePath, mimeType, ctx) => {
      let realType = mimeType;
      if (!mimeType && ctx.tag === 'script') realType = 'application/javascript';

      if (!realType) return sourceCode;

      let compiler = compilersByMimeType[realType] || compilersByMimeType['text/plain'];
      let ext = _mimeTypes2.default.extension(realType);
      let fakeFile = `${ filePath }:inline_${ ctx.count }.${ ext }`;

      d(`Compiling inline block for ${ filePath } with mimeType ${ mimeType }`);
      if (!compiler.shouldCompileFileSync(fakeFile, ctx)) return sourceCode;
      return compiler.compileSync(sourceCode, fakeFile, ctx).code;
    };

    return new InlineHtmlCompiler(compileBlock, compileBlockSync);
  }

  static getInputMimeTypes() {
    return inputMimeTypes;
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

  each(nodes, selector) {
    return _asyncToGenerator(function* () {
      let acc = [];
      nodes.each(function (i, el) {
        let promise = selector(i, el);
        if (!promise) return false;

        acc.push(promise);
        return true;
      });

      yield Promise.all(acc);
    })();
  }

  eachSync(nodes, selector) {
    // NB: This method is here just so it's easier to mechanically
    // translate the async compile to compileSync
    return nodes.each((i, el) => {
      selector(i, el);
      return true;
    });
  }

  compile(sourceCode, filePath, compilerContext) {
    var _this = this;

    return _asyncToGenerator(function* () {
      cheerio = cheerio || require('cheerio');

      //Leave the attributes casing as it is, because of Angular 2 and maybe other case-sensitive frameworks
      let $ = cheerio.load(sourceCode, { lowerCaseAttributeNames: false });
      let toWait = [];

      let that = _this;
      let styleCount = 0;
      toWait.push(_this.each($('style'), (() => {
        var _ref2 = _asyncToGenerator(function* (i, el) {
          let mimeType = $(el).attr('type') || 'text/plain';

          let thisCtx = Object.assign({
            count: styleCount++,
            tag: 'style'
          }, compilerContext);

          let origText = $(el).text();
          let newText = yield that.compileBlock(origText, filePath, mimeType, thisCtx);

          if (origText !== newText) {
            $(el).text(newText);
            $(el).attr('type', 'text/css');
          }
        });

        return function (_x5, _x6) {
          return _ref2.apply(this, arguments);
        };
      })()));

      let scriptCount = 0;
      toWait.push(_this.each($('script'), (() => {
        var _ref3 = _asyncToGenerator(function* (i, el) {
          let src = $(el).attr('src');
          if (src && src.length > 2) {
            $(el).attr('src', InlineHtmlCompiler.fixupRelativeUrl(src));
            return;
          }

          let thisCtx = Object.assign({
            count: scriptCount++,
            tag: 'script'
          }, compilerContext);

          let mimeType = $(el).attr('type') || 'application/javascript';
          let origText = $(el).text();
          let newText = yield that.compileBlock(origText, filePath, mimeType, thisCtx);

          if (origText !== newText) {
            $(el).text(newText);
            $(el).attr('type', 'application/javascript');
          }
        });

        return function (_x7, _x8) {
          return _ref3.apply(this, arguments);
        };
      })()));

      $('link').map(function (i, el) {
        let href = $(el).attr('href');
        if (href && href.length > 2) {
          $(el).attr('href', InlineHtmlCompiler.fixupRelativeUrl(href));
        }

        // NB: In recent versions of Chromium, the link type MUST be text/css or
        // it will be flat-out ignored. Also I hate myself for hardcoding these.
        let type = $(el).attr('type');
        if (type === 'text/less' || type === 'text/stylus') $(el).attr('type', 'text/css');
      });

      $('x-require').map(function (i, el) {
        let src = $(el).attr('src');

        // File URL? Bail
        if (src.match(/^file:/i)) return;

        // Absolute path? Bail.
        if (src.match(/^([\/]|[A-Za-z]:)/i)) return;

        try {
          $(el).attr('src', _path2.default.resolve(_path2.default.dirname(filePath), src));
        } catch (e) {
          $(el).text(`${ e.message }\n${ e.stack }`);
        }
      });

      yield Promise.all(toWait);

      return {
        code: $.html(),
        mimeType: 'text/html'
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
    cheerio = cheerio || require('cheerio');

    //Leave the attributes casing as it is, because of Angular 2 and maybe other case-sensitive frameworks
    let $ = cheerio.load(sourceCode, { lowerCaseAttributeNames: false });

    let that = this;
    let styleCount = 0;
    this.eachSync($('style'), (() => {
      var _ref4 = _asyncToGenerator(function* (i, el) {
        let mimeType = $(el).attr('type');

        let thisCtx = Object.assign({
          count: styleCount++,
          tag: 'style'
        }, compilerContext);

        let origText = $(el).text();
        let newText = that.compileBlockSync(origText, filePath, mimeType, thisCtx);

        if (origText !== newText) {
          $(el).text(newText);
          $(el).attr('type', 'text/css');
        }
      });

      return function (_x9, _x10) {
        return _ref4.apply(this, arguments);
      };
    })());

    let scriptCount = 0;
    this.eachSync($('script'), (() => {
      var _ref5 = _asyncToGenerator(function* (i, el) {
        let src = $(el).attr('src');
        if (src && src.length > 2) {
          $(el).attr('src', InlineHtmlCompiler.fixupRelativeUrl(src));
          return;
        }

        let thisCtx = Object.assign({
          count: scriptCount++,
          tag: 'script'
        }, compilerContext);

        let mimeType = $(el).attr('type');

        let oldText = $(el).text();
        let newText = that.compileBlockSync(oldText, filePath, mimeType, thisCtx);

        if (oldText !== newText) {
          $(el).text(newText);
          $(el).attr('type', 'application/javascript');
        }
      });

      return function (_x11, _x12) {
        return _ref5.apply(this, arguments);
      };
    })());

    $('link').map((i, el) => {
      let href = $(el).attr('href');
      if (href && href.length > 2) {
        $(el).attr('href', InlineHtmlCompiler.fixupRelativeUrl(href));
      }

      // NB: In recent versions of Chromium, the link type MUST be text/css or
      // it will be flat-out ignored. Also I hate myself for hardcoding these.
      let type = $(el).attr('type');
      if (type === 'text/less' || type === 'text/stylus') $(el).attr('type', 'text/css');
    });

    $('x-require').map((i, el) => {
      let src = $(el).attr('src');

      // File URL? Bail
      if (src.match(/^file:/i)) return;

      // Absolute path? Bail.
      if (src.match(/^([\/]|[A-Za-z]:)/i)) return;

      try {
        $(el).attr('src', _path2.default.resolve(_path2.default.dirname(filePath), src));
      } catch (e) {
        $(el).text(`${ e.message }\n${ e.stack }`);
      }
    });

    return {
      code: $.html(),
      mimeType: 'text/html'
    };
  }

  getCompilerVersion() {
    let thisVersion = require('../../package.json').version;
    let compilers = this.allCompilers || [];
    let otherVersions = compilers.map(x => x.getCompilerVersion).join();

    return `${ thisVersion },${ otherVersions }`;
  }

  static fixupRelativeUrl(url) {
    if (!url.match(/^\/\//)) return url;
    return `https:${ url }`;
  }
}
exports.default = InlineHtmlCompiler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9odG1sL2lubGluZS1odG1sLmpzIl0sIm5hbWVzIjpbImlucHV0TWltZVR5cGVzIiwiY2hlZXJpbyIsImQiLCJyZXF1aXJlIiwiSW5saW5lSHRtbENvbXBpbGVyIiwiY29uc3RydWN0b3IiLCJjb21waWxlQmxvY2siLCJjb21waWxlQmxvY2tTeW5jIiwiY3JlYXRlRnJvbUNvbXBpbGVycyIsImNvbXBpbGVyc0J5TWltZVR5cGUiLCJKU09OIiwic3RyaW5naWZ5IiwiT2JqZWN0Iiwia2V5cyIsInNvdXJjZUNvZGUiLCJmaWxlUGF0aCIsIm1pbWVUeXBlIiwiY3R4IiwicmVhbFR5cGUiLCJ0YWciLCJjb21waWxlciIsImV4dCIsImV4dGVuc2lvbiIsImZha2VGaWxlIiwiY291bnQiLCJzaG91bGRDb21waWxlRmlsZSIsImNvbXBpbGVTeW5jIiwiY29kZSIsInNob3VsZENvbXBpbGVGaWxlU3luYyIsImdldElucHV0TWltZVR5cGVzIiwiZmlsZU5hbWUiLCJjb21waWxlckNvbnRleHQiLCJkZXRlcm1pbmVEZXBlbmRlbnRGaWxlcyIsImVhY2giLCJub2RlcyIsInNlbGVjdG9yIiwiYWNjIiwiaSIsImVsIiwicHJvbWlzZSIsInB1c2giLCJQcm9taXNlIiwiYWxsIiwiZWFjaFN5bmMiLCJjb21waWxlIiwiJCIsImxvYWQiLCJsb3dlckNhc2VBdHRyaWJ1dGVOYW1lcyIsInRvV2FpdCIsInRoYXQiLCJzdHlsZUNvdW50IiwiYXR0ciIsInRoaXNDdHgiLCJhc3NpZ24iLCJvcmlnVGV4dCIsInRleHQiLCJuZXdUZXh0Iiwic2NyaXB0Q291bnQiLCJzcmMiLCJsZW5ndGgiLCJmaXh1cFJlbGF0aXZlVXJsIiwibWFwIiwiaHJlZiIsInR5cGUiLCJtYXRjaCIsInJlc29sdmUiLCJkaXJuYW1lIiwiZSIsIm1lc3NhZ2UiLCJzdGFjayIsImh0bWwiLCJkZXRlcm1pbmVEZXBlbmRlbnRGaWxlc1N5bmMiLCJvbGRUZXh0IiwiZ2V0Q29tcGlsZXJWZXJzaW9uIiwidGhpc1ZlcnNpb24iLCJ2ZXJzaW9uIiwiY29tcGlsZXJzIiwiYWxsQ29tcGlsZXJzIiwib3RoZXJWZXJzaW9ucyIsIngiLCJqb2luIiwidXJsIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTs7OztBQUNBOzs7O0FBQ0E7Ozs7OztBQUVBLE1BQU1BLGlCQUFpQixDQUFDLFdBQUQsQ0FBdkI7QUFDQSxJQUFJQyxVQUFVLElBQWQ7O0FBRUEsTUFBTUMsSUFBSUMsUUFBUSxnQkFBUixFQUEwQiw4QkFBMUIsQ0FBVjs7QUFFQTs7O0FBR2UsTUFBTUMsa0JBQU4sb0NBQThDO0FBQzNEQyxjQUFZQyxZQUFaLEVBQTBCQyxnQkFBMUIsRUFBNEM7QUFDMUM7O0FBRUEsU0FBS0QsWUFBTCxHQUFvQkEsWUFBcEI7QUFDQSxTQUFLQyxnQkFBTCxHQUF3QkEsZ0JBQXhCO0FBQ0Q7O0FBRUQsU0FBT0MsbUJBQVAsQ0FBMkJDLG1CQUEzQixFQUFnRDtBQUM5Q1AsTUFBRyxzQ0FBb0NRLEtBQUtDLFNBQUwsQ0FBZUMsT0FBT0MsSUFBUCxDQUFZSixtQkFBWixDQUFmLENBQWlELEdBQXhGOztBQUVBLFFBQUlIO0FBQUEsbUNBQWUsV0FBT1EsVUFBUCxFQUFtQkMsUUFBbkIsRUFBNkJDLFFBQTdCLEVBQXVDQyxHQUF2QyxFQUErQztBQUNoRSxZQUFJQyxXQUFXRixRQUFmO0FBQ0EsWUFBSSxDQUFDQSxRQUFELElBQWFDLElBQUlFLEdBQUosS0FBWSxRQUE3QixFQUF1Q0QsV0FBVyx3QkFBWDs7QUFFdkMsWUFBSSxDQUFDQSxRQUFMLEVBQWUsT0FBT0osVUFBUDs7QUFFZixZQUFJTSxXQUFXWCxvQkFBb0JTLFFBQXBCLEtBQWlDVCxvQkFBb0IsWUFBcEIsQ0FBaEQ7QUFDQSxZQUFJWSxNQUFNLG9CQUFVQyxTQUFWLENBQW9CSixRQUFwQixDQUFWO0FBQ0EsWUFBSUssV0FBWSxJQUFFUixRQUFTLGFBQVVFLElBQUlPLEtBQU0sTUFBR0gsR0FBSSxHQUF0RDs7QUFFQW5CLFVBQUcsK0JBQTZCYSxRQUFTLG9CQUFpQkMsUUFB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Q0FBVjs7QUFFQTtBQUNBLFVBQUlPLElBQUlNLEtBQUosQ0FBVSxTQUFWLENBQUosRUFBMEI7O0FBRTFCO0FBQ0EsVUFBSU4sSUFBSU0sS0FBSixDQUFVLG9CQUFWLENBQUosRUFBcUM7O0FBRXJDLFVBQUk7QUFDRm5CLFVBQUVQLEVBQUYsRUFBTWEsSUFBTixDQUFXLEtBQVgsRUFBa0IsZUFBS2MsT0FBTCxDQUFhLGVBQUtDLE9BQUwsQ0FBYW5ELFFBQWIsQ0FBYixFQUFxQzJDLEdBQXJDLENBQWxCO0FBQ0QsT0FGRCxDQUVFLE9BQU9TLENBQVAsRUFBVTtBQUNWdEIsVUFBRVAsRUFBRixFQUFNaUIsSUFBTixDQUFZLElBQUVZLEVBQUVDLE9BQVEsT0FBSUQsRUFBRUUsS0FBTSxHQUFwQztBQUNEO0FBQ0YsS0FkRDs7QUFnQkEsV0FBTztBQUNMMUMsWUFBTWtCLEVBQUV5QixJQUFGLEVBREQ7QUFFTHRELGdCQUFVO0FBRkwsS0FBUDtBQUlEOztBQUVEeUQsdUJBQXFCO0FBQ25CLFFBQUlDLGNBQWN2RSxRQUFRLG9CQUFSLEVBQThCd0UsT0FBaEQ7QUFDQSxRQUFJQyxZQUFZLEtBQUtDLFlBQUwsSUFBcUIsRUFBckM7QUFDQSxRQUFJQyxnQkFBZ0JGLFVBQVVmLEdBQVYsQ0FBZWtCLENBQUQsSUFBT0EsRUFBRU4sa0JBQXZCLEVBQTJDTyxJQUEzQyxFQUFwQjs7QUFFQSxXQUFRLElBQUVOLFdBQVksTUFBR0ksYUFBYyxHQUF2QztBQUNEOztBQUVELFNBQU9sQixnQkFBUCxDQUF3QnFCLEdBQXhCLEVBQTZCO0FBQzNCLFFBQUksQ0FBQ0EsSUFBSWpCLEtBQUosQ0FBVSxPQUFWLENBQUwsRUFBeUIsT0FBT2lCLEdBQVA7QUFDekIsV0FBUSxVQUFRQSxHQUFJLEdBQXBCO0FBQ0Q7QUFyUTBEO2tCQUF4QzdFLGtCIiwiZmlsZSI6ImlubGluZS1odG1sLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgbWltZVR5cGVzIGZyb20gJ0BwYXVsY2JldHRzL21pbWUtdHlwZXMnO1xuaW1wb3J0IHtDb21waWxlckJhc2V9IGZyb20gJy4uL2NvbXBpbGVyLWJhc2UnO1xuXG5jb25zdCBpbnB1dE1pbWVUeXBlcyA9IFsndGV4dC9odG1sJ107XG5sZXQgY2hlZXJpbyA9IG51bGw7XG5cbmNvbnN0IGQgPSByZXF1aXJlKCdkZWJ1Zy1lbGVjdHJvbicpKCdlbGVjdHJvbi1jb21waWxlOmlubGluZS1odG1sJyk7XG5cbi8qKlxuICogQGFjY2VzcyBwcml2YXRlXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIElubGluZUh0bWxDb21waWxlciBleHRlbmRzIENvbXBpbGVyQmFzZSB7XG4gIGNvbnN0cnVjdG9yKGNvbXBpbGVCbG9jaywgY29tcGlsZUJsb2NrU3luYykge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLmNvbXBpbGVCbG9jayA9IGNvbXBpbGVCbG9jaztcbiAgICB0aGlzLmNvbXBpbGVCbG9ja1N5bmMgPSBjb21waWxlQmxvY2tTeW5jO1xuICB9XG5cbiAgc3RhdGljIGNyZWF0ZUZyb21Db21waWxlcnMoY29tcGlsZXJzQnlNaW1lVHlwZSkge1xuICAgIGQoYFNldHRpbmcgdXAgaW5saW5lIEhUTUwgY29tcGlsZXJzOiAke0pTT04uc3RyaW5naWZ5KE9iamVjdC5rZXlzKGNvbXBpbGVyc0J5TWltZVR5cGUpKX1gKTtcblxuICAgIGxldCBjb21waWxlQmxvY2sgPSBhc3luYyAoc291cmNlQ29kZSwgZmlsZVBhdGgsIG1pbWVUeXBlLCBjdHgpID0+IHtcbiAgICAgIGxldCByZWFsVHlwZSA9IG1pbWVUeXBlO1xuICAgICAgaWYgKCFtaW1lVHlwZSAmJiBjdHgudGFnID09PSAnc2NyaXB0JykgcmVhbFR5cGUgPSAnYXBwbGljYXRpb24vamF2YXNjcmlwdCc7XG5cbiAgICAgIGlmICghcmVhbFR5cGUpIHJldHVybiBzb3VyY2VDb2RlO1xuXG4gICAgICBsZXQgY29tcGlsZXIgPSBjb21waWxlcnNCeU1pbWVUeXBlW3JlYWxUeXBlXSB8fCBjb21waWxlcnNCeU1pbWVUeXBlWyd0ZXh0L3BsYWluJ107XG4gICAgICBsZXQgZXh0ID0gbWltZVR5cGVzLmV4dGVuc2lvbihyZWFsVHlwZSk7XG4gICAgICBsZXQgZmFrZUZpbGUgPSBgJHtmaWxlUGF0aH06aW5saW5lXyR7Y3R4LmNvdW50fS4ke2V4dH1gO1xuXG4gICAgICBkKGBDb21waWxpbmcgaW5saW5lIGJsb2NrIGZvciAke2ZpbGVQYXRofSB3aXRoIG1pbWVUeXBlICR7bWltZVR5cGV9YCk7XG4gICAgICBpZiAoIShhd2FpdCBjb21waWxlci5zaG91bGRDb21waWxlRmlsZShmYWtlRmlsZSwgY3R4KSkpIHJldHVybiBzb3VyY2VDb2RlO1xuICAgICAgcmV0dXJuIChhd2FpdCBjb21waWxlci5jb21waWxlU3luYyhzb3VyY2VDb2RlLCBmYWtlRmlsZSwgY3R4KSkuY29kZTtcbiAgICB9O1xuXG4gICAgbGV0IGNvbXBpbGVCbG9ja1N5bmMgPSAoc291cmNlQ29kZSwgZmlsZVBhdGgsIG1pbWVUeXBlLCBjdHgpID0+IHtcbiAgICAgIGxldCByZWFsVHlwZSA9IG1pbWVUeXBlO1xuICAgICAgaWYgKCFtaW1lVHlwZSAmJiBjdHgudGFnID09PSAnc2NyaXB0JykgcmVhbFR5cGUgPSAnYXBwbGljYXRpb24vamF2YXNjcmlwdCc7XG5cbiAgICAgIGlmICghcmVhbFR5cGUpIHJldHVybiBzb3VyY2VDb2RlO1xuXG4gICAgICBsZXQgY29tcGlsZXIgPSBjb21waWxlcnNCeU1pbWVUeXBlW3JlYWxUeXBlXSB8fCBjb21waWxlcnNCeU1pbWVUeXBlWyd0ZXh0L3BsYWluJ107XG4gICAgICBsZXQgZXh0ID0gbWltZVR5cGVzLmV4dGVuc2lvbihyZWFsVHlwZSk7XG4gICAgICBsZXQgZmFrZUZpbGUgPSBgJHtmaWxlUGF0aH06aW5saW5lXyR7Y3R4LmNvdW50fS4ke2V4dH1gO1xuXG4gICAgICBkKGBDb21waWxpbmcgaW5saW5lIGJsb2NrIGZvciAke2ZpbGVQYXRofSB3aXRoIG1pbWVUeXBlICR7bWltZVR5cGV9YCk7XG4gICAgICBpZiAoIWNvbXBpbGVyLnNob3VsZENvbXBpbGVGaWxlU3luYyhmYWtlRmlsZSwgY3R4KSkgcmV0dXJuIHNvdXJjZUNvZGU7XG4gICAgICByZXR1cm4gY29tcGlsZXIuY29tcGlsZVN5bmMoc291cmNlQ29kZSwgZmFrZUZpbGUsIGN0eCkuY29kZTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIG5ldyBJbmxpbmVIdG1sQ29tcGlsZXIoY29tcGlsZUJsb2NrLCBjb21waWxlQmxvY2tTeW5jKTtcbiAgfVxuXG4gIHN0YXRpYyBnZXRJbnB1dE1pbWVUeXBlcygpIHtcbiAgICByZXR1cm4gaW5wdXRNaW1lVHlwZXM7XG4gIH1cblxuICBhc3luYyBzaG91bGRDb21waWxlRmlsZShmaWxlTmFtZSwgY29tcGlsZXJDb250ZXh0KSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBhc3luYyBkZXRlcm1pbmVEZXBlbmRlbnRGaWxlcyhzb3VyY2VDb2RlLCBmaWxlUGF0aCwgY29tcGlsZXJDb250ZXh0KSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgYXN5bmMgZWFjaChub2Rlcywgc2VsZWN0b3IpIHtcbiAgICBsZXQgYWNjID0gW107XG4gICAgbm9kZXMuZWFjaCgoaSwgZWwpID0+IHtcbiAgICAgIGxldCBwcm9taXNlID0gc2VsZWN0b3IoaSxlbCk7XG4gICAgICBpZiAoIXByb21pc2UpIHJldHVybiBmYWxzZTtcblxuICAgICAgYWNjLnB1c2gocHJvbWlzZSk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9KTtcblxuICAgIGF3YWl0IFByb21pc2UuYWxsKGFjYyk7XG4gIH1cblxuICBlYWNoU3luYyhub2Rlcywgc2VsZWN0b3IpIHtcbiAgICAvLyBOQjogVGhpcyBtZXRob2QgaXMgaGVyZSBqdXN0IHNvIGl0J3MgZWFzaWVyIHRvIG1lY2hhbmljYWxseVxuICAgIC8vIHRyYW5zbGF0ZSB0aGUgYXN5bmMgY29tcGlsZSB0byBjb21waWxlU3luY1xuICAgIHJldHVybiBub2Rlcy5lYWNoKChpLGVsKSA9PiB7XG4gICAgICBzZWxlY3RvcihpLGVsKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgY29tcGlsZShzb3VyY2VDb2RlLCBmaWxlUGF0aCwgY29tcGlsZXJDb250ZXh0KSB7XG4gICAgY2hlZXJpbyA9IGNoZWVyaW8gfHwgcmVxdWlyZSgnY2hlZXJpbycpO1xuICAgIFxuICAgIC8vTGVhdmUgdGhlIGF0dHJpYnV0ZXMgY2FzaW5nIGFzIGl0IGlzLCBiZWNhdXNlIG9mIEFuZ3VsYXIgMiBhbmQgbWF5YmUgb3RoZXIgY2FzZS1zZW5zaXRpdmUgZnJhbWV3b3Jrc1xuICAgIGxldCAkID0gY2hlZXJpby5sb2FkKHNvdXJjZUNvZGUsIHtsb3dlckNhc2VBdHRyaWJ1dGVOYW1lczogZmFsc2V9KTtcbiAgICBsZXQgdG9XYWl0ID0gW107XG5cbiAgICBsZXQgdGhhdCA9IHRoaXM7XG4gICAgbGV0IHN0eWxlQ291bnQgPSAwO1xuICAgIHRvV2FpdC5wdXNoKHRoaXMuZWFjaCgkKCdzdHlsZScpLCBhc3luYyAoaSwgZWwpID0+IHtcbiAgICAgIGxldCBtaW1lVHlwZSA9ICQoZWwpLmF0dHIoJ3R5cGUnKSB8fCAndGV4dC9wbGFpbic7XG5cbiAgICAgIGxldCB0aGlzQ3R4ID0gT2JqZWN0LmFzc2lnbih7XG4gICAgICAgIGNvdW50OiBzdHlsZUNvdW50KyssXG4gICAgICAgIHRhZzogJ3N0eWxlJ1xuICAgICAgfSwgY29tcGlsZXJDb250ZXh0KTtcblxuICAgICAgbGV0IG9yaWdUZXh0ID0gJChlbCkudGV4dCgpO1xuICAgICAgbGV0IG5ld1RleHQgPSBhd2FpdCB0aGF0LmNvbXBpbGVCbG9jayhvcmlnVGV4dCwgZmlsZVBhdGgsIG1pbWVUeXBlLCB0aGlzQ3R4KTtcblxuICAgICAgaWYgKG9yaWdUZXh0ICE9PSBuZXdUZXh0KSB7XG4gICAgICAgICQoZWwpLnRleHQobmV3VGV4dCk7XG4gICAgICAgICQoZWwpLmF0dHIoJ3R5cGUnLCAndGV4dC9jc3MnKTtcbiAgICAgIH1cbiAgICB9KSk7XG5cbiAgICBsZXQgc2NyaXB0Q291bnQgPSAwO1xuICAgIHRvV2FpdC5wdXNoKHRoaXMuZWFjaCgkKCdzY3JpcHQnKSwgYXN5bmMgKGksIGVsKSA9PiB7XG4gICAgICBsZXQgc3JjID0gJChlbCkuYXR0cignc3JjJyk7XG4gICAgICBpZiAoc3JjICYmIHNyYy5sZW5ndGggPiAyKSB7XG4gICAgICAgICQoZWwpLmF0dHIoJ3NyYycsIElubGluZUh0bWxDb21waWxlci5maXh1cFJlbGF0aXZlVXJsKHNyYykpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGxldCB0aGlzQ3R4ID0gT2JqZWN0LmFzc2lnbih7XG4gICAgICAgIGNvdW50OiBzY3JpcHRDb3VudCsrLFxuICAgICAgICB0YWc6ICdzY3JpcHQnXG4gICAgICB9LCBjb21waWxlckNvbnRleHQpO1xuXG4gICAgICBsZXQgbWltZVR5cGUgPSAkKGVsKS5hdHRyKCd0eXBlJykgfHwgJ2FwcGxpY2F0aW9uL2phdmFzY3JpcHQnO1xuICAgICAgbGV0IG9yaWdUZXh0ID0gJChlbCkudGV4dCgpO1xuICAgICAgbGV0IG5ld1RleHQgPSBhd2FpdCB0aGF0LmNvbXBpbGVCbG9jayhvcmlnVGV4dCwgZmlsZVBhdGgsIG1pbWVUeXBlLCB0aGlzQ3R4KTtcblxuICAgICAgaWYgKG9yaWdUZXh0ICE9PSBuZXdUZXh0KSB7XG4gICAgICAgICQoZWwpLnRleHQobmV3VGV4dCk7XG4gICAgICAgICQoZWwpLmF0dHIoJ3R5cGUnLCAnYXBwbGljYXRpb24vamF2YXNjcmlwdCcpO1xuICAgICAgfVxuICAgIH0pKTtcblxuICAgICQoJ2xpbmsnKS5tYXAoKGksIGVsKSA9PiB7XG4gICAgICBsZXQgaHJlZiA9ICQoZWwpLmF0dHIoJ2hyZWYnKTtcbiAgICAgIGlmIChocmVmICYmIGhyZWYubGVuZ3RoID4gMikgeyAkKGVsKS5hdHRyKCdocmVmJywgSW5saW5lSHRtbENvbXBpbGVyLmZpeHVwUmVsYXRpdmVVcmwoaHJlZikpOyB9XG5cbiAgICAgIC8vIE5COiBJbiByZWNlbnQgdmVyc2lvbnMgb2YgQ2hyb21pdW0sIHRoZSBsaW5rIHR5cGUgTVVTVCBiZSB0ZXh0L2NzcyBvclxuICAgICAgLy8gaXQgd2lsbCBiZSBmbGF0LW91dCBpZ25vcmVkLiBBbHNvIEkgaGF0ZSBteXNlbGYgZm9yIGhhcmRjb2RpbmcgdGhlc2UuXG4gICAgICBsZXQgdHlwZSA9ICQoZWwpLmF0dHIoJ3R5cGUnKTtcbiAgICAgIGlmICh0eXBlID09PSAndGV4dC9sZXNzJyB8fCB0eXBlID09PSAndGV4dC9zdHlsdXMnKSAkKGVsKS5hdHRyKCd0eXBlJywgJ3RleHQvY3NzJyk7XG4gICAgfSk7XG5cbiAgICAkKCd4LXJlcXVpcmUnKS5tYXAoKGksIGVsKSA9PiB7XG4gICAgICBsZXQgc3JjID0gJChlbCkuYXR0cignc3JjJyk7XG5cbiAgICAgIC8vIEZpbGUgVVJMPyBCYWlsXG4gICAgICBpZiAoc3JjLm1hdGNoKC9eZmlsZTovaSkpIHJldHVybjtcblxuICAgICAgLy8gQWJzb2x1dGUgcGF0aD8gQmFpbC5cbiAgICAgIGlmIChzcmMubWF0Y2goL14oW1xcL118W0EtWmEtel06KS9pKSkgcmV0dXJuO1xuXG4gICAgICB0cnkge1xuICAgICAgICAkKGVsKS5hdHRyKCdzcmMnLCBwYXRoLnJlc29sdmUocGF0aC5kaXJuYW1lKGZpbGVQYXRoKSwgc3JjKSk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICQoZWwpLnRleHQoYCR7ZS5tZXNzYWdlfVxcbiR7ZS5zdGFja31gKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGF3YWl0IFByb21pc2UuYWxsKHRvV2FpdCk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgY29kZTogJC5odG1sKCksXG4gICAgICBtaW1lVHlwZTogJ3RleHQvaHRtbCdcbiAgICB9O1xuICB9XG5cbiAgc2hvdWxkQ29tcGlsZUZpbGVTeW5jKGZpbGVOYW1lLCBjb21waWxlckNvbnRleHQpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGRldGVybWluZURlcGVuZGVudEZpbGVzU3luYyhzb3VyY2VDb2RlLCBmaWxlUGF0aCwgY29tcGlsZXJDb250ZXh0KSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgY29tcGlsZVN5bmMoc291cmNlQ29kZSwgZmlsZVBhdGgsIGNvbXBpbGVyQ29udGV4dCkge1xuICAgIGNoZWVyaW8gPSBjaGVlcmlvIHx8IHJlcXVpcmUoJ2NoZWVyaW8nKTtcbiAgICBcbiAgICAvL0xlYXZlIHRoZSBhdHRyaWJ1dGVzIGNhc2luZyBhcyBpdCBpcywgYmVjYXVzZSBvZiBBbmd1bGFyIDIgYW5kIG1heWJlIG90aGVyIGNhc2Utc2Vuc2l0aXZlIGZyYW1ld29ya3NcbiAgICBsZXQgJCA9IGNoZWVyaW8ubG9hZChzb3VyY2VDb2RlLCB7bG93ZXJDYXNlQXR0cmlidXRlTmFtZXM6IGZhbHNlfSk7XG5cbiAgICBsZXQgdGhhdCA9IHRoaXM7XG4gICAgbGV0IHN0eWxlQ291bnQgPSAwO1xuICAgIHRoaXMuZWFjaFN5bmMoJCgnc3R5bGUnKSwgYXN5bmMgKGksIGVsKSA9PiB7XG4gICAgICBsZXQgbWltZVR5cGUgPSAkKGVsKS5hdHRyKCd0eXBlJyk7XG5cbiAgICAgIGxldCB0aGlzQ3R4ID0gT2JqZWN0LmFzc2lnbih7XG4gICAgICAgIGNvdW50OiBzdHlsZUNvdW50KyssXG4gICAgICAgIHRhZzogJ3N0eWxlJ1xuICAgICAgfSwgY29tcGlsZXJDb250ZXh0KTtcblxuICAgICAgbGV0IG9yaWdUZXh0ID0gJChlbCkudGV4dCgpO1xuICAgICAgbGV0IG5ld1RleHQgPSB0aGF0LmNvbXBpbGVCbG9ja1N5bmMob3JpZ1RleHQsIGZpbGVQYXRoLCBtaW1lVHlwZSwgdGhpc0N0eCk7XG5cbiAgICAgIGlmIChvcmlnVGV4dCAhPT0gbmV3VGV4dCkge1xuICAgICAgICAkKGVsKS50ZXh0KG5ld1RleHQpO1xuICAgICAgICAkKGVsKS5hdHRyKCd0eXBlJywgJ3RleHQvY3NzJyk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBsZXQgc2NyaXB0Q291bnQgPSAwO1xuICAgIHRoaXMuZWFjaFN5bmMoJCgnc2NyaXB0JyksIGFzeW5jIChpLCBlbCkgPT4ge1xuICAgICAgbGV0IHNyYyA9ICQoZWwpLmF0dHIoJ3NyYycpO1xuICAgICAgaWYgKHNyYyAmJiBzcmMubGVuZ3RoID4gMikge1xuICAgICAgICAkKGVsKS5hdHRyKCdzcmMnLCBJbmxpbmVIdG1sQ29tcGlsZXIuZml4dXBSZWxhdGl2ZVVybChzcmMpKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBsZXQgdGhpc0N0eCA9IE9iamVjdC5hc3NpZ24oe1xuICAgICAgICBjb3VudDogc2NyaXB0Q291bnQrKyxcbiAgICAgICAgdGFnOiAnc2NyaXB0J1xuICAgICAgfSwgY29tcGlsZXJDb250ZXh0KTtcblxuICAgICAgbGV0IG1pbWVUeXBlID0gJChlbCkuYXR0cigndHlwZScpO1xuXG4gICAgICBsZXQgb2xkVGV4dCA9ICQoZWwpLnRleHQoKTtcbiAgICAgIGxldCBuZXdUZXh0ID0gdGhhdC5jb21waWxlQmxvY2tTeW5jKG9sZFRleHQsIGZpbGVQYXRoLCBtaW1lVHlwZSwgdGhpc0N0eCk7XG5cbiAgICAgIGlmIChvbGRUZXh0ICE9PSBuZXdUZXh0KSB7XG4gICAgICAgICQoZWwpLnRleHQobmV3VGV4dCk7XG4gICAgICAgICQoZWwpLmF0dHIoJ3R5cGUnLCAnYXBwbGljYXRpb24vamF2YXNjcmlwdCcpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgJCgnbGluaycpLm1hcCgoaSwgZWwpID0+IHtcbiAgICAgIGxldCBocmVmID0gJChlbCkuYXR0cignaHJlZicpO1xuICAgICAgaWYgKGhyZWYgJiYgaHJlZi5sZW5ndGggPiAyKSB7ICQoZWwpLmF0dHIoJ2hyZWYnLCBJbmxpbmVIdG1sQ29tcGlsZXIuZml4dXBSZWxhdGl2ZVVybChocmVmKSk7IH1cblxuICAgICAgLy8gTkI6IEluIHJlY2VudCB2ZXJzaW9ucyBvZiBDaHJvbWl1bSwgdGhlIGxpbmsgdHlwZSBNVVNUIGJlIHRleHQvY3NzIG9yXG4gICAgICAvLyBpdCB3aWxsIGJlIGZsYXQtb3V0IGlnbm9yZWQuIEFsc28gSSBoYXRlIG15c2VsZiBmb3IgaGFyZGNvZGluZyB0aGVzZS5cbiAgICAgIGxldCB0eXBlID0gJChlbCkuYXR0cigndHlwZScpO1xuICAgICAgaWYgKHR5cGUgPT09ICd0ZXh0L2xlc3MnIHx8IHR5cGUgPT09ICd0ZXh0L3N0eWx1cycpICQoZWwpLmF0dHIoJ3R5cGUnLCAndGV4dC9jc3MnKTtcbiAgICB9KTtcblxuICAgICQoJ3gtcmVxdWlyZScpLm1hcCgoaSwgZWwpID0+IHtcbiAgICAgIGxldCBzcmMgPSAkKGVsKS5hdHRyKCdzcmMnKTtcblxuICAgICAgLy8gRmlsZSBVUkw/IEJhaWxcbiAgICAgIGlmIChzcmMubWF0Y2goL15maWxlOi9pKSkgcmV0dXJuO1xuXG4gICAgICAvLyBBYnNvbHV0ZSBwYXRoPyBCYWlsLlxuICAgICAgaWYgKHNyYy5tYXRjaCgvXihbXFwvXXxbQS1aYS16XTopL2kpKSByZXR1cm47XG5cbiAgICAgIHRyeSB7XG4gICAgICAgICQoZWwpLmF0dHIoJ3NyYycsIHBhdGgucmVzb2x2ZShwYXRoLmRpcm5hbWUoZmlsZVBhdGgpLCBzcmMpKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgJChlbCkudGV4dChgJHtlLm1lc3NhZ2V9XFxuJHtlLnN0YWNrfWApO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGNvZGU6ICQuaHRtbCgpLFxuICAgICAgbWltZVR5cGU6ICd0ZXh0L2h0bWwnXG4gICAgfTtcbiAgfVxuXG4gIGdldENvbXBpbGVyVmVyc2lvbigpIHtcbiAgICBsZXQgdGhpc1ZlcnNpb24gPSByZXF1aXJlKCcuLi8uLi9wYWNrYWdlLmpzb24nKS52ZXJzaW9uO1xuICAgIGxldCBjb21waWxlcnMgPSB0aGlzLmFsbENvbXBpbGVycyB8fCBbXTtcbiAgICBsZXQgb3RoZXJWZXJzaW9ucyA9IGNvbXBpbGVycy5tYXAoKHgpID0+IHguZ2V0Q29tcGlsZXJWZXJzaW9uKS5qb2luKCk7XG5cbiAgICByZXR1cm4gYCR7dGhpc1ZlcnNpb259LCR7b3RoZXJWZXJzaW9uc31gO1xuICB9XG5cbiAgc3RhdGljIGZpeHVwUmVsYXRpdmVVcmwodXJsKSB7XG4gICAgaWYgKCF1cmwubWF0Y2goL15cXC9cXC8vKSkgcmV0dXJuIHVybDtcbiAgICByZXR1cm4gYGh0dHBzOiR7dXJsfWA7XG4gIH1cbn1cbiJdfQ==