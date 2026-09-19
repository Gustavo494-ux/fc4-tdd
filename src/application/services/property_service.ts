import { Property } from "../../domain/entities/property";
import { PropertyRepository } from "../../domain/repositories/property_repository";
import { CreatePropertyDTO } from "../dtos/create_property_dto";
import { v4 as uuidv4 } from "uuid";
import { ValidationError } from "../errors/validation_error";

export class PropertyService {
  constructor(private readonly propertyRepository: PropertyRepository) {}

  async findPropertyById(id: string): Promise<Property | null> {
    return this.propertyRepository.findById(id);
  }

  async createProperty(dto: CreatePropertyDTO): Promise<Property>{
    if(!dto.name|| dto?.name.trim().length === 0 ){
      throw new ValidationError('O nome da propriedade é obrigatório.')
    }

    if(!dto.maxGuests || dto.maxGuests < 1){
      throw new ValidationError('A capacidade máxima deve ser maior que zero.')
    }

    if(!dto.basePricePerNight || dto.basePricePerNight < 0.1){
      throw new ValidationError('O preço base por noite é obrigatório.')
    }

    const property = new Property(
      uuidv4(),
      dto.name,
      dto.description,
      dto.maxGuests,
      dto.basePricePerNight
    );

    await this.propertyRepository.save(property);
    return await this.findPropertyById(property.getId()) || property;
  }
}
