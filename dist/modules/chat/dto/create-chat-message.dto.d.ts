export declare class AttachmentDto {
    url: string;
    filename: string;
    contentType: string;
    size: number;
}
export declare class CreateChatMessageDto {
    userId: string;
    roomId: string;
    content: string;
    attachments?: AttachmentDto[];
    isRead?: boolean;
}
