// Pixel UI Plugin for Revenge (Vendetta Classic)
// Does three things:
//   1. Picks a random pixel art background from your repo on every app launch
//   2. Squares off all border-radius in the UI (biggest pixel-feel change)
//   3. Applies image-rendering: pixelated to avatars and images

import { after } from "@vendetta/patcher";
import { findByProps } from "@vendetta/metro";
import { stylesheet } from "@vendetta/metro/common";

// ─── CONFIG ─────────────────────────────────────────────────────────────────
// All raw image URLs from vincentdetamore635-lab/Pixel-Art-Images
const BACKGROUNDS: string[] = [
  "https://raw.githubusercontent.com/vincentdetamore635-lab/Pixel-Art-Images/main/3b5e903bba522c3d5b61af711c9d690d.jpg",
  "https://raw.githubusercontent.com/vincentdetamore635-lab/Pixel-Art-Images/main/05cb1d2dc05a5d5b5e1da8d1d3d00d6e.jpg",
  "https://raw.githubusercontent.com/vincentdetamore635-lab/Pixel-Art-Images/main/9702bc06a56b5e0ba09a6eb4f4d83f96.jpg",
  "https://raw.githubusercontent.com/vincentdetamore635-lab/Pixel-Art-Images/main/b04e72c5f4ae2bfef8c71e1706a27e65.jpg",
];

// Pick once per session, on plugin load
const CHOSEN_BG = BACKGROUNDS[Math.floor(Math.random() * BACKGROUNDS.length)];

// ─── CSS INJECTION ───────────────────────────────────────────────────────────
// Injects a <style> tag into the React Native WebView layer if accessible,
// and patches RN StyleSheet to flatten border-radius on all components.

const STYLE_ID = "pixel-ui-style";

function injectCSS() {
  // Attempt to inject into any WebView-rendered surfaces (embeds, modals)
  try {
    const existing = (globalThis as any).document?.getElementById(STYLE_ID);
    if (existing) return;
    const style = (globalThis as any).document?.createElement("style");
    if (!style) return;
    style.id = STYLE_ID;
    style.textContent = `
      * {
        border-radius: 0 !important;
        image-rendering: pixelated !important;
        image-rendering: crisp-edges !important;
      }
    `;
    (globalThis as any).document?.head?.appendChild(style);
  } catch (_) {
    // WebView document not available — expected in native RN surfaces
  }
}

function removeCSS() {
  try {
    (globalThis as any).document?.getElementById(STYLE_ID)?.remove();
  } catch (_) {}
}

// ─── REACT NATIVE STYLESHEET PATCH ──────────────────────────────────────────
// Patches StyleSheet.create so any styles with borderRadius get zeroed out.
// This covers buttons, cards, avatars, channel pills, message bubbles, etc.

const patches: (() => void)[] = [];

function patchStyleSheet() {
  const RNStyleSheet = findByProps("create", "flatten", "hairlineWidth");
  if (!RNStyleSheet) return;

  const patch = after("create", RNStyleSheet, ([styles], result) => {
    if (!result || typeof result !== "object") return result;
    for (const key of Object.keys(result)) {
      const style = (RNStyleSheet as any).flatten(result[key]);
      if (!style) continue;
      // Zero out all border radius variants
      if (
        style.borderRadius !== undefined ||
        style.borderTopLeftRadius !== undefined ||
        style.borderTopRightRadius !== undefined ||
        style.borderBottomLeftRadius !== undefined ||
        style.borderBottomRightRadius !== undefined
      ) {
        result[key] = {
          ...style,
          borderRadius: 0,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
        };
      }
    }
    return result;
  });

  patches.push(patch);
}

// ─── BACKGROUND PATCH ───────────────────────────────────────────────────────
// Patches the theme's background URL resolver to swap in the random image.
// Targets the @vendetta/ui/assets or theme background module.

function patchBackground() {
  try {
    const themingModule = findByProps("updateTheme", "applyTheme");
    if (!themingModule) return;

    const patch = after("applyTheme", themingModule, ([theme], result) => {
      if (theme?.data?.background) {
        theme.data.background.url = CHOSEN_BG;
      }
      return result;
    });

    patches.push(patch);
  } catch (_) {
    // Module not found — background stays as theme default
  }
}

// ─── IMAGE PIXELATION PATCH ──────────────────────────────────────────────────
// Finds Discord's Image component and injects pixelated style prop

function patchImages() {
  try {
    const ImageModule = findByProps("Image", "ImageBackground");
    if (!ImageModule?.Image) return;

    const patch = after("render", ImageModule.Image.prototype ?? ImageModule.Image, (_, result) => {
      if (!result?.props) return result;
      result.props.style = [
        result.props.style,
        { imageRendering: "pixelated" },
      ];
      return result;
    });

    patches.push(patch);
  } catch (_) {}
}

// ─── ENTRY POINTS ────────────────────────────────────────────────────────────

export default {
  onLoad() {
    injectCSS();
    patchStyleSheet();
    patchBackground();
    patchImages();
  },

  onUnload() {
    removeCSS();
    // Run all collected unpatch functions
    for (const unpatch of patches) {
      try {
        unpatch();
      } catch (_) {}
    }
    patches.length = 0;
  },
};
