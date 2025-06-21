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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ElasticsearchController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElasticsearchController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const elasticsearch_service_1 = require("./elasticsearch.service");
const clerk_auth_guard_1 = require("../Infracstructre/clerk/guards/clerk-auth.guard");
let ElasticsearchController = ElasticsearchController_1 = class ElasticsearchController {
    constructor(elasticsearchService) {
        this.elasticsearchService = elasticsearchService;
        this.logger = new common_1.Logger(ElasticsearchController_1.name);
    }
    async checkHealth() {
        return this.elasticsearchService.checkHealth();
    }
    async searchChatMessages(searchParams) {
        this.logger.log(`Searching chat messages with params: ${JSON.stringify(searchParams)}`);
        return this.elasticsearchService.searchChatHistory(searchParams);
    }
    async searchUsers(query, from = 0, size = 10) {
        this.logger.log(`Searching users with query: ${query}`);
        return this.elasticsearchService.searchUsers(query, { from, size });
    }
};
exports.ElasticsearchController = ElasticsearchController;
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({ summary: 'Check Elasticsearch health' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns Elasticsearch cluster health' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ElasticsearchController.prototype, "checkHealth", null);
__decorate([
    (0, common_1.Post)('search/chat'),
    (0, swagger_1.ApiOperation)({ summary: 'Search chat messages' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns search results' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ElasticsearchController.prototype, "searchChatMessages", null);
__decorate([
    (0, common_1.Get)('search/users'),
    (0, swagger_1.ApiOperation)({ summary: 'Search users' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns user search results' }),
    __param(0, (0, common_1.Query)('query')),
    __param(1, (0, common_1.Query)('from')),
    __param(2, (0, common_1.Query)('size')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], ElasticsearchController.prototype, "searchUsers", null);
exports.ElasticsearchController = ElasticsearchController = ElasticsearchController_1 = __decorate([
    (0, swagger_1.ApiTags)('Elasticsearch'),
    (0, common_1.Controller)('elasticsearch'),
    (0, common_1.UseGuards)(clerk_auth_guard_1.ClerkAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [elasticsearch_service_1.ElasticsearchService])
], ElasticsearchController);
//# sourceMappingURL=elasticsearch.controller.js.map