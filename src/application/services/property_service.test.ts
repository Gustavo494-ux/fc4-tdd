import { PropertyService } from "./property_service";
import { FakePropertyRepository } from "../../infrastructure/repositories/fake_property_repository";
import { Property } from "../../domain/entities/property";
import { CreatePropertyDTO } from "../dtos/create_property_dto";

describe("PropertyService", () => {
  let propertyService: PropertyService;
  let fakePropertyRepository: FakePropertyRepository;

  beforeEach(() => {
    fakePropertyRepository = new FakePropertyRepository();
    propertyService = new PropertyService(fakePropertyRepository);
  });

  it("deve retornar null quando um ID inválido for passado", async () => {
    const property = await propertyService.findPropertyById("999");
    expect(property).toBeNull();
  });

  it("deve retornar uma propriedade quando um ID váilido for fornecido", async () => {
    const property = await propertyService.findPropertyById("1");
    expect(property).not.toBeNull();
    expect(property?.getId()).toBe("1");
    expect(property?.getName()).toBe("Apartamento");
  });

  it("deve salvar uma nova propriedade com sucesso usando repositorio fake e buscando novamente", async () => {
    const newProperty = new Property(
      "3",
      "Test Property",
      "Test Description",
      4,
      100
    );
    await fakePropertyRepository.save(newProperty);

    const property = await propertyService.findPropertyById("3");
    expect(property).not.toBeNull();
    expect(property?.getId()).toBe("3");
    expect(property?.getName()).toBe("Test Property");
  });

   it("deve criar uma property com sucesso", async () => {
    const newProperty = {
      name: "Nome Teste",
      description: "Descrição teste",
      maxGuests: 3,
      basePricePerNight: 122.0
    } as CreatePropertyDTO;

    const result = await propertyService.createProperty(newProperty);
    expect(result).toHaveProperty("id");

    expect(result).toHaveProperty("name");
    expect(result.getName()).toBe("Nome Teste");

    expect(result).toHaveProperty("description");
    expect(result.getDescription()).toBe("Descrição teste");

    expect(result).toHaveProperty("maxGuests");
    expect(result.getMaxGuests()).toBe(3);

    expect(result).toHaveProperty("basePricePerNight");
    expect(result.getBasePricePerNight()).toBe(122.0)
  });

  it("deve lançar uma exeção com mensagem 'O nome da propriedade é obrigatório' ao criar uma property com nome vazio.", async () => {
    const newProperty = {
      name: "",
      description: "Descrição teste",
      maxGuests: 3,
      basePricePerNight: 122.0
    } as CreatePropertyDTO;

    await expect(propertyService.createProperty(newProperty)).rejects.toThrow(new Error('O nome da propriedade é obrigatório.'));
  });

  it("deve lançar uma exeção com mensagem 'A capacidade máxima deve ser maior que zero.' ao criar uma property com maxGuests menor que 1.", async () => {
    const newProperty = {
      name: "Nome Teste",
      description: "Descrição teste",
      maxGuests: -1,
      basePricePerNight: 122.0
    } as CreatePropertyDTO;

    await expect(propertyService.createProperty(newProperty)).rejects.toThrow(new Error('A capacidade máxima deve ser maior que zero.'));
  });

  it.each([
    ["ausente", undefined],
    ["nulo", null],
  ])("deve rejeitar preço %s sem salvar", async (_case, price) => {
    const save = jest.spyOn(fakePropertyRepository, "save");
    const newProperty = {
      name: "Nome Teste",
      description: "Descrição teste",
      maxGuests: 3,
      ...(price === undefined ? {} : { basePricePerNight: price }),
    } as unknown as CreatePropertyDTO;

    await expect(propertyService.createProperty(newProperty)).rejects.toMatchObject({
      name: "ValidationError",
      message: "O preço base por noite é obrigatório.",
    });
    expect(save).not.toHaveBeenCalled();
  });

  it.each([
    ["zero", 0],
    ["negativo", -1],
    ["NaN", NaN],
    ["infinito", Infinity],
    ["infinito negativo", -Infinity],
    ["texto", "10"],
  ])("deve rejeitar preço %s sem salvar", async (_case, price) => {
    const save = jest.spyOn(fakePropertyRepository, "save");
    const dto = {
      name: "Nome Teste",
      description: "Descrição teste",
      maxGuests: 3,
      basePricePerNight: price,
    } as CreatePropertyDTO;

    await expect(propertyService.createProperty(dto)).rejects.toMatchObject({
      name: "ValidationError",
      message: "O preço base por noite deve ser maior que zero.",
    });
    expect(save).not.toHaveBeenCalled();
  });

  it("deve aceitar preço positivo abaixo de 0,1", async () => {
    const property = await propertyService.createProperty({
      name: "Nome Teste",
      description: "Descrição teste",
      maxGuests: 3,
      basePricePerNight: 0.05,
    });

    expect(property.getBasePricePerNight()).toBe(0.05);
    expect((await fakePropertyRepository.findById(property.getId()))?.getBasePricePerNight()).toBe(0.05);
  });
});
