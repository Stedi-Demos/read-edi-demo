import { TextEncoder } from "util";

import { NodeHttpHandler } from "@aws-sdk/node-http-handler";
import {
  CreateFunctionCommand,
  CreateFunctionCommandOutput,
  DeleteFunctionCommand,
  DeleteFunctionCommandOutput,
  FunctionsClient,
  FunctionsClientConfig,
  InvokeFunctionCommand,
  UpdateFunctionCommand,
  UpdateFunctionCommandOutput,
} from "@stedi/sdk-client-functions";

import { DEFAULT_SDK_CLIENT_PROPS } from "../lib/constants.js";

let _functionsClient: FunctionsClient;

export const functionClient = (): FunctionsClient => {
  if (_functionsClient === undefined) {
    const config: FunctionsClientConfig = {
      ...DEFAULT_SDK_CLIENT_PROPS,
      maxAttempts: 5,
      requestHandler: new NodeHttpHandler({
        connectionTimeout: 1_000,
      }),
    };

    _functionsClient = new FunctionsClient(config);
  }

  return _functionsClient;
};

export const invokeFunction = async (
  functionName: string,
  input: any
): Promise<any> => {
  const result = await functionClient().send(
    new InvokeFunctionCommand({
      functionName,
      requestPayload: new TextEncoder().encode(JSON.stringify(input)),
    })
  );

  return result.responsePayload?.toString();
};

export const createFunction = async (
  functionName: string,
  functionPackage: Uint8Array,
  environmentVariables?: {
    [key: string]: string;
  }
): Promise<CreateFunctionCommandOutput> => {
  return functionClient().send(
    new CreateFunctionCommand({
      functionName,
      package: functionPackage,
      environmentVariables,
      timeout: 900,
    })
  );
};

export const updateFunction = async (
  functionName: string,
  functionPackage: Uint8Array,
  environmentVariables?: {
    [key: string]: string;
  }
): Promise<UpdateFunctionCommandOutput> => {
  return functionClient().send(
    new UpdateFunctionCommand({
      functionName,
      package: functionPackage,
      environmentVariables,
      timeout: 900,
    })
  );
};

export const deleteFunction = async (
  functionName: string
): Promise<DeleteFunctionCommandOutput> => {
  return functionClient().send(
    new DeleteFunctionCommand({
      functionName,
    })
  );
};
