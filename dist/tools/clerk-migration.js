#!/usr/bin/env ts-node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../modules/users/entities/user.entity");
const clerk_sdk_node_1 = require("@clerk/clerk-sdk-node");
(0, dotenv_1.config)();
const AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'theshoebolt',
    entities: [user_entity_1.User],
    synchronize: false,
});
async function migrateUsersToClerk() {
    console.log('Starting migration of users to Clerk...');
    try {
        await AppDataSource.initialize();
        console.log('Database connection established');
        const users = await AppDataSource.manager.find(user_entity_1.User);
        console.log(`Found ${users.length} users in local database`);
        let created = 0;
        let errors = 0;
        for (const user of users) {
            try {
                const existingUsers = await clerk_sdk_node_1.clerkClient.users.getUserList({
                    emailAddress: [user.email],
                });
                if (existingUsers.length > 0) {
                    console.log(`User with email ${user.email} already exists in Clerk, updating metadata`);
                    await clerk_sdk_node_1.clerkClient.users.updateUser(existingUsers[0].id, {
                        firstName: user.firstName,
                        lastName: user.lastName,
                        publicMetadata: {
                            role: user.role,
                            localUserId: user.id,
                            ...existingUsers[0].publicMetadata,
                        },
                    });
                    await AppDataSource.manager.update(user_entity_1.User, user.id, {
                        clerkId: existingUsers[0].id,
                    });
                    created++;
                }
                else {
                    console.log(`Creating user ${user.email} in Clerk`);
                    const tempPassword = Math.random().toString(36).slice(-10);
                    const clerkUser = await clerk_sdk_node_1.clerkClient.users.createUser({
                        emailAddress: [user.email],
                        firstName: user.firstName,
                        lastName: user.lastName,
                        password: tempPassword,
                        publicMetadata: {
                            role: user.role,
                            localUserId: user.id,
                        },
                    });
                    await AppDataSource.manager.update(user_entity_1.User, user.id, {
                        clerkId: clerkUser.id,
                    });
                    created++;
                }
            }
            catch (error) {
                console.error(`Error migrating user ${user.email}:`, error);
                errors++;
            }
        }
        console.log(`Migration completed. Created/Updated ${created} users in Clerk. ${errors} errors.`);
    }
    catch (error) {
        console.error('Migration failed:', error);
    }
    finally {
        await AppDataSource.destroy();
        console.log('Database connection closed');
    }
}
migrateUsersToClerk();
//# sourceMappingURL=clerk-migration.js.map