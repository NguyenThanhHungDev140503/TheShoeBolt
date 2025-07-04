"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ElasticsearchService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElasticsearchService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const elasticsearch_1 = require("@elastic/elasticsearch");
let ElasticsearchService = ElasticsearchService_1 = class ElasticsearchService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(ElasticsearchService_1.name);
        const node = this.configService.get('elasticsearch.node');
        const username = this.configService.get('elasticsearch.username');
        const password = this.configService.get('elasticsearch.password');
        this.indexPrefix = this.configService.get('elasticsearch.indexPrefix');
        const auth = username && password ? { username, password } : undefined;
        this.client = new elasticsearch_1.Client({
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
            await this.initializeIndices();
        }
        catch (error) {
            this.logger.error('Failed to connect to Elasticsearch', error);
        }
    }
    async initializeIndices() {
        await this.createIndexIfNotExists('chat_messages', chatMessageMapping);
        await this.createIndexIfNotExists('users', userMapping);
    }
    async createIndexIfNotExists(indexName, mapping) {
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
            }
            else {
                this.logger.log(`Index already exists: ${fullIndexName}`);
            }
        }
        catch (error) {
            this.logger.error(`Error creating index ${fullIndexName}`, error);
            throw error;
        }
    }
    async indexChatMessage(message) {
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
        }
        catch (error) {
            this.logger.error('Error indexing chat message', error);
            throw error;
        }
    }
    async updateChatMessage(id, updates) {
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
        }
        catch (error) {
            this.logger.error(`Error updating chat message with ID ${id}`, error);
            throw error;
        }
    }
    async deleteChatMessage(id) {
        try {
            const result = await this.client.delete({
                index: `${this.indexPrefix}chat_messages`,
                id,
            });
            return result;
        }
        catch (error) {
            this.logger.error(`Error deleting chat message with ID ${id}`, error);
            throw error;
        }
    }
    async getChatMessage(id) {
        try {
            const result = await this.client.get({
                index: `${this.indexPrefix}chat_messages`,
                id,
            });
            return result._source;
        }
        catch (error) {
            this.logger.error(`Error retrieving chat message with ID ${id}`, error);
            throw error;
        }
    }
    async bulkIndexChatMessages(messages) {
        if (!messages.length)
            return { errors: false };
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
        }
        catch (error) {
            this.logger.error('Error bulk indexing chat messages', error);
            throw error;
        }
    }
    async searchChatMessages(query, options = {}) {
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
                    ...hit._source,
                })),
                total: result.hits.total,
            };
        }
        catch (error) {
            this.logger.error('Error searching chat messages', error);
            throw error;
        }
    }
    async searchChatHistory(params) {
        const { userId, roomId, content, startDate, endDate, from = 0, size = 10 } = params;
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
        if (startDate || endDate) {
            const range = { createdAt: {} };
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
    async indexUser(user) {
        try {
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
        }
        catch (error) {
            this.logger.error(`Error indexing user with ID ${user.id}`, error);
            throw error;
        }
    }
    async deleteUser(userId) {
        try {
            const result = await this.client.delete({
                index: `${this.indexPrefix}users`,
                id: userId,
            });
            return result;
        }
        catch (error) {
            this.logger.error(`Error deleting user with ID ${userId} from Elasticsearch`, error);
            throw error;
        }
    }
    async searchUsers(query, options = {}) {
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
                    ...hit._source,
                })),
                total: result.hits.total,
            };
        }
        catch (error) {
            this.logger.error('Error searching users', error);
            throw error;
        }
    }
    async checkHealth() {
        try {
            const health = await this.client.cluster.health();
            return {
                status: health.status,
                numberOfNodes: health.number_of_nodes,
                activeShards: health.active_shards,
            };
        }
        catch (error) {
            this.logger.error('Error checking Elasticsearch health', error);
            throw error;
        }
    }
};
exports.ElasticsearchService = ElasticsearchService;
exports.ElasticsearchService = ElasticsearchService = ElasticsearchService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ElasticsearchService);
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
//# sourceMappingURL=elasticsearch.service.js.map