import { Document } from 'mongoose';
export type ChatRoomDocument = ChatRoom & Document;
export declare class ChatRoom {
    name: string;
    type: string;
    participants: string[];
    createdBy: string;
    lastMessageAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const ChatRoomSchema: import("mongoose").Schema<ChatRoom, import("mongoose").Model<ChatRoom, any, any, any, Document<unknown, any, ChatRoom> & ChatRoom & {
    _id: import("mongoose").Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ChatRoom, Document<unknown, {}, import("mongoose").FlatRecord<ChatRoom>> & import("mongoose").FlatRecord<ChatRoom> & {
    _id: import("mongoose").Types.ObjectId;
}>;
