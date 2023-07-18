import { ProvidersResolver } from "../providers/providers-resolver";
import { generateId } from "../shared/generate-id";
import { ChannelProviderConnectionConfig } from "./schemas/channel-provider-connection.schema";
import { ProvidersConfig, RootConfig } from "./schemas/root-config.schema";

/**
 * TODO
 * - test
 * - extract and delegate smaller configs?
 */
export class AppConfig {
  private rootData: RootConfig.Shape = {
    providers: [],
    connections: [],
  };

  constructor(initialData?: RootConfig.Shape) {
    if (initialData) {
      this.rootData = RootConfig.Schema.parse(initialData);
    }
  }

  static parse(serializedSchema: string) {
    return new AppConfig(JSON.parse(serializedSchema));
  }

  serialize() {
    return JSON.stringify(this.rootData);
  }

  providers = {
    checkProviderExists: (id: string) => {
      return !!this.rootData.providers.find((p) => p.id === id);
    },

    addProvider: (providerConfigInput: ProvidersConfig.AnyInputShape) => {
      const inputSchema = ProvidersResolver.getProviderInputSchema(providerConfigInput.type);

      const parsedConfig = inputSchema.parse(providerConfigInput);

      this.rootData.providers.push({
        ...parsedConfig,
        id: generateId(),
      });

      return this;
    },

    updateProvider: (providerConfig: ProvidersConfig.AnyFullShape) => {
      const schema = ProvidersResolver.getProviderSchema(providerConfig.type);

      const parsedConfig = schema.parse(providerConfig);

      this.rootData.providers = this.rootData.providers.map((p) => {
        if (p.id === parsedConfig.id) {
          return parsedConfig;
        } else {
          return p;
        }
      });
    },

    deleteProvider: (id: string) => {
      this.rootData.providers = this.rootData.providers.filter((p) => p.id !== id);
      this.connections.deleteConnectionsWithProvider(id);

      return this;
    },

    getProviders: () => {
      return this.rootData.providers;
    },

    getProviderById: (id: string) => {
      return this.providers.getProviders().find((p) => p.id === id);
    },
  };

  connections = {
    getConnections: () => {
      return this.rootData.connections;
    },

    deleteConnection: (connectionID: string) => {
      this.rootData.connections = this.rootData.connections.filter((c) => c.id !== connectionID);

      return this;
    },

    addConnection: (input: ChannelProviderConnectionConfig.InputShape) => {
      if (!this.providers.checkProviderExists(input.providerId)) {
        throw new Error("Provider doesnt exist");
      }

      const parsed = ChannelProviderConnectionConfig.Schema.Input.parse(input);

      this.rootData.connections.push({
        ...parsed,
        id: generateId(),
      });

      return this;
    },

    deleteConnectionsWithProvider: (providerId: string) => {
      this.rootData.connections = this.rootData.connections.filter((conn) => {
        return conn.providerId !== providerId;
      });
    },

    getConnectionById: (id: string) => {
      return this.connections.getConnections().find((c) => c.id === id);
    },
  };
}
