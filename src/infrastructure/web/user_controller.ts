import { Request, Response } from "express";
import { CreateUserDTO } from "../../application/dtos/create_user_dto";
import { UserService } from "../../application/services/user_service";

export class UserController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  async createUser(req: Request, res: Response): Promise<Response> {
    try {
      if ((req.body?.name || "") === "") {
        throw new Error("O campo nome é obrigatório.");
      }

      const dto: CreateUserDTO = {
        name: req.body?.name,
      };

      const user = await this.userService.createUser(dto);
      return res.status(201).json({
        message: "User created successfully",
        user: {
          id: user.getId(),
          name: user.getName(),
        },
      });
    } catch (error: any) {
      return res
        .status(400)
        .json({ message: error.message || "An unexpected error occurred" });
    }
  }
}
