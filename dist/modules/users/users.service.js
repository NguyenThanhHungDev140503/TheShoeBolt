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
var UsersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
const elasticsearch_service_1 = require("../elasticsearch/elasticsearch.service");
let UsersService = UsersService_1 = class UsersService {
    constructor(usersRepository, elasticsearchService) {
        this.usersRepository = usersRepository;
        this.elasticsearchService = elasticsearchService;
        this.logger = new common_1.Logger(UsersService_1.name);
    }
    async create(createUserDto) {
        const existingUser = await this.usersRepository.findOne({
            where: { email: createUserDto.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        const user = this.usersRepository.create(createUserDto);
        const savedUser = await this.usersRepository.save(user);
        try {
            await this.elasticsearchService.indexUser(savedUser);
        }
        catch (error) {
            console.error(`Failed to index user in Elasticsearch: ${error.message}`);
        }
        return savedUser;
    }
    async findAll() {
        return this.usersRepository.find({
            select: ['id', 'email', 'firstName', 'lastName', 'role', 'createdAt', 'updatedAt'],
        });
    }
    async findOne(id) {
        const user = await this.usersRepository.findOne({
            where: { id },
            select: ['id', 'email', 'firstName', 'lastName', 'role', 'createdAt', 'updatedAt'],
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async findByEmail(email) {
        return this.usersRepository.findOne({ where: { email } });
    }
    async update(id, updateUserDto) {
        const user = await this.findOne(id);
        if (updateUserDto.email && updateUserDto.email !== user.email) {
            const existingUser = await this.usersRepository.findOne({
                where: { email: updateUserDto.email },
            });
            if (existingUser) {
                throw new common_1.ConflictException('User with this email already exists');
            }
        }
        await this.usersRepository.update(id, updateUserDto);
        const updatedUser = await this.findOne(id);
        try {
            await this.elasticsearchService.indexUser(updatedUser);
        }
        catch (error) {
            console.error(`Failed to update user in Elasticsearch: ${error.message}`);
        }
        return updatedUser;
    }
    async remove(id) {
        const user = await this.findOne(id);
        await this.usersRepository.remove(user);
        try {
            await this.elasticsearchService.deleteUser(id);
        }
        catch (error) {
            console.error(`Failed to delete user from Elasticsearch: ${error.message}`);
        }
    }
    async findByClerkId(clerkId) {
        return await this.usersRepository.findOne({ where: { clerkId } });
    }
    async syncUserFromClerk(clerkUserData) {
        try {
            this.logger.debug(`Syncing user from Clerk: ${clerkUserData.id}`);
            const userData = {
                clerkId: clerkUserData.id,
                email: clerkUserData.email_addresses?.[0]?.email_address,
                firstName: clerkUserData.first_name,
                lastName: clerkUserData.last_name,
                profileImageUrl: clerkUserData.profile_image_url,
                publicMetadata: clerkUserData.public_metadata,
                privateMetadata: clerkUserData.private_metadata,
                createdAt: new Date(clerkUserData.created_at),
                updatedAt: new Date(clerkUserData.updated_at),
            };
            const existingUser = await this.findByClerkId(clerkUserData.id);
            if (existingUser) {
                this.logger.warn(`User ${clerkUserData.id} already exists, updating instead`);
                await this.updateUserFromClerk(clerkUserData);
                return;
            }
            await this.create(userData);
            this.logger.log(`Successfully synced new user: ${clerkUserData.id}`);
        }
        catch (error) {
            this.logger.error(`Failed to sync user from Clerk: ${clerkUserData.id}`, error);
            throw error;
        }
    }
    async updateUserFromClerk(clerkUserData) {
        try {
            this.logger.debug(`Updating user from Clerk: ${clerkUserData.id}`);
            const existingUser = await this.findByClerkId(clerkUserData.id);
            if (!existingUser) {
                this.logger.warn(`User ${clerkUserData.id} not found, creating instead`);
                await this.syncUserFromClerk(clerkUserData);
                return;
            }
            const updateData = {
                email: clerkUserData.email_addresses?.[0]?.email_address,
                firstName: clerkUserData.first_name,
                lastName: clerkUserData.last_name,
                profileImageUrl: clerkUserData.profile_image_url,
                publicMetadata: clerkUserData.public_metadata,
                privateMetadata: clerkUserData.private_metadata,
                updatedAt: new Date(clerkUserData.updated_at),
            };
            await this.update(existingUser.id, updateData);
            this.logger.log(`Successfully updated user: ${clerkUserData.id}`);
        }
        catch (error) {
            this.logger.error(`Failed to update user from Clerk: ${clerkUserData.id}`, error);
            throw error;
        }
    }
    async deleteUser(clerkUserId) {
        try {
            this.logger.debug(`Deleting user from Clerk webhook: ${clerkUserId}`);
            const existingUser = await this.findByClerkId(clerkUserId);
            if (!existingUser) {
                this.logger.warn(`User ${clerkUserId} not found for deletion`);
                return;
            }
            await this.remove(existingUser.id);
            this.logger.log(`Successfully deleted user: ${clerkUserId}`);
        }
        catch (error) {
            this.logger.error(`Failed to delete user from Clerk: ${clerkUserId}`, error);
            throw error;
        }
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = UsersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        elasticsearch_service_1.ElasticsearchService])
], UsersService);
//# sourceMappingURL=users.service.js.map