Here’s a high‑level plan (in Markdown) for evolving your `ScrollArea` into a fully‑synchronized, rubber‑band‑style component using Framer Motion:

```markdown
# Over‑Scroll Rubber‑Band Strategy for `ScrollArea`

## 1. Disable Native Bounce
- **CSS**
  ```css
  .viewport {
    overscroll-behavior: contain;   /* or `none` */
  }
  ```
- Prevents the browser’s default scroll‑rubber, so we can substitute our own.

---

## 2. Wrap Your Content in a Motion Container
- Inside your Radix `<Viewport>`:
  ```tsx
  <motion.div
    ref={viewportRef}
    className="viewport"
    style={{ y: motionY, x: motionX }}
    drag="y"              // or both axes if `orientation === 'both'`
    dragConstraints={{ top: 0, bottom: scrollMaxY }}
    dragElastic={0}       // disable built-in elastic so we control it
    onDrag={(e, info) => handleDrag(info.point.y)}
    onDragEnd={() => handleRelease()}
  >
    {children}
  </motion.div>
  ```

---

## 3. Track & Compute “Overscroll Delta”
- **During Drag (`onDrag`)**
  1. Read `info.point.y` (or `.x`)
  2. Compare against `[0, scrollMax]` bounds
  3. Compute raw overshoot:
     ```ts
     const rawDelta = info.point.y - clamp(info.point.y, 0, scrollMaxY);
     ```
- **Soft‑Clip with a Spring Function**
  ```ts
  const rubberDelta = Math.sign(rawDelta) *
    maxPull * (1 - Math.exp(-Math.abs(rawDelta) / softening));
  ```
- **Drive a MotionValue**
  ```ts
  motionY.set(rubberDelta + nativeScrollOffset);
  ```

---

## 4. Snap‑Back with Framer Motion
- **On Release (`onDragEnd`)**
  ```ts
  motionY.start({
    to: nativeScrollOffset,
    type: 'spring',
    stiffness: 300,
    damping: 30
  });
  ```
- This restores the wrapper to the true scroll offset.

---

## 5. Mirror Across Two Viewports
- **Lift State Up**
  Create a custom hook, e.g. `useRubberScrollSync()`, which returns:
  ```ts
  {
    motionX: MotionValue<number>,
    motionY: MotionValue<number>,
    handleDrag: (pos: { x: number, y: number }) => void,
    handleRelease: () => void,
  }
  ```
- **Consume in Both Components**
  ```tsx
  const { motionY, handleDrag, handleRelease } = useRubberScrollSync();

  <ScrollAreaInner
    /* …props… */
    renderViewport={(ref) => (
      <motion.div
        ref={ref}
        drag="y"
        onDrag={(_, info) => handleDrag({ y: info.point.y })}
        onDragEnd={handleRelease}
        style={{ y: motionY }}
      >
        {children}
      </motion.div>
    )}
  />
  ```

---

## 6. Performance & Edge‑Cases
- **Passive vs. Active Listeners**
  - Use `{ passive: true }` for normal scroll.
  - Switch to `{ passive: false }` only when you detect over‑drag and must `preventDefault()`.
- **Throttle DOM Reads**
  Use `requestAnimationFrame` internally if you ever read `scrollTop` in your drag handler.
- **Touch → Pointer**
  Consider pointer events for broader device support.

---

## 7. Next Steps
1. Sketch out `useRubberScrollSync()` with Framer Motion’s `useMotionValue` + `.onChange()`.
2. Replace the Radix `<Viewport>` direct scroll with your motion wrapper in `<InnerScrollArea>`.
3. Wire up controlled vs. uncontrolled props as before—just shift all transforms into the motion layer.
4. Test on trackpad, mobile, and in your dual‑pane sync setup.

---
