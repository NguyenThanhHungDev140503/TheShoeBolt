export declare class EmailAddressDto {
    id: string;
    email_address: string;
    primary?: boolean;
    verification?: Record<string, any>;
}
export declare class LastActiveDto {
    timestamp: number;
    ip_address?: string;
    user_agent?: string;
    city?: string;
    country?: string;
}
export declare class ClerkUserEventDto {
    id: string;
    email_addresses: EmailAddressDto[];
    first_name?: string;
    last_name?: string;
    profile_image_url?: string;
    public_metadata?: Record<string, any>;
    private_metadata?: Record<string, any>;
    created_at: number;
    updated_at: number;
    username?: string;
    phone_numbers?: any[];
    external_accounts?: any[];
    last_sign_in_at?: number;
    banned?: boolean;
    locked?: boolean;
}
export declare class ClerkSessionEventDto {
    id: string;
    user_id: string;
    created_at: number;
    updated_at: number;
    last_active_at?: LastActiveDto;
    status?: string;
    expire_at?: number;
    abandon_at?: number;
}
export declare class ClerkOrganizationEventDto {
    id: string;
    name: string;
    slug: string;
    created_at: number;
    updated_at: number;
    public_metadata?: Record<string, any>;
    private_metadata?: Record<string, any>;
    logo_url?: string;
    max_allowed_memberships?: number;
    admin_delete_enabled?: boolean;
}
export declare class ClerkOrganizationMembershipEventDto {
    id: string;
    organization: {
        id: string;
        name: string;
        slug: string;
    };
    public_user_data: {
        user_id: string;
        first_name?: string;
        last_name?: string;
        profile_image_url?: string;
        identifier?: string;
    };
    role: string;
    created_at: number;
    updated_at: number;
    public_metadata?: Record<string, any>;
    private_metadata?: Record<string, any>;
}
export declare class WebhookEventDto {
    type: string;
    data: ClerkUserEventDto | ClerkSessionEventDto | ClerkOrganizationEventDto | ClerkOrganizationMembershipEventDto;
    object: string;
    timestamp?: number;
}
