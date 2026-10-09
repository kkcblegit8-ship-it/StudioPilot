---
name: roblox-ui
description: Build correct, responsive Roblox UI. Use when creating ScreenGuis, HUDs, menus, or any interface elements.
---

# Roblox UI

## Structure

- UI lives in StarterGui as ScreenGui instances. Set `ResetOnSpawn = false` for HUDs that must survive respawn.
- One ScreenGui per feature (MainMenu, HUD, Shop), not one giant gui. This keeps ResetOnSpawn behavior predictable and code organized.

## Layout

- Use scale for layout: `UDim2.fromScale(0.5, 0.5)` with `AnchorPoint = Vector2.new(0.5, 0.5)` centers on every screen size.
- Reserve offset for fixed-size details (icons, padding). Never lay out whole screens in offset pixels.
- Use UIListLayout, UIGridLayout, UIPadding, and UICorner instead of manual pixel math.
- Set `AutomaticSize` on containers that wrap dynamic content.

## Animation and updates

- Animate with TweenService. Always keep a reference and call `:Cancel()` when the UI is destroyed or superseded.
- Never move UI in a per-frame loop by setting Position directly.
- Update text labels only when the value actually changes; cache the last value.

## Input and safety

- All UI input is untrusted. Buttons that spend currency, buy gamepasses, or change progression must call the server, and the server must re-validate everything.
- Debounce buttons during async operations so double-clicks cannot double-spend.
- Use `Modal` or explicit input capture for dialogs that must block game input.

## Polish checklist

1. Works at 16:9, ultrawide, portrait, and phone aspect ratios.
2. Text never overflows its container at minimum supported size.
3. No per-frame Position updates; tweens cancelled on destroy.
4. Server re-validates every consequential action.
