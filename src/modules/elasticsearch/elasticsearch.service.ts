import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@elastic/elasticsearch';

@Injectable()
export class ElasticsearchService implements OnModuleInit {
  private readonly logger = new Logger(ElasticsearchService.name);
  private readonly client: Client;
  private readonly indexPrefix: string;

  constructor(private readonly configService: ConfigService) {
    const node = this.configService.get<string>('elasticsearch.node');
    const username = this.configService.get<string>('elasticsearch.username');
    const password = this.configService.get<string>('elasticsearch.password');
    this.indexPrefix = this.configService.get<string>('elasticsearch.indexPrefix');

    const auth = username && password ? { username, password } : undefined;

    this.client = new Client({
      node,
      auth,
      tls: {
        rejectUnauthorized: false,
      },
    });

    this.logger.log(`Elasticsearch client initialized with node: ${node}`);
  }

  async onModuleInit() {
    try {
      const info = await this.client.info();
      this.logger.log(`Connected to Elasticsearch cluster: ${info.cluster_name}`);
      
      // Initialize indices
      await this.initializeIndices();
    } catch (error) {
      this.logger.error('Failed to connect to Elasticsearch', error);
    }
  }

  private async initializeIndices() {
    await this.createIndexIfNotExists('chat_messages', chatMessageMapping);
    await this.createIndexIfNotExists('users', userMapping);
  }

  private async createIndexIfNotExists(indexName: string, mapping: any) {
    const fullIndexName = `${this.indexPrefix}${indexName}`;
    
    try {
      const exists = await this.client.indices.exists({
        index: fullIndexName,
      });

      if (!exists) {
        const defaultSettings = this.configService.get('elasticsearch.defaultSettings');
        
        await this.client.indices.create({
          index: fullIndexName,
          body: {
            settings: defaultSettings,
            mappings: mapping,
          },
        });
        
        this.logger.log(`Created index: ${fullIndexName}`);
      } else {
        this.logger.log(`Index already exists: ${fullIndexName}`);
      }
    } catch (error) {
      this.logger.error(`Error creating index ${fullIndexName}`, error);
      throw error;
    }
  }

  // CRUD operations for chat messages
  async indexChatMessage(message: any) {
    try {
      const result = await this.client.index({
        index: `${this.indexPrefix}chat_messages`,
        document: {
          ...message,
          createdAt: message.createdAt || new Date(),
          updatedAt: message.updatedAt || new Date(),
        },
      });
      
      return result;
    } catch (error) {
      this.logger.error('Error indexing chat message', error);
      throw error;
    }
  }

  async updateChatMessage(id: string, updates: any) {
    try {
      const result = await this.client.update({
        index: `${this.indexPrefix}chat_messages`,
        id,
        body: {
          doc: {
            ...updates,
            updatedAt: new Date(),
          },
        },
      });
      
      return result;
    } catch (error) {
      this.logger.error(`Error updating chat message with ID ${id}`, error);
      throw error;
    }
  }

  async deleteChatMessage(id: string) {
    try {
      const result = await this.client.delete({
        index: `${this.indexPrefix}chat_messages`,
        id,
      });
      
      return result;
    } catch (error) {
      this.logger.error(`Error deleting chat message with ID ${id}`, error);
      throw error;
    }
  }

  async getChatMessage(id: string) {
    try {
      const result = await this.client.get({
        index: `${this.indexPrefix}chat_messages`,
        id,
      });
      
      return result._source;
    } catch (error) {
      this.logger.error(`Error retrieving chat message with ID ${id}`, error);
      throw error;
    }
  }

  // Bulk operations
  async bulkIndexChatMessages(messages: any[]) {
    if (!messages.length) return { errors: false };

    const operations = messages.flatMap(message => [
      { index: { _index: `${this.indexPrefix}chat_messages` } },
      {
        ...message,
        createdAt: message.createdAt || new Date(),
        updatedAt: message.updatedAt || new Date(),
      },
    ]);

    try {
      const result = await this.client.bulk({ operations });
      return result;
    } catch (error) {
      this.logger.error('Error bulk indexing chat messages', error);
      throw error;
    }
  }

  // Search operations
  async searchChatMessages(query: any, options: any = {}) {
    const { from = 0, size = 10, sort = [{ createdAt: { order: 'desc' } }] } = options;

    try {
      const result = await this.client.search({
        index: `${this.indexPrefix}chat_messages`,
        body: {
          from,
          size,
          sort,
          query,
        },
      });
      
      return {
        hits: result.hits.hits.map(hit => ({
          id: hit._id,
          score: hit._score,
          ...(hit._source as object),
        })),
        total: result.hits.total,
      };
    } catch (error) {
      this.logger.error('Error searching chat messages', error);
      throw error;
    }
  }

  // Advanced search with query builder
  async searchChatHistory(params: {
    userId?: string;
    roomId?: string;
    content?: string;
    startDate?: Date;
    endDate?: Date;
    from?: number;
    size?: number;
  }) {
    const { userId, roomId, content, startDate, endDate, from = 0, size = 10 } = params;

    // Build query
    const must = [];

    if (userId) {
      must.push({ term: { userId } });
    }

    if (roomId) {
      must.push({ term: { roomId } });
    }

    if (content) {
      must.push({
        multi_match: {
          query: content,
          fields: ['content^3', 'attachments.filename'],
          type: 'best_fields',
          fuzziness: 'AUTO',
        },
      });
    }

    // Date range filter
    if (startDate || endDate) {
      const range: any = { createdAt: {} };
      
      if (startDate) {
        range.createdAt.gte = startDate;
      }
      
      if (endDate) {
        range.createdAt.lte = endDate;
      }
      
      must.push({ range });
    }

    const query = must.length > 0 ? { bool: { must } } : { match_all: {} };

    return this.searchChatMessages(query, { from, size });
  }

  // User indexing and search
  async indexUser(user: any) {
    try {
      // Remove sensitive data
      const { password, ...userToIndex } = user;
      
      const result = await this.client.index({
        index: `${this.indexPrefix}users`,
        id: user.id,
        document: {
          ...userToIndex,
          updatedAt: new Date(),
        },
      });
      
      return result;
    } catch (error) {
      this.logger.error(`Error indexing user with ID ${user.id}`, error);
      throw error;
    }
  }

  async deleteUser(userId: string) {
    try {
      const result = await this.client.delete({
        index: `${this.indexPrefix}users`,
        id: userId,
      });
      
      return result;
    } catch (error) {
      this.logger.error(`Error deleting user with ID ${userId} from Elasticsearch`, error);
      throw error;
    }
  }

  async searchUsers(query: string, options: any = {}) {
    const { from = 0, size = 10 } = options;

    try {
      const result = await this.client.search({
        index: `${this.indexPrefix}users`,
        body: {
          from,
          size,
          query: {
            multi_match: {
              query,
              fields: ['email^2', 'firstName^3', 'lastName^3'],
              type: 'best_fields',
              fuzziness: 'AUTO',
            },
          },
        },
      });
      
      return {
        hits: result.hits.hits.map(hit => ({
          id: hit._id,
          score: hit._score,
          ...(hit._source as object),
        })),
        total: result.hits.total,
      };
    } catch (error) {
      this.logger.error('Error searching users', error);
      throw error;
    }
  }

  // Health check
  async checkHealth() {
    try {
      const health = await this.client.cluster.health();
      return {
        status: health.status,
        numberOfNodes: health.number_of_nodes,
        activeShards: health.active_shards,
      };
    } catch (error) {
      this.logger.error('Error checking Elasticsearch health', error);
      throw error;
    }
  }
}

// Index mappings
const chatMessageMapping = {
  properties: {
    userId: { type: 'keyword' },
    roomId: { type: 'keyword' },
    content: { 
      type: 'text',
      analyzer: 'standard',
      fields: {
        keyword: {
          type: 'keyword',
          ignore_above: 256
        }
      }
    },
    attachments: {
      type: 'nested',
      properties: {
        url: { type: 'keyword' },
        filename: { type: 'text' },
        contentType: { type: 'keyword' },
        size: { type: 'long' }
      }
    },
    isRead: { type: 'boolean' },
    createdAt: { type: 'date' },
    updatedAt: { type: 'date' }
  }
};

const userMapping = {
  properties: {
    email: { 
      type: 'text',
      analyzer: 'standard',
      fields: {
        keyword: {
          type: 'keyword',
          ignore_above: 256
        }
      }
    },
    firstName: { 
      type: 'text',
      analyzer: 'standard',
      fields: {
        keyword: {
          type: 'keyword',
          ignore_above: 256
        }
      }
    },
    lastName: { 
      type: 'text',
      analyzer: 'standard',
      fields: {
        keyword: {
          type: 'keyword',
          ignore_above: 256
        }
      }
    },
    role: { type: 'keyword' },
    isActive: { type: 'boolean' },
    lastLogin: { type: 'date' },
    createdAt: { type: 'date' },
    updatedAt: { type: 'date' }
  }
};