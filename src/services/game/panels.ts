/** Keep HUD drawers mutually exclusive, including browsers without details[name]. */
export function toggleGamePanel(panel: HTMLDetailsElement) {
  if (!panel.open) return;
  panel
    .closest(".game-viewport")
    ?.querySelectorAll<HTMLDetailsElement>("details.game-panel[open]")
    .forEach((other) => {
      if (other !== panel) other.open = false;
    });
  // Opening a drawer must release a held joystick/run button immediately.
  window.dispatchEvent(new Event("nyrava-input-reset"));
}
