import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ChatRoomDocument = ChatRoom & Document;

@Schema({ timestamps: true })
export class ChatRoom {
  @Prop({ required: true })
  name: string;

  @Prop({ default: 'group' })
  type: string; // 'direct' or 'group'

  @Prop({ type: [String], required: true })
  participants: string[]; // Array of user IDs

  @Prop({ type: String, required: true })
  createdBy: string;

  @Prop()
  lastMessageAt: Date;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const ChatRoomSchema = SchemaFactory.createForClass(ChatRoom);

// Create index for efficient querying
ChatRoomSchema.index({ participants: 1 });
ChatRoomSchema.index({ lastMessageAt: -1 });