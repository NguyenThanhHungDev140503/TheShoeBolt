import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ChatMessageDocument = ChatMessage & Document;

export class Attachment {
  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  filename: string;

  @Prop({ required: true })
  contentType: string;

  @Prop({ required: true })
  size: number;
}

@Schema({ timestamps: true })
export class ChatMessage {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true, index: true })
  roomId: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: [Object], default: [] })
  attachments: Attachment[];

  @Prop({ default: false })
  isRead: boolean;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);

// Create compound index for efficient querying
ChatMessageSchema.index({ roomId: 1, createdAt: -1 });