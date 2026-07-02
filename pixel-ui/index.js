"use strict";
var plugin = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined")
      return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // plugins/pixel-ui/src/index.ts
  var src_exports = {};
  __export(src_exports, {
    default: () => src_default
  });
  var import_patcher = __require("@vendetta/patcher");
  var import_metro = __require("@vendetta/metro");
  var BACKGROUNDS = [
    "https://raw.githubusercontent.com/vincentdetamore635-lab/Pixel-Art-Images/main/3b5e903bba522c3d5b61af711c9d690d.jpg",
    "https://raw.githubusercontent.com/vincentdetamore635-lab/Pixel-Art-Images/main/05cb1d2dc05a5d5b5e1da8d1d3d00d6e.jpg",
    "https://raw.githubusercontent.com/vincentdetamore635-lab/Pixel-Art-Images/main/9702bc06a56b5e0ba09a6eb4f4d83f96.jpg",
    "https://raw.githubusercontent.com/vincentdetamore635-lab/Pixel-Art-Images/main/b04e72c5f4ae2bfef8c71e1706a27e65.jpg"
  ];
  var CHOSEN_BG = BACKGROUNDS[Math.floor(Math.random() * BACKGROUNDS.length)];
  var STYLE_ID = "pixel-ui-style";
  function injectCSS() {
    try {
      const existing = globalThis.document?.getElementById(STYLE_ID);
      if (existing)
        return;
      const style = globalThis.document?.createElement("style");
      if (!style)
        return;
      style.id = STYLE_ID;
      style.textContent = `
      * {
        border-radius: 0 !important;
        image-rendering: pixelated !important;
        image-rendering: crisp-edges !important;
      }
    `;
      globalThis.document?.head?.appendChild(style);
    } catch (_) {
    }
  }
  function removeCSS() {
    try {
      globalThis.document?.getElementById(STYLE_ID)?.remove();
    } catch (_) {
    }
  }
  var patches = [];
  function patchStyleSheet() {
    const RNStyleSheet = (0, import_metro.findByProps)("create", "flatten", "hairlineWidth");
    if (!RNStyleSheet)
      return;
    const patch = (0, import_patcher.after)("create", RNStyleSheet, ([styles], result) => {
      if (!result || typeof result !== "object")
        return result;
      for (const key of Object.keys(result)) {
        const style = RNStyleSheet.flatten(result[key]);
        if (!style)
          continue;
        if (style.borderRadius !== void 0 || style.borderTopLeftRadius !== void 0 || style.borderTopRightRadius !== void 0 || style.borderBottomLeftRadius !== void 0 || style.borderBottomRightRadius !== void 0) {
          result[key] = {
            ...style,
            borderRadius: 0,
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0
          };
        }
      }
      return result;
    });
    patches.push(patch);
  }
  function patchBackground() {
    try {
      const themingModule = (0, import_metro.findByProps)("updateTheme", "applyTheme");
      if (!themingModule)
        return;
      const patch = (0, import_patcher.after)("applyTheme", themingModule, ([theme], result) => {
        if (theme?.data?.background) {
          theme.data.background.url = CHOSEN_BG;
        }
        return result;
      });
      patches.push(patch);
    } catch (_) {
    }
  }
  function patchImages() {
    try {
      const ImageModule = (0, import_metro.findByProps)("Image", "ImageBackground");
      if (!ImageModule?.Image)
        return;
      const patch = (0, import_patcher.after)("render", ImageModule.Image.prototype ?? ImageModule.Image, (_, result) => {
        if (!result?.props)
          return result;
        result.props.style = [
          result.props.style,
          { imageRendering: "pixelated" }
        ];
        return result;
      });
      patches.push(patch);
    } catch (_) {
    }
  }
  var src_default = {
    onLoad() {
      injectCSS();
      patchStyleSheet();
      patchBackground();
      patchImages();
    },
    onUnload() {
      removeCSS();
      for (const unpatch of patches) {
        try {
          unpatch();
        } catch (_) {
        }
      }
      patches.length = 0;
    }
  };
  return __toCommonJS(src_exports);
})();
var _pluginExports = plugin.default ?? plugin; module$1 && (module$1.exports = _pluginExports);
