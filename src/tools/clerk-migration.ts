#!/usr/bin/env ts-node

/**
 * Migration tool để chuyển đổi người dùng từ JWT sang Clerk
 * 
 * Sử dụng: ts-node src/tools/clerk-migration.ts
 */

import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { User } from '../modules/users/entities/user.entity';
import { createClerkClient } from '@clerk/backend';

// Load environment variables
config();

// Initialize TypeORM connection
const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'theshoebolt',
  entities: [User],
  synchronize: false,
});

async function migrateUsersToClerk() {
  console.log('Starting migration of users to Clerk...');

  try {
    // Initialize Clerk client
    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY!,
      publishableKey: process.env.CLERK_PUBLISHABLE_KEY!,
    });

    // Initialize database connection
    await AppDataSource.initialize();
    console.log('Database connection established');

    // Get all users from database
    const users = await AppDataSource.manager.find(User);
    console.log(`Found ${users.length} users in local database`);

    // Migrate each user to Clerk
    let created = 0;
    let errors = 0;
    
    for (const user of users) {
      try {
        // Check if user already exists in Clerk by email
        const existingUsers = await clerkClient.users.getUserList({
          emailAddress: [user.email],
        });

        if (existingUsers.data.length > 0) {
          console.log(`User with email ${user.email} already exists in Clerk, updating metadata`);
          
          // Update user metadata in Clerk
          await clerkClient.users.updateUser(existingUsers.data[0].id, {
            firstName: user.firstName,
            lastName: user.lastName,
            publicMetadata: {
              role: user.role,
              localUserId: user.id,
              ...existingUsers.data[0].publicMetadata,
            },
          });

          // Update user in local database with Clerk ID
          await AppDataSource.manager.update(User, user.id, {
            clerkId: existingUsers.data[0].id,
          });

          created++;
        } else {
          // Create new user in Clerk
          console.log(`Creating user ${user.email} in Clerk`);

          // Create a random password for the user
          const tempPassword = Math.random().toString(36).slice(-10);
          
          // Create user in Clerk
          const clerkUser = await clerkClient.users.createUser({
            emailAddress: [user.email],
            firstName: user.firstName,
            lastName: user.lastName,
            password: tempPassword,
            publicMetadata: {
              role: user.role,
              localUserId: user.id,
            },
          });
          
          // Update user in local database with Clerk ID
          await AppDataSource.manager.update(User, user.id, {
            clerkId: clerkUser.id,
          });
          
          // Send password reset email to user (requires Clerk Email template setup)
          // await clerkClient.emails.createEmail({
          //   fromEmailName: 'TheShoeBolt',
          //   subject: 'Welcome to TheShoeBolt - Set Your Password',
          //   body: `Your account has been migrated to our new system. Please set your password by clicking this link: https://your-frontend-url.com/reset-password?token=${passwordResetToken}`,
          //   emailAddressId: clerkUser.emailAddresses[0].id,
          // });
          
          created++;
        }
      } catch (error) {
        console.error(`Error migrating user ${user.email}:`, error);
        errors++;
      }
    }
    
    console.log(`Migration completed. Created/Updated ${created} users in Clerk. ${errors} errors.`);
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    // Close database connection
    await AppDataSource.destroy();
    console.log('Database connection closed');
  }
}

migrateUsersToClerk(); 