import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ElasticsearchService } from '../elasticsearch/elasticsearch.service';
export declare class UsersService {
    private readonly usersRepository;
    private readonly elasticsearchService;
    private readonly logger;
    constructor(usersRepository: Repository<User>, elasticsearchService: ElasticsearchService);
    create(createUserDto: CreateUserDto): Promise<User>;
    findAll(): Promise<User[]>;
    findOne(id: string): Promise<User>;
    findByEmail(email: string): Promise<User>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<User>;
    remove(id: string): Promise<void>;
    findByClerkId(clerkId: string): Promise<User | null>;
    syncUserFromClerk(clerkUserData: any): Promise<void>;
    updateUserFromClerk(clerkUserData: any): Promise<void>;
    deleteUser(clerkUserId: string): Promise<void>;
}
