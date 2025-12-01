import { handlePipelineRun } from "./methods/handlePipelineRun.js";
import { handleListProfiles } from "./methods/handleListProfiles.js";
import { handleGetProfile } from "./methods/handleGetProfile.js";
import { handleProviderList } from "./methods/handleProviderList.js";
import { handleProviderMetadata } from "./methods/handleProviderMetadata.js";

export async function mcpRouter(request: any) {
  const { method, params } = request;

  switch (method) {
    case "pipeline.run":
      return await handlePipelineRun(params);

    case "pipeline.listProfiles":
      return await handleListProfiles();

    case "pipeline.getProfile":
      return await handleGetProfile(params);

    case "provider.list":
      return await handleProviderList();

    case "provider.metadata":
      return await handleProviderMetadata(params);

    default:
      return {
        ok: false,
        error: {
          message: `Unknown MCP method: ${method}`,
          code: "UNKNOWN_METHOD"
        }
      };
  }
}