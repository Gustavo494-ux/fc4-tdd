import { User } from "../../domain/entities/user";
import { UserRepository } from "../../domain/repositories/user_repository";
import { v4 as uuidv4 } from "uuid";
import { CreateUserDTO } from "../dtos/create_user_dto";
import { ValidationError } from "../errors/validation_error";

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}
  async findUserById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async createUser(dto: CreateUserDTO): Promise<User> {
    if (typeof dto.name !== "string" || dto.name.trim() === "") {
      throw new ValidationError("O campo nome é obrigatório.");
    }

    const user = new User(uuidv4(), dto.name.trim());
    await this.userRepository.save(user);
    return user;
  }
}
