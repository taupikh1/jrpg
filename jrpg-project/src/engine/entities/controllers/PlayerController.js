/**
 * Maps Input system → MovementComponent. No DOM handlers.
 */
export class PlayerController {
  /**
   * @param {object} opts
   * @param {import('../../input/Input.js').Input} opts.input
   * @param {import('../Entity.js').Entity} opts.entity
   * @param {string} [opts.interactKey='KeyE']
   */
  constructor({ input, entity, interactKey = 'KeyE' }) {
    this.input = input;
    this.entity = entity;
    this.interactKey = interactKey;
    this._interactPressed = false;
  }

  /**
   * Call each frame before/with entity update.
   */
  update() {
    const input = this.input;
    const mov = this.entity.get('movement');
    if (!mov) return;

    let dx = 0;
    let dy = 0;
    if (input.isDown('ArrowLeft') || input.isDown('KeyA')) dx -= 1;
    if (input.isDown('ArrowRight') || input.isDown('KeyD')) dx += 1;
    if (input.isDown('ArrowUp') || input.isDown('KeyW')) dy -= 1;
    if (input.isDown('ArrowDown') || input.isDown('KeyS')) dy += 1;
    mov.setDirection(dx, dy);

    this._interactPressed = input.justPressed(this.interactKey);
  }

  get interactPressed() {
    return this._interactPressed;
  }
}
