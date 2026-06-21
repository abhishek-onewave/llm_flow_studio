import { useWorkflowStore } from "../store";
import type { WorkflowNode } from "@/components/workflow/canvas-node";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function resetStore() {
  useWorkflowStore.getState().resetToSampleWorkflow();
}

function makeNode(id: string, label = "Test"): WorkflowNode {
  return {
    id,
    type: "workflow",
    position: { x: 0, y: 0 },
    data: { label, subtitle: "sub", colorKey: "openai", status: "idle" },
  };
}

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

beforeEach(resetStore);

describe("addNode", () => {
  it("adds a node to the state", () => {
    const node = makeNode("test-1", "Added Node");
    useWorkflowStore.getState().addNode(node);
    const found = useWorkflowStore.getState().nodes.find((n) => n.id === "test-1");
    expect(found).toBeDefined();
    expect(found!.data.label).toBe("Added Node");
  });

  it("does not remove existing nodes", () => {
    const before = useWorkflowStore.getState().nodes.length;
    useWorkflowStore.getState().addNode(makeNode("extra"));
    expect(useWorkflowStore.getState().nodes.length).toBe(before + 1);
  });
});

describe("updateNode", () => {
  it("updates node data fields", () => {
    useWorkflowStore.getState().updateNode("n1", { label: "Renamed" });
    const node = useWorkflowStore.getState().nodes.find((n) => n.id === "n1");
    expect(node!.data.label).toBe("Renamed");
  });

  it("preserves other data fields", () => {
    useWorkflowStore.getState().updateNode("n1", { label: "Renamed" });
    const node = useWorkflowStore.getState().nodes.find((n) => n.id === "n1");
    expect(node!.data.colorKey).toBe("file_reader");
  });
});

describe("updateNodeConfig", () => {
  it("merges partial config into existing node data", () => {
    useWorkflowStore.getState().addNode(makeNode("cfg-1"));
    useWorkflowStore.getState().updateNodeConfig("cfg-1", { provider: "anthropic" } as never);
    const node = useWorkflowStore.getState().nodes.find((n) => n.id === "cfg-1");
    const config = (node!.data as Record<string, unknown>).config as Record<string, unknown>;
    expect(config.provider).toBe("anthropic");
  });
});

describe("deleteNode", () => {
  it("removes the node from state", () => {
    useWorkflowStore.getState().deleteNode("n1");
    const found = useWorkflowStore.getState().nodes.find((n) => n.id === "n1");
    expect(found).toBeUndefined();
  });

  it("removes edges connected to the deleted node", () => {
    useWorkflowStore.getState().deleteNode("n2");
    const edges = useWorkflowStore.getState().edges;
    const connected = edges.filter((e) => e.source === "n2" || e.target === "n2");
    expect(connected.length).toBe(0);
  });

  it("clears selectedNodeId if the deleted node was selected", () => {
    useWorkflowStore.getState().selectNode("n1");
    useWorkflowStore.getState().deleteNode("n1");
    expect(useWorkflowStore.getState().selectedNodeId).toBeNull();
  });
});

describe("selectNode", () => {
  it("sets selectedNodeId", () => {
    useWorkflowStore.getState().selectNode("n1");
    expect(useWorkflowStore.getState().selectedNodeId).toBe("n1");
  });

  it("can set to null", () => {
    useWorkflowStore.getState().selectNode(null);
    expect(useWorkflowStore.getState().selectedNodeId).toBeNull();
  });
});

describe("onConnect", () => {
  it("creates an edge between two nodes", () => {
    const before = useWorkflowStore.getState().edges.length;
    useWorkflowStore.getState().onConnect({
      source: "n1",
      target: "n5",
      sourceHandle: null,
      targetHandle: null,
    });
    const edges = useWorkflowStore.getState().edges;
    expect(edges.length).toBe(before + 1);
    const newEdge = edges.find((e) => e.source === "n1" && e.target === "n5");
    expect(newEdge).toBeDefined();
  });
});

describe("setNodeStatus", () => {
  it("updates the status field of a node", () => {
    useWorkflowStore.getState().setNodeStatus("n1", "running");
    const node = useWorkflowStore.getState().nodes.find((n) => n.id === "n1");
    expect(node!.data.status).toBe("running");
  });
});

describe("appendRunEvent", () => {
  it("adds an event to runEvents", () => {
    useWorkflowStore.getState().appendRunEvent({
      id: "evt-1",
      timestamp: "12:00:00",
      nodeId: "n1",
      nodeLabel: "Test",
      type: "started",
      message: "Starting",
    });
    expect(useWorkflowStore.getState().runEvents.length).toBe(1);
    expect(useWorkflowStore.getState().runEvents[0].id).toBe("evt-1");
  });
});

describe("persistence", () => {
  it("round-trips nodes and edges through localStorage", () => {
    useWorkflowStore.getState().addNode(makeNode("persist-1", "Persisted"));
    useWorkflowStore.getState().saveToLocalStorage();

    // Manually reset in-memory state (without clearing localStorage)
    useWorkflowStore.setState({
      nodes: [],
      edges: [],
      selectedNodeId: null,
      runStatus: "idle",
      runEvents: [],
      nodeOutputs: {},
    });
    expect(useWorkflowStore.getState().nodes.find((n) => n.id === "persist-1")).toBeUndefined();

    // Load from storage
    useWorkflowStore.getState().loadFromLocalStorage();
    const found = useWorkflowStore.getState().nodes.find((n) => n.id === "persist-1");
    expect(found).toBeDefined();
    expect(found!.data.label).toBe("Persisted");
  });

  it("loadFromLocalStorage does nothing when storage is empty", () => {
    localStorage.clear();
    const nodesBefore = useWorkflowStore.getState().nodes.length;
    useWorkflowStore.getState().loadFromLocalStorage();
    expect(useWorkflowStore.getState().nodes.length).toBe(nodesBefore);
  });
});

describe("resetToSampleWorkflow", () => {
  it("restores the default 5-node workflow", () => {
    useWorkflowStore.getState().deleteNode("n1");
    useWorkflowStore.getState().deleteNode("n2");
    expect(useWorkflowStore.getState().nodes.length).toBe(3);

    useWorkflowStore.getState().resetToSampleWorkflow();
    expect(useWorkflowStore.getState().nodes.length).toBe(5);
    expect(useWorkflowStore.getState().edges.length).toBe(4);
    expect(useWorkflowStore.getState().runStatus).toBe("idle");
    expect(useWorkflowStore.getState().runEvents.length).toBe(0);
  });
});
