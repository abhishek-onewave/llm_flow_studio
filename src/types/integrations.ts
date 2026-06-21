/** Status of an integration connection */
export type IntegrationStatus = "connected" | "disconnected" | "error";

/** Category groupings */
export type IntegrationCategory =
  | "developer_tools"
  | "data"
  | "communication"
  | "cloud"
  | "ai";

/** An available integration */
export interface IntegrationRecord {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: IntegrationCategory;
  iconSlug: string;
  status: IntegrationStatus;
  docsUrl: string;
}

/** A pre-built workflow template */
export interface TemplateRecord {
  id: string;
  name: string;
  description: string;
  category: string;
  nodeCount: number;
  tags: string[];
  /** Serialized workflow definition (nodes + edges) */
  workflowId: string;
  popularity: number;
}
