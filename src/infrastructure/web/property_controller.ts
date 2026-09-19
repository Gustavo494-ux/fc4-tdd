import { CreateBookingDTO } from "../../application/dtos/create_booking_dto";
import { BookingService } from "../../application/services/booking_service";
import { Request, Response } from "express";
import { PropertyService } from "../../application/services/property_service";
import { CreatePropertyDTO } from "../../application/dtos/create_property_dto";
import { ValidationError } from "../../application/errors/validation_error";

export class PropertyController {
  private propertyService: PropertyService;

  constructor(propertyService: PropertyService) {
    this.propertyService = propertyService;
  }

  async createProperty(req: Request, res:Response): Promise<Response>{
    try {
      const dto: CreatePropertyDTO = {
        name: req.body?.name,
        description: req.body?.description,
        maxGuests: req.body?.maxGuests,
        basePricePerNight: req.body?.basePricePerNight
      };

      if(!dto.name || dto?.name.trim().length === 0){
        throw new ValidationError('O nome da propriedade é obrigatório.')
      }

      const property = await this.propertyService.createProperty(dto);

      return res.status(201).json({
        message: "Property created successfully",
        property: {
          id: property.getId(),
          name: property.getName(),
          description: property.getDescription(),
          maxGuests: property.getMaxGuests(),
          basePricePerNight: property.getBasePricePerNight()
        },
      });
    } catch (error) {
       if (error instanceof ValidationError) {
              return res.status(400).json({ message: error.message });
            }

            const message =
              error instanceof Error
                ? error.message
                : "An unexpected error occurred";

            return res.status(500).json({ message });
    }
  }

}
