import { Property } from "../../../domain/entities/property";
import { DateRange } from "../../../domain/value_objects/date_range";
import { BookingEntity } from "../entities/booking_entity";
import { PropertyEntity } from "../entities/property_entity";
import { UserEntity } from "../entities/user_entity";
import { PropertyMapper } from "./property_mapper";

describe("PropertyMapper", () => {
    it("deve converter PropertyEntity para Property corretamente", () => {
        const guestEntity = new UserEntity();
        guestEntity.id = crypto.randomUUID();
        guestEntity.name = "João da Silva";

        const dateRange = new DateRange(
            new Date("2026-01-01"),
            new Date("2026-01-08"),
        );

        const bookingEntity = new BookingEntity();
        bookingEntity.id = crypto.randomUUID();
        bookingEntity.guest = guestEntity;
        bookingEntity.startDate = dateRange.getStartDate();
        bookingEntity.endDate = dateRange.getEndDate();
        bookingEntity.guestCount = 2;
        bookingEntity.totalPrice = 854;

        const propertyEntity = new PropertyEntity();
        propertyEntity.id = crypto.randomUUID();
        propertyEntity.name = "Casa de Praia";
        propertyEntity.description = "Casa confortável próxima à praia";
        propertyEntity.maxGuests = 4;
        propertyEntity.basePricePerNight = 122;
        propertyEntity.bookings = [bookingEntity];

        const property = PropertyMapper.toDomain(propertyEntity);

        expect(property).not.toBeNull();
        expect(property?.getId()).toBe(propertyEntity.id);
        expect(property?.getName()).toBe("Casa de Praia");
        expect(property?.getDescription()).toBe(
            "Casa confortável próxima à praia",
        );
        expect(property?.getMaxGuests()).toBe(4);
        expect(property?.getBasePricePerNight()).toBe(122);
        expect(property?.calculateTotalPrice(dateRange)).toBe(768.6);
    });

    it("deve converter Property para PropertyEntity corretamente", () => {
        const property = new Property(
            "1",
            "Salão de Festas",
            "Salão amplo e equipado para eventos",
            3,
            476,
        );

        const propertyEntity = PropertyMapper.toPersistence(property);

        expect(propertyEntity?.id).toBe("1");
        expect(propertyEntity?.name).toBe("Salão de Festas");
        expect(propertyEntity?.description).toBe(
            "Salão amplo e equipado para eventos",
        );
        expect(propertyEntity?.maxGuests).toBe(3);
        expect(propertyEntity?.basePricePerNight).toBe(476);
    });

    it("deve lançar erro quando o nome da propriedade não for informado", () => {
        const propertyEntity = new PropertyEntity();
        propertyEntity.id = crypto.randomUUID();

        expect(() => PropertyMapper.toDomain(propertyEntity)).toThrow(
            "O nome é obrigatório",
        );
    });

    it("deve lançar erro quando o número máximo de hóspedes for inválido", () => {
        const propertyEntity = new PropertyEntity();
        propertyEntity.id = crypto.randomUUID();
        propertyEntity.name = "Casa de Praia";
        propertyEntity.maxGuests = 0;

        expect(() => PropertyMapper.toDomain(propertyEntity)).toThrow(
            "O número máximo de hóspedes deve ser maior que zero",
        );
    });
});