import { User } from "../../domain/entities/user";
import { UserRepository } from "../../domain/repositories/user_repository";
import { v4 as uuidv4 } from "uuid";
import { CreateUserDTO } from "../dtos/create_user_dto";

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}
  async findUserById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async createUser (dto: CreateUserDTO): Promise<User>{
    if (!dto.name) {
      throw new Error("O nome é obrigatório");
    }

    const user = new User(
      uuidv4(),
      dto.name
    );
    await this.userRepository.save(user);
    return user;
  }
}
