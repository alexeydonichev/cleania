import test from "node:test";
import assert from "node:assert/strict";
import { focusVisible, reducedMotion, scrollToContent, subscribeMotionPreference, motionPreferenceEvent, motionPreferenceKey } from "../lib/motion.ts";

function browserFixture(t, { reduced = false, osReduced = false, headerHeight = 72, actionHeight = 100, actionPosition = "fixed", actionVisibility = "visible" } = {}) {
  const scrolls = [];
  const listeners = new Map();
  const mediaListeners = new Set();
  const storage = new Map();
  const root = { dataset: { motion: reduced ? "reduced" : "full" } };
  const action = { getBoundingClientRect: () => ({ height: actionHeight }) };
  const replacements = {
    window: {
      innerHeight: 800, scrollY: 500,
      scrollTo: value => scrolls.push(value),
      requestAnimationFrame: callback => callback(),
      matchMedia: () => ({ matches: osReduced, addEventListener: (_, callback) => mediaListeners.add(callback), removeEventListener: (_, callback) => mediaListeners.delete(callback) }),
      addEventListener: (type, callback) => listeners.set(type, callback),
      removeEventListener: type => listeners.delete(type),
      localStorage: { getItem: key => storage.get(key) ?? null },
    },
    document: { documentElement: root, querySelector: selector => selector === ".site-header" ? { getBoundingClientRect: () => ({ height: headerHeight }) } : action },
    getComputedStyle: () => ({ position: actionPosition, visibility: actionVisibility }),
  };
  for (const [key, value] of Object.entries(replacements)) {
    const old = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
    t.after(() => { if (old) Object.defineProperty(globalThis, key, old); else delete globalThis[key]; });
  }
  function field(top, height = 80) {
    const focused = [];
    const node = { focus: options => focused.push(options), closest: () => null, getBoundingClientRect: () => ({ top, bottom: top + height, height }) };
    return { node, focused };
  }
  return { root, scrolls, field, listeners, mediaListeners, storage };
}

test("server rendering never starts decorative motion", () => {
  assert.equal(typeof window, "undefined");
  assert.equal(reducedMotion(), true);
});
test("calculator content already in the reading band stays still", t => {
  const { scrolls, field } = browserFixture(t);
  scrollToContent(field(120).node);
  assert.deepEqual(scrolls, []);
});
test("step scroll accounts for sticky header once, without doubled CSS offsets", t => {
  const { scrolls, field } = browserFixture(t);
  scrollToContent(field(350).node);
  assert.deepEqual(scrolls, [{ top: 754, behavior: "smooth" }]);
});
test("manual reduced motion makes programmatic scrolling instant", t => {
  const { scrolls, field } = browserFixture(t, { reduced: true });
  scrollToContent(field(350).node);
  assert.equal(scrolls[0].behavior, "instant");
});
test("system reduced motion overrides the full-motion site preference", t => {
  browserFixture(t, { osReduced: true });
  assert.equal(reducedMotion(), true);
});
test("validation focuses a visible field without moving the page", t => {
  const { scrolls, field } = browserFixture(t);
  const target = field(150);
  focusVisible(target.node);
  assert.deepEqual(target.focused, [{ preventScroll: true }]);
  assert.deepEqual(scrolls, []);
});
test("validation reveals a field otherwise covered by the mobile action bar", t => {
  const { scrolls, field } = browserFixture(t);
  focusVisible(field(650).node);
  assert.deepEqual(scrolls, [{ top: 809, behavior: "smooth" }]);
});
test("a non-fixed desktop action does not reduce the usable viewport", t => {
  const { scrolls, field } = browserFixture(t, { actionPosition: "static" });
  focusVisible(field(650).node);
  assert.deepEqual(scrolls, []);
});
test("preference subscription syncs other tabs and cleans up all listeners", t => {
  const { root, listeners, mediaListeners, storage } = browserFixture(t);
  let calls = 0;
  const unsubscribe = subscribeMotionPreference(() => calls++);
  listeners.get(motionPreferenceEvent)();
  storage.set(motionPreferenceKey, "true");
  listeners.get("storage")({ key: "unrelated" });
  assert.equal(calls, 1);
  listeners.get("storage")({ key: motionPreferenceKey });
  assert.equal(root.dataset.motion, "reduced");
  assert.equal(calls, 2);
  unsubscribe();
  assert.equal(listeners.size, 0);
  assert.equal(mediaListeners.size, 0);
});
