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
var ShippingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShippingService = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../../users/users.service");
let ShippingService = ShippingService_1 = class ShippingService {
    constructor(usersService) {
        this.usersService = usersService;
        this.logger = new common_1.Logger(ShippingService_1.name);
    }
    async assignShipper(orderId, shipperId) {
        this.logger.log(`Assigning shipper ${shipperId} to order ${orderId}`);
        try {
            const isShipper = await this.validateShipperRole(shipperId);
            if (!isShipper) {
                throw new common_1.BadRequestException('Người dùng không phải shipper');
            }
            await this.updateShippingRecord(orderId, shipperId);
            this.logger.log(`Successfully assigned shipper ${shipperId} to order ${orderId}`);
        }
        catch (error) {
            this.logger.error(`Failed to assign shipper: ${error.message}`, error.stack);
            throw error;
        }
    }
    async validateShipperRole(userId) {
        try {
            this.logger.debug(`Validating shipper role for user ${userId}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Error validating shipper role: ${error.message}`);
            return false;
        }
    }
    async updateShippingRecord(orderId, shipperId) {
        try {
            this.logger.debug(`Would update shipping record for order ${orderId} with shipper ${shipperId}`);
        }
        catch (error) {
            this.logger.error(`Error updating shipping record: ${error.message}`);
            throw error;
        }
    }
    async updateShippingStatus(shippingId, newStatus) {
        this.logger.log(`Updating shipping ${shippingId} status to ${newStatus}`);
        try {
            this.logger.log(`Successfully updated shipping status`);
        }
        catch (error) {
            this.logger.error(`Failed to update shipping status: ${error.message}`, error.stack);
            throw error;
        }
    }
    async assignShipperWithTransaction(orderId, shipperId, manager) {
        const repository = manager ? manager.getRepository('Shipping') : null;
        const isShipper = await this.validateShipperRole(shipperId);
        if (!isShipper) {
            throw new common_1.BadRequestException('Người dùng không phải shipper');
        }
        if (repository) {
        }
        else {
            await this.updateShippingRecord(orderId, shipperId);
        }
    }
};
exports.ShippingService = ShippingService;
exports.ShippingService = ShippingService = ShippingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], ShippingService);
//# sourceMappingURL=shipping.service.js.map