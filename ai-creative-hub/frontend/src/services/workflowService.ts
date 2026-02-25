import fetchApi from "./api";
import type {
  ApiResponse,
  WorkflowStepRequest,
  WorkflowStepResponse,
} from "@/types/api";

export interface Workflow {
  id: string;
  title: string;
  description?: string;
  steps: WorkflowStep[];
  status: "draft" | "active" | "completed" | "failed";
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowStep {
  id: string;
  type: string;
  name: string;
  config: Record<string, unknown>;
  status: "pending" | "running" | "completed" | "failed";
  output?: Record<string, unknown>;
}

export const workflowService = {
  /**
   * Create a new workflow
   */
  async create(data: { title?: string; description?: string }): Promise<ApiResponse<Workflow>> {
    return fetchApi<Workflow>("/workflow/create", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Get workflow by ID
   */
  async getById(workflowId: string): Promise<ApiResponse<Workflow>> {
    return fetchApi<Workflow>(`/workflow/${workflowId}`);
  },

  /**
   * Execute a workflow step
   */
  async executeStep(workflowId: string, stepData: WorkflowStepRequest): Promise<ApiResponse<WorkflowStepResponse>> {
    return fetchApi<WorkflowStepResponse>(`/workflow/${workflowId}/step`, {
      method: "POST",
      body: JSON.stringify(stepData),
    });
  },

  /**
   * Run entire workflow
   */
  async run(workflowId: string, input: Record<string, unknown>): Promise<ApiResponse<{ taskId: string; status: string }>> {
    return fetchApi<{ taskId: string; status: string }>(`/workflow/${workflowId}/run`, {
      method: "POST",
      body: JSON.stringify({ input }),
    });
  },

  /**
   * Get workflow templates
   */
  async getTemplates(): Promise<ApiResponse<{ templates: Array<{ id: string; name: string; description: string; steps: string[] }> }>> {
    return fetchApi<{ templates: Array<{ id: string; name: string; description: string; steps: string[] }> }>("/workflow/templates");
  },

  /**
   * List user workflows
   */
  async list(): Promise<ApiResponse<{ workflows: Workflow[] }>> {
    return fetchApi<{ workflows: Workflow[] }>("/workflow/list");
  },
};
