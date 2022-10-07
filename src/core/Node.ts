import Payload from "./Payload";
import Schema from "./Schema";

export type NodeProps = Record<string, unknown>;

/**
 * A node represents a single function in a map-aggregate manifest
 */
export default abstract class Node<P extends NodeProps> {
  constructor(protected readonly params: P) {
    const entries: [keyof P, unknown][] = Object.entries(params);
    for (const [key, val] of entries) {
      if (val == null) {
        this.params[key] = this.getSchema()[key].defaultValue;
      }
    }
  }

  /**
   * Process a set of `input`, as described by the node's `inputs`
   * to a set of outputs, as described by the node's `output`s.
   * If `params` is specified, it overrides the construction-time parameters
   * for this local invocation
   */
  abstract process(input: Payload[], params?: Partial<P>): Promise<Payload[]>;

  /**
   * Return the schema associated with this node
   */
  abstract getSchema(): Schema<Required<P>>;

  /**
   * Returns the local params for an invocation
   * This returns a parameter object of type `P` with the
   * construction-time parameters replaced with the parameters
   * specified in `params`
   */
  protected getLocalParams(params?: Partial<P>): P {
    const localParams = this.params;
    const entries = Object.entries(params ?? {}) as [keyof P, P[keyof P]][];
    for (const [key, val] of entries) {
      localParams[key] = val;
    }
    return localParams;
  }

  /**
   * Returns true if this node has the specified property and false otherwise
   */
  hasProperty(property: string): boolean {
    return this.getSchema().hasOwnProperty(property);
  }

  /**
   * Return a string representation of this node
   */
  toString(): string {
    const nodeType = Object.getPrototypeOf(this).name;
    return `Node{type: "${nodeType}", params: ${this.params}}`;
  }

  /**
   * Returns the type of this node, if it was registered
   * with the @MapAggregateNode annotation
   */
  getType(): string {
    const nodeType = Object.getPrototypeOf(this).name;
    return nodeType;
  }

  /**
   * Returns the descriptions for this node type, if it was registered
   * with the @MapAggregateNode annotation
   */
  getDescription(): string {
    const description = Object.getPrototypeOf(this).description;
    return description;
  }
}
