import { Booking } from "../../../domain/entities/booking";
import { Property } from "../../../domain/entities/property";
import { User } from "../../../domain/entities/user";
import { DateRange } from "../../../domain/value_objects/date_range";
import { BookingEntity } from "../entities/booking_entity";
import { UserEntity } from "../entities/user_entity";
import { BookingMapper } from "./booking_mapper";

describe("BookingMapper", () => {
    it("deve converter BookingEntity em Booking corretamente", () => {
        const dateRange = new DateRange(
            new Date("2026-02-01"),
            new Date("2026-02-04"),
        );

        const property = new Property(
            "id",
            "Casa de praia",
            "Casa top",
            5,
            120,
        );

        const guestEntity = new UserEntity();
        guestEntity.id = "2";
        guestEntity.name = "Usuário teste";

        const bookingEntity = new BookingEntity();
        bookingEntity.id = "1";
        bookingEntity.guest = guestEntity;
        bookingEntity.startDate = dateRange.getStartDate();
        bookingEntity.endDate = dateRange.getEndDate();
        bookingEntity.guestCount = 4;
        bookingEntity.status = "CONFIRMED";
        bookingEntity.totalPrice = 1050;

        const booking = BookingMapper.toDomain(
            bookingEntity,
            property,
        );

        expect(booking?.getId()).toBe("1");
        expect(booking?.getGuestCount()).toBe(4);
        expect(booking?.getProperty()).toBe(property);
        expect(booking?.getStatus()).toBe("CONFIRMED");
        expect(booking?.getTotalPrice()).toBe(1050);
    });

    it("deve lançar erro de validação ao faltar campos obrigatórios no BookingEntity", () => {
        const property = new Property(
            "id",
            "Casa de praia",
            "Casa top",
            5,
            120,
        );

        const guestEntity = new UserEntity();
        guestEntity.id = "2";
        guestEntity.name = "Usuário teste";

        const bookingEntity = new BookingEntity();
        bookingEntity.guest = guestEntity;

        expect(() =>
            BookingMapper.toDomain(bookingEntity, property),
        ).toThrow(
            new Error(
                "A data de início e término não podem ser iguais.",
            ),
        );

        bookingEntity.startDate = new Date("2026-01-04");
        bookingEntity.endDate = new Date("2026-01-03");

        expect(() =>
            BookingMapper.toDomain(bookingEntity, property),
        ).toThrow(
            new Error(
                "A data de término deve ser posterior à data de início.",
            ),
        );

        bookingEntity.guestCount = -1;
        bookingEntity.startDate = new Date("2026-01-01");
        bookingEntity.endDate = new Date("2026-01-03");

        expect(() =>
            BookingMapper.toDomain(bookingEntity, property),
        ).toThrow(
            new Error(
                "O número de hóspedes deve ser maior que zero.",
            ),
        );
    });

    it("deve converter Booking para BookingEntity corretamente", () => {
        const guest = new User(
            "3",
            "Usuário Teste",
        );

        const dateRange = new DateRange(
            new Date("2026-09-01"),
            new Date("2026-09-03"),
        );

        const property = new Property(
            "2",
            "Apartamento",
            "Apartamento TOP",
            3,
            122,
        );

        const booking = new Booking(
            "1",
            property,
            guest,
            dateRange,
            2,
        );

        const bookingEntity = BookingMapper.toPersistence(booking);

        expect(bookingEntity?.id).toBe("1");
        expect(bookingEntity?.property?.id).toBe("2");
        expect(bookingEntity?.guest?.id).toBe("3");
        expect(bookingEntity?.startDate).toBe(dateRange.getStartDate());
        expect(bookingEntity?.endDate).toBe(dateRange.getEndDate());
        expect(bookingEntity?.guestCount).toBe(2);
        expect(bookingEntity?.totalPrice).toBe(244);
    });
});