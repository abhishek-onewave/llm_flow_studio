import { topoSort, getDownstream, runWorkflow, runSingleNode, stopRun, pauseRun, resumeRun } from "../mock-runner";
import { useWorkflowStore } from "../store";
import type { WorkflowNode } from "@/components/workflow/canvas-node";
import type { Edge } from "@xyflow/react";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function resetStore() {
  useWorkflowStore.getState().resetToSampleWorkflow();
}

function makeNodes(...ids: string[]): WorkflowNode[] {
  return ids.map((id, i) => ({
    id,
    type: "workflow" as const,
    position: { x: 0, y: i * 100 },
    data: { label: `Node ${id}`, subtitle: "test", colorKey: "openai", status: "idle" as const },
  }));
}

function makeEdges(...pairs: [string, string][]): Edge[] {
  return pairs.map(([source, target]) => ({
    id: `e-${source}-${target}`,
    source,
    target,
  }));
}

/* ------------------------------------------------------------------ */
/*  topoSort                                                           */
/* ------------------------------------------------------------------ */

describe("topoSort", () => {
  it("returns correct order for a linear chain", () => {
    const nodes = makeNodes("a", "b", "c");
    const edges = makeEdges(["a", "b"], ["b", "c"]);
    const order = topoSort(nodes, edges);
    expect(order).toEqual(["a", "b", "c"]);
  });

  it("returns correct order for a diamond graph", () => {
    // a -> b, a -> c, b -> d, c -> d
    const nodes = makeNodes("a", "b", "c", "d");
    const edges = makeEdges(["a", "b"], ["a", "c"], ["b", "d"], ["c", "d"]);
    const order = topoSort(nodes, edges);

    expect(order.indexOf("a")).toBeLessThan(order.indexOf("b"));
    expect(order.indexOf("a")).toBeLessThan(order.indexOf("c"));
    expect(order.indexOf("b")).toBeLessThan(order.indexOf("d"));
    expect(order.indexOf("c")).toBeLessThan(order.indexOf("d"));
    expect(order.length).toBe(4);
  });

  it("returns single node for a graph with one node", () => {
    const nodes = makeNodes("x");
    const order = topoSort(nodes, []);
    expect(order).toEqual(["x"]);
  });

  it("returns all nodes even with no edges", () => {
    const nodes = makeNodes("a", "b", "c");
    const order = topoSort(nodes, []);
    expect(order.length).toBe(3);
    expect(order.sort()).toEqual(["a", "b", "c"]);
  });
});

/* ------------------------------------------------------------------ */
/*  getDownstream                                                      */
/* ------------------------------------------------------------------ */

describe("getDownstream", () => {
  it("returns the start node and all reachable nodes", () => {
    const nodes = makeNodes("a", "b", "c", "d");
    const edges = makeEdges(["a", "b"], ["b", "c"], ["b", "d"]);
    const downstream = getDownstream("b", nodes, edges);
    expect(downstream).toContain("b");
    expect(downstream).toContain("c");
    expect(downstream).toContain("d");
    expect(downstream).not.toContain("a");
  });

  it("returns only the start node if it has no outgoing edges", () => {
    const nodes = makeNodes("a", "b");
    const edges = makeEdges(["a", "b"]);
    const downstream = getDownstream("b", nodes, edges);
    expect(downstream).toEqual(["b"]);
  });

  it("returns nodes in topological order", () => {
    const nodes = makeNodes("a", "b", "c");
    const edges = makeEdges(["a", "b"], ["b", "c"]);
    const downstream = getDownstream("a", nodes, edges);
    expect(downstream.indexOf("a")).toBeLessThan(downstream.indexOf("b"));
    expect(downstream.indexOf("b")).toBeLessThan(downstream.indexOf("c"));
  });
});

/* ------------------------------------------------------------------ */
/*  runWorkflow                                                        */
/* ------------------------------------------------------------------ */

describe("runWorkflow", () => {
  beforeEach(resetStore);

  it("transitions runStatus through idle → running → completed", async () => {
    expect(useWorkflowStore.getState().runStatus).toBe("idle");
    const promise = runWorkflow();
    // Should be running now
    expect(useWorkflowStore.getState().runStatus).toBe("running");
    await promise;
    expect(useWorkflowStore.getState().runStatus).toBe("completed");
  }, 30000);

  it("sets all nodes to completed after run", async () => {
    await runWorkflow();
    const nodes = useWorkflowStore.getState().nodes;
    for (const node of nodes) {
      expect(node.data.status).toBe("completed");
    }
  }, 30000);

  it("populates runEvents during execution", async () => {
    await runWorkflow();
    const events = useWorkflowStore.getState().runEvents;
    expect(events.length).toBeGreaterThan(0);
    // Should have workflow started event
    const startEvent = events.find((e) => e.nodeId === "workflow" && e.type === "started");
    expect(startEvent).toBeDefined();
    // Should have workflow completed event
    const completeEvent = events.find((e) => e.nodeId === "workflow" && e.type === "completed");
    expect(completeEvent).toBeDefined();
  }, 30000);

  it("populates nodeOutputs for each node", async () => {
    await runWorkflow();
    const outputs = useWorkflowStore.getState().nodeOutputs;
    const nodeIds = useWorkflowStore.getState().nodes.map((n) => n.id);
    for (const id of nodeIds) {
      expect(outputs[id]).toBeDefined();
      expect(outputs[id].length).toBeGreaterThan(0);
    }
  }, 30000);
});

/* ------------------------------------------------------------------ */
/*  runSingleNode                                                      */
/* ------------------------------------------------------------------ */

describe("runSingleNode", () => {
  beforeEach(resetStore);

  it("runs one node and sets its status to completed", async () => {
    await runSingleNode("n1");
    const node = useWorkflowStore.getState().nodes.find((n) => n.id === "n1");
    expect(node!.data.status).toBe("completed");
  }, 15000);

  it("returns to idle runStatus after single node run", async () => {
    await runSingleNode("n1");
    expect(useWorkflowStore.getState().runStatus).toBe("idle");
  }, 15000);

  it("does nothing for a non-existent node", async () => {
    await runSingleNode("nonexistent");
    expect(useWorkflowStore.getState().runStatus).toBe("idle");
  });
});

/* ------------------------------------------------------------------ */
/*  stopRun                                                            */
/* ------------------------------------------------------------------ */

describe("stopRun", () => {
  beforeEach(resetStore);

  it("aborts a running workflow", async () => {
    const promise = runWorkflow();
    // Let it start
    await new Promise((r) => setTimeout(r, 50));
    stopRun();
    await promise;
    expect(useWorkflowStore.getState().runStatus).toBe("idle");
  }, 15000);
});

/* ------------------------------------------------------------------ */
/*  pauseRun / resumeRun                                               */
/* ------------------------------------------------------------------ */

describe("pauseRun / resumeRun", () => {
  it("pauseRun changes status from running to queued", () => {
    useWorkflowStore.setState({ runStatus: "running" });
    pauseRun();
    expect(useWorkflowStore.getState().runStatus).toBe("queued");
  });

  it("resumeRun changes status from queued back to running", () => {
    useWorkflowStore.setState({ runStatus: "queued" });
    resumeRun();
    expect(useWorkflowStore.getState().runStatus).toBe("running");
  });

  it("pauseRun does nothing if not running", () => {
    useWorkflowStore.setState({ runStatus: "idle" });
    pauseRun();
    expect(useWorkflowStore.getState().runStatus).toBe("idle");
  });

  it("resumeRun does nothing if not paused", () => {
    useWorkflowStore.setState({ runStatus: "running" });
    resumeRun();
    expect(useWorkflowStore.getState().runStatus).toBe("running");
  });
});
