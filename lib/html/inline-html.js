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

  static getOutputMimeType() {
    return 'text/html';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9odG1sL2lubGluZS1odG1sLmpzIl0sIm5hbWVzIjpbImlucHV0TWltZVR5cGVzIiwiY2hlZXJpbyIsImQiLCJyZXF1aXJlIiwiSW5saW5lSHRtbENvbXBpbGVyIiwiY29uc3RydWN0b3IiLCJjb21waWxlQmxvY2siLCJjb21waWxlQmxvY2tTeW5jIiwiY3JlYXRlRnJvbUNvbXBpbGVycyIsImNvbXBpbGVyc0J5TWltZVR5cGUiLCJKU09OIiwic3RyaW5naWZ5IiwiT2JqZWN0Iiwia2V5cyIsInNvdXJjZUNvZGUiLCJmaWxlUGF0aCIsIm1pbWVUeXBlIiwiY3R4IiwicmVhbFR5cGUiLCJ0YWciLCJjb21waWxlciIsImV4dCIsImV4dGVuc2lvbiIsImZha2VGaWxlIiwiY291bnQiLCJzaG91bGRDb21waWxlRmlsZSIsImNvbXBpbGVTeW5jIiwiY29kZSIsInNob3VsZENvbXBpbGVGaWxlU3luYyIsImdldElucHV0TWltZVR5cGVzIiwiZ2V0T3V0cHV0TWltZVR5cGUiLCJmaWxlTmFtZSIsImNvbXBpbGVyQ29udGV4dCIsImRldGVybWluZURlcGVuZGVudEZpbGVzIiwiZWFjaCIsIm5vZGVzIiwic2VsZWN0b3IiLCJhY2MiLCJpIiwiZWwiLCJwcm9taXNlIiwicHVzaCIsIlByb21pc2UiLCJhbGwiLCJlYWNoU3luYyIsImNvbXBpbGUiLCIkIiwibG9hZCIsImxvd2VyQ2FzZUF0dHJpYnV0ZU5hbWVzIiwidG9XYWl0IiwidGhhdCIsInN0eWxlQ291bnQiLCJhdHRyIiwidGhpc0N0eCIsImFzc2lnbiIsIm9yaWdUZXh0IiwidGV4dCIsIm5ld1RleHQiLCJzY3JpcHRDb3VudCIsInNyYyIsImxlbmd0aCIsImZpeHVwUmVsYXRpdmVVcmwiLCJtYXAiLCJocmVmIiwidHlwZSIsIm1hdGNoIiwicmVzb2x2ZSIsImRpcm5hbWUiLCJlIiwibWVzc2FnZSIsInN0YWNrIiwiaHRtbCIsImRldGVybWluZURlcGVuZGVudEZpbGVzU3luYyIsIm9sZFRleHQiLCJnZXRDb21waWxlclZlcnNpb24iLCJ0aGlzVmVyc2lvbiIsInZlcnNpb24iLCJjb21waWxlcnMiLCJhbGxDb21waWxlcnMiLCJvdGhlclZlcnNpb25zIiwieCIsImpvaW4iLCJ1cmwiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7O0FBRUEsTUFBTUEsaUJBQWlCLENBQUMsV0FBRCxDQUF2QjtBQUNBLElBQUlDLFVBQVUsSUFBZDs7QUFFQSxNQUFNQyxJQUFJQyxRQUFRLGdCQUFSLEVBQTBCLDhCQUExQixDQUFWOztBQUVBOzs7QUFHZSxNQUFNQyxrQkFBTixvQ0FBOEM7QUFDM0RDLGNBQVlDLFlBQVosRUFBMEJDLGdCQUExQixFQUE0QztBQUMxQzs7QUFFQSxTQUFLRCxZQUFMLEdBQW9CQSxZQUFwQjtBQUNBLFNBQUtDLGdCQUFMLEdBQXdCQSxnQkFBeEI7QUFDRDs7QUFFRCxTQUFPQyxtQkFBUCxDQUEyQkMsbUJBQTNCLEVBQWdEO0FBQzlDUCxNQUFHLHNDQUFvQ1EsS0FBS0MsU0FBTCxDQUFlQyxPQUFPQyxJQUFQLENBQVlKLG1CQUFaLENBQWYsQ0FBaUQsR0FBeEY7O0FBRUEsUUFBSUg7QUFBQSxtQ0FBZSxXQUFPUSxVQUFQLEVBQW1CQyxRQUFuQixFQUE2QkMsUUFBN0IsRUFBdUNDLEdBQXZDLEVBQStDO0FBQ2hFLFlBQUlDLFdBQVdGLFFBQWY7QUFDQSxZQUFJLENBQUNBLFFBQUQsSUFBYUMsSUFBSUUsR0FBSixLQUFZLFFBQTdCLEVBQXVDRCxXQUFXLHdCQUFYOztBQUV2QyxZQUFJLENBQUNBLFFBQUwsRUFBZSxPQUFPSixVQUFQOztBQUVmLFlBQUlNLFdBQVdYLG9CQUFvQlMsUUFBcEIsS0FBaUNULG9CQUFvQixZQUFwQixDQUFoRDtBQUNBLFlBQUlZLE1BQU0sb0JBQVVDLFNBQVYsQ0FBb0JKLFFBQXBCLENBQVY7QUFDQSxZQUFJSyxXQUFZLElBQUVSLFFBQVMsYUFBVUUsSUFBSU8sS0FBTSxNQUFHSCxHQUFJLEdBQXREOztBQUVBbkIsVUFBRywrQkFB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IjpbImltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IG1pbWVUeXBlcyBmcm9tICdAcGF1bGNiZXR0cy9taW1lLXR5cGVzJztcbmltcG9ydCB7Q29tcGlsZXJCYXNlfSBmcm9tICcuLi9jb21waWxlci1iYXNlJztcblxuY29uc3QgaW5wdXRNaW1lVHlwZXMgPSBbJ3RleHQvaHRtbCddO1xubGV0IGNoZWVyaW8gPSBudWxsO1xuXG5jb25zdCBkID0gcmVxdWlyZSgnZGVidWctZWxlY3Ryb24nKSgnZWxlY3Ryb24tY29tcGlsZTppbmxpbmUtaHRtbCcpO1xuXG4vKipcbiAqIEBhY2Nlc3MgcHJpdmF0ZVxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJbmxpbmVIdG1sQ29tcGlsZXIgZXh0ZW5kcyBDb21waWxlckJhc2Uge1xuICBjb25zdHJ1Y3Rvcihjb21waWxlQmxvY2ssIGNvbXBpbGVCbG9ja1N5bmMpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5jb21waWxlQmxvY2sgPSBjb21waWxlQmxvY2s7XG4gICAgdGhpcy5jb21waWxlQmxvY2tTeW5jID0gY29tcGlsZUJsb2NrU3luYztcbiAgfVxuXG4gIHN0YXRpYyBjcmVhdGVGcm9tQ29tcGlsZXJzKGNvbXBpbGVyc0J5TWltZVR5cGUpIHtcbiAgICBkKGBTZXR0aW5nIHVwIGlubGluZSBIVE1MIGNvbXBpbGVyczogJHtKU09OLnN0cmluZ2lmeShPYmplY3Qua2V5cyhjb21waWxlcnNCeU1pbWVUeXBlKSl9YCk7XG5cbiAgICBsZXQgY29tcGlsZUJsb2NrID0gYXN5bmMgKHNvdXJjZUNvZGUsIGZpbGVQYXRoLCBtaW1lVHlwZSwgY3R4KSA9PiB7XG4gICAgICBsZXQgcmVhbFR5cGUgPSBtaW1lVHlwZTtcbiAgICAgIGlmICghbWltZVR5cGUgJiYgY3R4LnRhZyA9PT0gJ3NjcmlwdCcpIHJlYWxUeXBlID0gJ2FwcGxpY2F0aW9uL2phdmFzY3JpcHQnO1xuXG4gICAgICBpZiAoIXJlYWxUeXBlKSByZXR1cm4gc291cmNlQ29kZTtcblxuICAgICAgbGV0IGNvbXBpbGVyID0gY29tcGlsZXJzQnlNaW1lVHlwZVtyZWFsVHlwZV0gfHwgY29tcGlsZXJzQnlNaW1lVHlwZVsndGV4dC9wbGFpbiddO1xuICAgICAgbGV0IGV4dCA9IG1pbWVUeXBlcy5leHRlbnNpb24ocmVhbFR5cGUpO1xuICAgICAgbGV0IGZha2VGaWxlID0gYCR7ZmlsZVBhdGh9OmlubGluZV8ke2N0eC5jb3VudH0uJHtleHR9YDtcblxuICAgICAgZChgQ29tcGlsaW5nIGlubGluZSBibG9jayBmb3IgJHtmaWxlUGF0aH0gd2l0aCBtaW1lVHlwZSAke21pbWVUeXBlfWApO1xuICAgICAgaWYgKCEoYXdhaXQgY29tcGlsZXIuc2hvdWxkQ29tcGlsZUZpbGUoZmFrZUZpbGUsIGN0eCkpKSByZXR1cm4gc291cmNlQ29kZTtcbiAgICAgIHJldHVybiAoYXdhaXQgY29tcGlsZXIuY29tcGlsZVN5bmMoc291cmNlQ29kZSwgZmFrZUZpbGUsIGN0eCkpLmNvZGU7XG4gICAgfTtcblxuICAgIGxldCBjb21waWxlQmxvY2tTeW5jID0gKHNvdXJjZUNvZGUsIGZpbGVQYXRoLCBtaW1lVHlwZSwgY3R4KSA9PiB7XG4gICAgICBsZXQgcmVhbFR5cGUgPSBtaW1lVHlwZTtcbiAgICAgIGlmICghbWltZVR5cGUgJiYgY3R4LnRhZyA9PT0gJ3NjcmlwdCcpIHJlYWxUeXBlID0gJ2FwcGxpY2F0aW9uL2phdmFzY3JpcHQnO1xuXG4gICAgICBpZiAoIXJlYWxUeXBlKSByZXR1cm4gc291cmNlQ29kZTtcblxuICAgICAgbGV0IGNvbXBpbGVyID0gY29tcGlsZXJzQnlNaW1lVHlwZVtyZWFsVHlwZV0gfHwgY29tcGlsZXJzQnlNaW1lVHlwZVsndGV4dC9wbGFpbiddO1xuICAgICAgbGV0IGV4dCA9IG1pbWVUeXBlcy5leHRlbnNpb24ocmVhbFR5cGUpO1xuICAgICAgbGV0IGZha2VGaWxlID0gYCR7ZmlsZVBhdGh9OmlubGluZV8ke2N0eC5jb3VudH0uJHtleHR9YDtcblxuICAgICAgZChgQ29tcGlsaW5nIGlubGluZSBibG9jayBmb3IgJHtmaWxlUGF0aH0gd2l0aCBtaW1lVHlwZSAke21pbWVUeXBlfWApO1xuICAgICAgaWYgKCFjb21waWxlci5zaG91bGRDb21waWxlRmlsZVN5bmMoZmFrZUZpbGUsIGN0eCkpIHJldHVybiBzb3VyY2VDb2RlO1xuICAgICAgcmV0dXJuIGNvbXBpbGVyLmNvbXBpbGVTeW5jKHNvdXJjZUNvZGUsIGZha2VGaWxlLCBjdHgpLmNvZGU7XG4gICAgfTtcblxuICAgIHJldHVybiBuZXcgSW5saW5lSHRtbENvbXBpbGVyKGNvbXBpbGVCbG9jaywgY29tcGlsZUJsb2NrU3luYyk7XG4gIH1cblxuICBzdGF0aWMgZ2V0SW5wdXRNaW1lVHlwZXMoKSB7XG4gICAgcmV0dXJuIGlucHV0TWltZVR5cGVzO1xuICB9XG5cbiAgc3RhdGljIGdldE91dHB1dE1pbWVUeXBlKCkge1xuICAgIHJldHVybiAndGV4dC9odG1sJztcbiAgfVxuXG4gIGFzeW5jIHNob3VsZENvbXBpbGVGaWxlKGZpbGVOYW1lLCBjb21waWxlckNvbnRleHQpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGFzeW5jIGRldGVybWluZURlcGVuZGVudEZpbGVzKHNvdXJjZUNvZGUsIGZpbGVQYXRoLCBjb21waWxlckNvbnRleHQpIHtcbiAgICByZXR1cm4gW107XG4gIH1cblxuICBhc3luYyBlYWNoKG5vZGVzLCBzZWxlY3Rvcikge1xuICAgIGxldCBhY2MgPSBbXTtcbiAgICBub2Rlcy5lYWNoKChpLCBlbCkgPT4ge1xuICAgICAgbGV0IHByb21pc2UgPSBzZWxlY3RvcihpLGVsKTtcbiAgICAgIGlmICghcHJvbWlzZSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICBhY2MucHVzaChwcm9taXNlKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0pO1xuXG4gICAgYXdhaXQgUHJvbWlzZS5hbGwoYWNjKTtcbiAgfVxuXG4gIGVhY2hTeW5jKG5vZGVzLCBzZWxlY3Rvcikge1xuICAgIC8vIE5COiBUaGlzIG1ldGhvZCBpcyBoZXJlIGp1c3Qgc28gaXQncyBlYXNpZXIgdG8gbWVjaGFuaWNhbGx5XG4gICAgLy8gdHJhbnNsYXRlIHRoZSBhc3luYyBjb21waWxlIHRvIGNvbXBpbGVTeW5jXG4gICAgcmV0dXJuIG5vZGVzLmVhY2goKGksZWwpID0+IHtcbiAgICAgIHNlbGVjdG9yKGksZWwpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSk7XG4gIH1cblxuICBhc3luYyBjb21waWxlKHNvdXJjZUNvZGUsIGZpbGVQYXRoLCBjb21waWxlckNvbnRleHQpIHtcbiAgICBjaGVlcmlvID0gY2hlZXJpbyB8fCByZXF1aXJlKCdjaGVlcmlvJyk7XG4gICAgXG4gICAgLy9MZWF2ZSB0aGUgYXR0cmlidXRlcyBjYXNpbmcgYXMgaXQgaXMsIGJlY2F1c2Ugb2YgQW5ndWxhciAyIGFuZCBtYXliZSBvdGhlciBjYXNlLXNlbnNpdGl2ZSBmcmFtZXdvcmtzXG4gICAgbGV0ICQgPSBjaGVlcmlvLmxvYWQoc291cmNlQ29kZSwge2xvd2VyQ2FzZUF0dHJpYnV0ZU5hbWVzOiBmYWxzZX0pO1xuICAgIGxldCB0b1dhaXQgPSBbXTtcblxuICAgIGxldCB0aGF0ID0gdGhpcztcbiAgICBsZXQgc3R5bGVDb3VudCA9IDA7XG4gICAgdG9XYWl0LnB1c2godGhpcy5lYWNoKCQoJ3N0eWxlJyksIGFzeW5jIChpLCBlbCkgPT4ge1xuICAgICAgbGV0IG1pbWVUeXBlID0gJChlbCkuYXR0cigndHlwZScpIHx8ICd0ZXh0L3BsYWluJztcblxuICAgICAgbGV0IHRoaXNDdHggPSBPYmplY3QuYXNzaWduKHtcbiAgICAgICAgY291bnQ6IHN0eWxlQ291bnQrKyxcbiAgICAgICAgdGFnOiAnc3R5bGUnXG4gICAgICB9LCBjb21waWxlckNvbnRleHQpO1xuXG4gICAgICBsZXQgb3JpZ1RleHQgPSAkKGVsKS50ZXh0KCk7XG4gICAgICBsZXQgbmV3VGV4dCA9IGF3YWl0IHRoYXQuY29tcGlsZUJsb2NrKG9yaWdUZXh0LCBmaWxlUGF0aCwgbWltZVR5cGUsIHRoaXNDdHgpO1xuXG4gICAgICBpZiAob3JpZ1RleHQgIT09IG5ld1RleHQpIHtcbiAgICAgICAgJChlbCkudGV4dChuZXdUZXh0KTtcbiAgICAgICAgJChlbCkuYXR0cigndHlwZScsICd0ZXh0L2NzcycpO1xuICAgICAgfVxuICAgIH0pKTtcblxuICAgIGxldCBzY3JpcHRDb3VudCA9IDA7XG4gICAgdG9XYWl0LnB1c2godGhpcy5lYWNoKCQoJ3NjcmlwdCcpLCBhc3luYyAoaSwgZWwpID0+IHtcbiAgICAgIGxldCBzcmMgPSAkKGVsKS5hdHRyKCdzcmMnKTtcbiAgICAgIGlmIChzcmMgJiYgc3JjLmxlbmd0aCA+IDIpIHtcbiAgICAgICAgJChlbCkuYXR0cignc3JjJywgSW5saW5lSHRtbENvbXBpbGVyLmZpeHVwUmVsYXRpdmVVcmwoc3JjKSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgbGV0IHRoaXNDdHggPSBPYmplY3QuYXNzaWduKHtcbiAgICAgICAgY291bnQ6IHNjcmlwdENvdW50KyssXG4gICAgICAgIHRhZzogJ3NjcmlwdCdcbiAgICAgIH0sIGNvbXBpbGVyQ29udGV4dCk7XG5cbiAgICAgIGxldCBtaW1lVHlwZSA9ICQoZWwpLmF0dHIoJ3R5cGUnKSB8fCAnYXBwbGljYXRpb24vamF2YXNjcmlwdCc7XG4gICAgICBsZXQgb3JpZ1RleHQgPSAkKGVsKS50ZXh0KCk7XG4gICAgICBsZXQgbmV3VGV4dCA9IGF3YWl0IHRoYXQuY29tcGlsZUJsb2NrKG9yaWdUZXh0LCBmaWxlUGF0aCwgbWltZVR5cGUsIHRoaXNDdHgpO1xuXG4gICAgICBpZiAob3JpZ1RleHQgIT09IG5ld1RleHQpIHtcbiAgICAgICAgJChlbCkudGV4dChuZXdUZXh0KTtcbiAgICAgICAgJChlbCkuYXR0cigndHlwZScsICdhcHBsaWNhdGlvbi9qYXZhc2NyaXB0Jyk7XG4gICAgICB9XG4gICAgfSkpO1xuXG4gICAgJCgnbGluaycpLm1hcCgoaSwgZWwpID0+IHtcbiAgICAgIGxldCBocmVmID0gJChlbCkuYXR0cignaHJlZicpO1xuICAgICAgaWYgKGhyZWYgJiYgaHJlZi5sZW5ndGggPiAyKSB7ICQoZWwpLmF0dHIoJ2hyZWYnLCBJbmxpbmVIdG1sQ29tcGlsZXIuZml4dXBSZWxhdGl2ZVVybChocmVmKSk7IH1cblxuICAgICAgLy8gTkI6IEluIHJlY2VudCB2ZXJzaW9ucyBvZiBDaHJvbWl1bSwgdGhlIGxpbmsgdHlwZSBNVVNUIGJlIHRleHQvY3NzIG9yXG4gICAgICAvLyBpdCB3aWxsIGJlIGZsYXQtb3V0IGlnbm9yZWQuIEFsc28gSSBoYXRlIG15c2VsZiBmb3IgaGFyZGNvZGluZyB0aGVzZS5cbiAgICAgIGxldCB0eXBlID0gJChlbCkuYXR0cigndHlwZScpO1xuICAgICAgaWYgKHR5cGUgPT09ICd0ZXh0L2xlc3MnIHx8IHR5cGUgPT09ICd0ZXh0L3N0eWx1cycpICQoZWwpLmF0dHIoJ3R5cGUnLCAndGV4dC9jc3MnKTtcbiAgICB9KTtcblxuICAgICQoJ3gtcmVxdWlyZScpLm1hcCgoaSwgZWwpID0+IHtcbiAgICAgIGxldCBzcmMgPSAkKGVsKS5hdHRyKCdzcmMnKTtcblxuICAgICAgLy8gRmlsZSBVUkw/IEJhaWxcbiAgICAgIGlmIChzcmMubWF0Y2goL15maWxlOi9pKSkgcmV0dXJuO1xuXG4gICAgICAvLyBBYnNvbHV0ZSBwYXRoPyBCYWlsLlxuICAgICAgaWYgKHNyYy5tYXRjaCgvXihbXFwvXXxbQS1aYS16XTopL2kpKSByZXR1cm47XG5cbiAgICAgIHRyeSB7XG4gICAgICAgICQoZWwpLmF0dHIoJ3NyYycsIHBhdGgucmVzb2x2ZShwYXRoLmRpcm5hbWUoZmlsZVBhdGgpLCBzcmMpKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgJChlbCkudGV4dChgJHtlLm1lc3NhZ2V9XFxuJHtlLnN0YWNrfWApO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgYXdhaXQgUHJvbWlzZS5hbGwodG9XYWl0KTtcblxuICAgIHJldHVybiB7XG4gICAgICBjb2RlOiAkLmh0bWwoKSxcbiAgICAgIG1pbWVUeXBlOiAndGV4dC9odG1sJ1xuICAgIH07XG4gIH1cblxuICBzaG91bGRDb21waWxlRmlsZVN5bmMoZmlsZU5hbWUsIGNvbXBpbGVyQ29udGV4dCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgZGV0ZXJtaW5lRGVwZW5kZW50RmlsZXNTeW5jKHNvdXJjZUNvZGUsIGZpbGVQYXRoLCBjb21waWxlckNvbnRleHQpIHtcbiAgICByZXR1cm4gW107XG4gIH1cblxuICBjb21waWxlU3luYyhzb3VyY2VDb2RlLCBmaWxlUGF0aCwgY29tcGlsZXJDb250ZXh0KSB7XG4gICAgY2hlZXJpbyA9IGNoZWVyaW8gfHwgcmVxdWlyZSgnY2hlZXJpbycpO1xuICAgIFxuICAgIC8vTGVhdmUgdGhlIGF0dHJpYnV0ZXMgY2FzaW5nIGFzIGl0IGlzLCBiZWNhdXNlIG9mIEFuZ3VsYXIgMiBhbmQgbWF5YmUgb3RoZXIgY2FzZS1zZW5zaXRpdmUgZnJhbWV3b3Jrc1xuICAgIGxldCAkID0gY2hlZXJpby5sb2FkKHNvdXJjZUNvZGUsIHtsb3dlckNhc2VBdHRyaWJ1dGVOYW1lczogZmFsc2V9KTtcblxuICAgIGxldCB0aGF0ID0gdGhpcztcbiAgICBsZXQgc3R5bGVDb3VudCA9IDA7XG4gICAgdGhpcy5lYWNoU3luYygkKCdzdHlsZScpLCBhc3luYyAoaSwgZWwpID0+IHtcbiAgICAgIGxldCBtaW1lVHlwZSA9ICQoZWwpLmF0dHIoJ3R5cGUnKTtcblxuICAgICAgbGV0IHRoaXNDdHggPSBPYmplY3QuYXNzaWduKHtcbiAgICAgICAgY291bnQ6IHN0eWxlQ291bnQrKyxcbiAgICAgICAgdGFnOiAnc3R5bGUnXG4gICAgICB9LCBjb21waWxlckNvbnRleHQpO1xuXG4gICAgICBsZXQgb3JpZ1RleHQgPSAkKGVsKS50ZXh0KCk7XG4gICAgICBsZXQgbmV3VGV4dCA9IHRoYXQuY29tcGlsZUJsb2NrU3luYyhvcmlnVGV4dCwgZmlsZVBhdGgsIG1pbWVUeXBlLCB0aGlzQ3R4KTtcblxuICAgICAgaWYgKG9yaWdUZXh0ICE9PSBuZXdUZXh0KSB7XG4gICAgICAgICQoZWwpLnRleHQobmV3VGV4dCk7XG4gICAgICAgICQoZWwpLmF0dHIoJ3R5cGUnLCAndGV4dC9jc3MnKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGxldCBzY3JpcHRDb3VudCA9IDA7XG4gICAgdGhpcy5lYWNoU3luYygkKCdzY3JpcHQnKSwgYXN5bmMgKGksIGVsKSA9PiB7XG4gICAgICBsZXQgc3JjID0gJChlbCkuYXR0cignc3JjJyk7XG4gICAgICBpZiAoc3JjICYmIHNyYy5sZW5ndGggPiAyKSB7XG4gICAgICAgICQoZWwpLmF0dHIoJ3NyYycsIElubGluZUh0bWxDb21waWxlci5maXh1cFJlbGF0aXZlVXJsKHNyYykpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGxldCB0aGlzQ3R4ID0gT2JqZWN0LmFzc2lnbih7XG4gICAgICAgIGNvdW50OiBzY3JpcHRDb3VudCsrLFxuICAgICAgICB0YWc6ICdzY3JpcHQnXG4gICAgICB9LCBjb21waWxlckNvbnRleHQpO1xuXG4gICAgICBsZXQgbWltZVR5cGUgPSAkKGVsKS5hdHRyKCd0eXBlJyk7XG5cbiAgICAgIGxldCBvbGRUZXh0ID0gJChlbCkudGV4dCgpO1xuICAgICAgbGV0IG5ld1RleHQgPSB0aGF0LmNvbXBpbGVCbG9ja1N5bmMob2xkVGV4dCwgZmlsZVBhdGgsIG1pbWVUeXBlLCB0aGlzQ3R4KTtcblxuICAgICAgaWYgKG9sZFRleHQgIT09IG5ld1RleHQpIHtcbiAgICAgICAgJChlbCkudGV4dChuZXdUZXh0KTtcbiAgICAgICAgJChlbCkuYXR0cigndHlwZScsICdhcHBsaWNhdGlvbi9qYXZhc2NyaXB0Jyk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAkKCdsaW5rJykubWFwKChpLCBlbCkgPT4ge1xuICAgICAgbGV0IGhyZWYgPSAkKGVsKS5hdHRyKCdocmVmJyk7XG4gICAgICBpZiAoaHJlZiAmJiBocmVmLmxlbmd0aCA+IDIpIHsgJChlbCkuYXR0cignaHJlZicsIElubGluZUh0bWxDb21waWxlci5maXh1cFJlbGF0aXZlVXJsKGhyZWYpKTsgfVxuXG4gICAgICAvLyBOQjogSW4gcmVjZW50IHZlcnNpb25zIG9mIENocm9taXVtLCB0aGUgbGluayB0eXBlIE1VU1QgYmUgdGV4dC9jc3Mgb3JcbiAgICAgIC8vIGl0IHdpbGwgYmUgZmxhdC1vdXQgaWdub3JlZC4gQWxzbyBJIGhhdGUgbXlzZWxmIGZvciBoYXJkY29kaW5nIHRoZXNlLlxuICAgICAgbGV0IHR5cGUgPSAkKGVsKS5hdHRyKCd0eXBlJyk7XG4gICAgICBpZiAodHlwZSA9PT0gJ3RleHQvbGVzcycgfHwgdHlwZSA9PT0gJ3RleHQvc3R5bHVzJykgJChlbCkuYXR0cigndHlwZScsICd0ZXh0L2NzcycpO1xuICAgIH0pO1xuXG4gICAgJCgneC1yZXF1aXJlJykubWFwKChpLCBlbCkgPT4ge1xuICAgICAgbGV0IHNyYyA9ICQoZWwpLmF0dHIoJ3NyYycpO1xuXG4gICAgICAvLyBGaWxlIFVSTD8gQmFpbFxuICAgICAgaWYgKHNyYy5tYXRjaCgvXmZpbGU6L2kpKSByZXR1cm47XG5cbiAgICAgIC8vIEFic29sdXRlIHBhdGg/IEJhaWwuXG4gICAgICBpZiAoc3JjLm1hdGNoKC9eKFtcXC9dfFtBLVphLXpdOikvaSkpIHJldHVybjtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgJChlbCkuYXR0cignc3JjJywgcGF0aC5yZXNvbHZlKHBhdGguZGlybmFtZShmaWxlUGF0aCksIHNyYykpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAkKGVsKS50ZXh0KGAke2UubWVzc2FnZX1cXG4ke2Uuc3RhY2t9YCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgY29kZTogJC5odG1sKCksXG4gICAgICBtaW1lVHlwZTogJ3RleHQvaHRtbCdcbiAgICB9O1xuICB9XG5cbiAgZ2V0Q29tcGlsZXJWZXJzaW9uKCkge1xuICAgIGxldCB0aGlzVmVyc2lvbiA9IHJlcXVpcmUoJy4uLy4uL3BhY2thZ2UuanNvbicpLnZlcnNpb247XG4gICAgbGV0IGNvbXBpbGVycyA9IHRoaXMuYWxsQ29tcGlsZXJzIHx8IFtdO1xuICAgIGxldCBvdGhlclZlcnNpb25zID0gY29tcGlsZXJzLm1hcCgoeCkgPT4geC5nZXRDb21waWxlclZlcnNpb24pLmpvaW4oKTtcblxuICAgIHJldHVybiBgJHt0aGlzVmVyc2lvbn0sJHtvdGhlclZlcnNpb25zfWA7XG4gIH1cblxuICBzdGF0aWMgZml4dXBSZWxhdGl2ZVVybCh1cmwpIHtcbiAgICBpZiAoIXVybC5tYXRjaCgvXlxcL1xcLy8pKSByZXR1cm4gdXJsO1xuICAgIHJldHVybiBgaHR0cHM6JHt1cmx9YDtcbiAgfVxufVxuIl19