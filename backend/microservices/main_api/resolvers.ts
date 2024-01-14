import fake_data from "./fake_data";

export interface Car {
    id: string;
    name: string;
    model: number;
    description: string;
}

const getCars = (): Car[] => {
    return fake_data;
};

const getCar = ({ id }: { id: string }): Car | null => {
    const findCar = fake_data.find((car) => car.id == id);
    if (!findCar) return null;
    return findCar;
};

const updateCar = ({
    id,
    name,
    model,
    description,
}: {
    id: string;
    name?: string;
    model?: number;
    description?: string;
}) => {

    const findingCar = getCar({ id });
    if (!findingCar) return null;

    if (name) findingCar.name = name;
    if (model) findingCar.model = model;
    if (description) findingCar.description = description;

    return findingCar;
};

export default {
    getCars,
    getCar,
    updateCar
};
