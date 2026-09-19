import express from "express";
import request from "supertest";
import { DataSource } from "typeorm";
import { TypeORMPropertyRepository } from "../repositories/typeorm_property_repository";
import { PropertyService } from "../../application/services/property_service";
import { PropertyController } from "../web/property_controller";
import { PropertyEntity } from "../persistence/entities/property_entity";
import { CreatePropertyDTO } from "../../application/dtos/create_property_dto";
import { BookingEntity } from "../persistence/entities/booking_entity";
import { UserEntity } from "../persistence/entities/user_entity";

const app = express();
app.use(express.json());

let dataSource: DataSource;
let propertyController: PropertyController;
let propertyService: PropertyService;
let propertyRepository: TypeORMPropertyRepository

beforeAll(async () => {
    dataSource = new DataSource({
        type:"sqlite",
        database: ":memory:",
        dropSchema: true,
        entities:[PropertyEntity, BookingEntity, UserEntity],
        synchronize: true,
        logging: false
    });
    await dataSource.initialize();

    propertyRepository = new TypeORMPropertyRepository(
        dataSource.getRepository(PropertyEntity)
    );
    propertyService = new PropertyService(propertyRepository);
    propertyController = new PropertyController(propertyService);

    app.post("/propertys", (req, res, next) => {
        propertyController.createProperty(req,res).catch(err => next(err))
    })
})

afterAll(async () => {
    await dataSource.destroy();
});

describe("PropertyController", () => {
    it("deve criar uma propriedade com sucesso", async () => {
        const response = await request(app).post("/propertys").send({
            name:"Nome Teste",
            description: "Descrição teste",
            maxGuests:3,
            basePricePerNight: 120.0,
        }as CreatePropertyDTO);

        expect(response.status).toBe(201);
        expect(response.body.message).toBe("Property created successfully");
        expect(response.body.property).toHaveProperty("id");

        expect(response.body.property).toHaveProperty("name");
        expect(response.body.property.name).toBe("Nome Teste");

        expect(response.body.property).toHaveProperty("description");
        expect(response.body.property.description).toBe("Descrição teste");

        expect(response.body.property).toHaveProperty("maxGuests");
        expect(response.body.property.maxGuests).toBe(3);

        expect(response.body.property).toHaveProperty("basePricePerNight");
        expect(response.body.property.basePricePerNight).toBe(120.0);

        const propertyBanco = await propertyRepository.findById(response.body.property.id);
        expect(propertyBanco).toHaveProperty("id");
        expect(propertyBanco?.getId()).toBe(response.body.property.id);
    });

    it("deve retornar erro com código 400 e mensagem 'O nome da propriedade é obrigatório.' ao enviar um nome vazio", async () => {
        const response = await request(app).post("/propertys").send({
            name:"",
            description: "Descrição teste",
            maxGuests:3,
            basePricePerNight: 120.0,
        }as CreatePropertyDTO);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('O nome da propriedade é obrigatório.')
    });
    it("deve retornar erro com código 400 e mensagem 'A capacidade máxima deve ser maior que zero.' ao enviar maxGuests igual a zero ou negativo", async () => {
        const newProperty = {
            name:"Nome teste",
            description: "Descrição teste",
            maxGuests:0,
            basePricePerNight: 120.0,
        }as CreatePropertyDTO

        let response = await request(app).post("/propertys").send(newProperty);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('A capacidade máxima deve ser maior que zero.');

        newProperty.maxGuests = -1;
        response = await request(app).post("/propertys").send(newProperty);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('A capacidade máxima deve ser maior que zero.');
    });
    it("deve retornar erro com código 400 e mensagem 'O preço base por noite é obrigatório.' ao enviar basePricePerNight ausente",async () => {
       const response = await request(app).post("/propertys").send({
            name:"Nome teste",
            description: "Descrição teste",
            maxGuests:3,
        }as CreatePropertyDTO);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('O preço base por noite é obrigatório.');
    })
});
