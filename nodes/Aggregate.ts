import Schema from "../core/Schema";
import { Node, MapAggregateNode } from "../core/Node";
import Payload from "../core/Payload";

type AggregateProps = {
  target: string;
  operation: "count" | "average" | "sum";
};

@MapAggregateNode("Aggregate", "Perform an aggregation operation")
export default class Aggregate extends Node<AggregateProps> {
  async process(input: Payload[]): Promise<Payload[]> {
    switch (this.params.operation) {
      case "count":
        return this.countPayloads(input);

      case "sum":
        return this.sumPayloads(input);
    }
  }

  countPayloads(input: Payload[]): Payload[] {
    let length = input.length;
    if (this.params.target) {
      length = input.filter((payload) =>
        payload.hasOwnProperty(this.params.target)
      ).length;
    }
    return [
      {
        contentType: "count",
        contentValue: length,
      },
    ];
  }

  sumPayloads(input: Payload[]): Payload[] {
    const sum = input.reduce(
      (acc, payload) =>
        acc + (payload[this.params.target ?? "contentValue"] ?? 0),
      0
    );
    return [
      {
        contentType: "sum",
        contentValue: sum,
      },
    ];
  }

  getSchema(): Schema<AggregateProps> {
    return {
      target: {
        description: "The target field on each payload to aggregate from",
      },
      operation: {
        description: "The aggregation operation to perform",
        defaultValue: "count",
      },
    };
  }
}
