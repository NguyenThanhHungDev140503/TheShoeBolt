import { EntityManager } from 'typeorm';
import { UsersService } from '../../users/users.service';
export declare class ShippingService {
    private readonly usersService;
    private readonly logger;
    constructor(usersService: UsersService);
    assignShipper(orderId: string, shipperId: string): Promise<void>;
    private validateShipperRole;
    private updateShippingRecord;
    updateShippingStatus(shippingId: string, newStatus: string): Promise<void>;
    assignShipperWithTransaction(orderId: string, shipperId: string, manager?: EntityManager): Promise<void>;
}
