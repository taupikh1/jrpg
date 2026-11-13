/**
 * Data-driven dialogue state machine.
 */

/**
 * @typedef {Object} DialogueChoice
 * @property {string} text
 * @property {string} next
 * @property {object} [effects]
 */

/**
 * @typedef {Object} DialogueNode
 * @property {string} [speaker]
 * @property {string} text
 * @property {string} [next]
 * @property {object} [effects] applied once when advancing past a choiceless node
 * @property {DialogueChoice[]} [choices]
 */

/**
 * @typedef {Object} DialogueDef
 * @property {string} id
 * @property {string} startNode
 * @property {Record<string, DialogueNode>} nodes
 */

export class DialogueEngine {
  /**
   * @param {import('../../../core/EventBus.js').EventBus} [events]
   */
  constructor(events = null) {
    this.events = events;
    /** @type {Map<string, DialogueDef>} */
    this._defs = new Map();
    /** @type {DialogueDef|null} */
    this.active = null;
    /** @type {string|null} */
    this.nodeId = null;
    this.finished = false;
  }

  /**
   * @param {DialogueDef} def
   */
  register(def) {
    if (!def?.id || !def.startNode || !def.nodes) {
      throw new Error('Dialogue requires id, startNode, nodes');
    }
    if (!def.nodes[def.startNode]) {
      throw new Error(`Dialogue "${def.id}": missing startNode "${def.startNode}"`);
    }
    if (this._defs.has(def.id)) throw new Error(`Duplicate dialogue "${def.id}"`);
    this._defs.set(def.id, def);
  }

  get(id) {
    return this._defs.get(id) ?? null;
  }

  /**
   * @param {string} dialogueId
   */
  start(dialogueId) {
    const def = this._defs.get(dialogueId);
    if (!def) throw new Error(`Unknown dialogue "${dialogueId}"`);
    this.active = def;
    this.nodeId = def.startNode;
    this.finished = false;
    if (this.events) this.events.emit('dialogue.started', { id: dialogueId });
    return this.currentNode();
  }

  currentNode() {
    if (!this.active || !this.nodeId) return null;
    return this.active.nodes[this.nodeId] ?? null;
  }

  /**
   * Advance linear dialogue (no choices).
   * @returns {'advanced'|'ended'|'choices'|null}
   */
  advance() {
    const node = this.currentNode();
    if (!node || this.finished) return null;
    if (node.choices?.length) return 'choices';
    // Node effects (no choices) apply once, when the player advances past the node.
    // Escape/end() never emits them, so interrupted dialogue grants nothing.
    if (node.effects && this.events) {
      this.events.emit('dialogue.node_effects', {
        dialogueId: this.active.id,
        nodeId: this.nodeId,
        effects: node.effects,
      });
    }
    if (node.next) {
      if (!this.active.nodes[node.next]) {
        this.end();
        return 'ended';
      }
      this.nodeId = node.next;
      return 'advanced';
    }
    this.end();
    return 'ended';
  }

  /**
   * @param {number} index
   */
  choose(index) {
    const node = this.currentNode();
    if (!node?.choices || index < 0 || index >= node.choices.length) {
      return { ok: false, reason: 'invalid_choice' };
    }
    const choice = node.choices[index];
    if (this.events) {
      this.events.emit('dialogue.choice_selected', {
        dialogueId: this.active.id,
        nodeId: this.nodeId,
        index,
        effects: choice.effects || null,
      });
    }
    if (!choice.next || !this.active.nodes[choice.next]) {
      this.end();
      return { ok: true, ended: true, effects: choice.effects };
    }
    this.nodeId = choice.next;
    return { ok: true, ended: false, effects: choice.effects };
  }

  end() {
    const id = this.active?.id;
    this.active = null;
    this.nodeId = null;
    this.finished = true;
    if (id && this.events) this.events.emit('dialogue.completed', { id });
  }

  get isActive() {
    return !!this.active && !this.finished;
  }
}
