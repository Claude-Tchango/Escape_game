import { faker } from '@faker-js/faker';
import { Pricing, VDMReservation, Review, Establishment, Room, Employee, Planning } from "../types";

function generatePricing(idRoom: number): Pricing[] {
    return Array.from({ length: faker.datatype.number({ min: 1, max: 10 }) }, () => ({
        id: faker.datatype.number(),
        price: faker.datatype.float({ min: 10, max: 100 }),
        vat: faker.datatype.float({ min: 5, max: 20 }),
        id_room: idRoom
    }));
}

function generateReview(): Review[] {
    return Array.from({ length: faker.datatype.number({ min: 1, max: 3 }) }, () => ({
        text: faker.lorem.paragraphs(faker.datatype.number({ min: 1, max: 3 })),
        images: Array.from({ length: faker.datatype.number({ min: 0, max: 5 }) }, faker.image.imageUrl)
    }));
}

function generateEstablishment(): Establishment {
    return {
        id_establishment: faker.datatype.number({ min: 1, max: 25 }),
        name: faker.company.name(),
        address_street: faker.address.streetAddress(),
        address_city: faker.address.city(),
        address_zip_code: faker.address.zipCode(),
        address_country: faker.address.country(),
        phone_number: faker.phone.number(),
        email: faker.internet.email(),
        contact_name: faker.name.fullName()
    };
}

function generateRoom(establishmentId: number): Room {
    return {
        id_room: faker.datatype.number(),
        name: faker.commerce.productName(),
        description: faker.lorem.sentence(),
        capacity: faker.datatype.number({ min: 1, max: 100 }),
        establishment_id: establishmentId
    };
}

export function generateEmployee(): Employee {
    return {
        id_employee: faker.datatype.number(),
        employee_name: faker.name.lastName(),
        employee_firstname: faker.name.firstName(),
        employee_position: faker.name.jobTitle()
    };
}

function generatePlanning(idEmployee: number): Planning {
    return {
        id_planning: faker.datatype.number(),
        id_employee: idEmployee,
        date: faker.date.future().toISOString().split('T')[0],
        start_time: faker.date.future().toISOString().split('T')[1].split('.')[0],
        end_time: faker.date.future().toISOString().split('T')[1].split('.')[0]
    };
}

function generateRandomReservation(): VDMReservation {
    const establishment = generateEstablishment();
    const room = generateRoom(establishment.id_establishment);
    const employee = generateEmployee();
    const planning = generatePlanning(employee.id_employee);
    const pricing = generatePricing(room.id_room);
    const totalPrice = pricing.reduce((acc, cur) => acc + cur.price, 0);
    const idReservation = faker.datatype.number();

    return {
        establishmentDetails: establishment,
        roomDetails: room,
        employee: employee,
        user: {
            phoneNumber: faker.phone.number(),
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName(),
            email: faker.internet.email(),
            gender: faker.name.gender(),
            address: {
                street: faker.address.streetAddress(),
                zipCode: faker.address.zipCode(),
                city: faker.address.city(),
                country: faker.address.country()
            }
        },
        game: {
            id: faker.datatype.number(),
            room_id: room.id_room,
            establishment_id: establishment.id_establishment
        },
        pricing: pricing,
        payment: {
            id: faker.datatype.number(),
            amount: totalPrice,
            currency: faker.finance.currencyCode(),
            type: faker.finance.transactionType(),
            id_reservation: idReservation
        },
        date: faker.date.soon().toISOString(),
        duration: faker.datatype.number({ min: 10, max: 100 }),
        nbPlayers: pricing.length,
        voucher: faker.lorem.word(),
        reviews: generateReview()
    };

}
//export function generateMultipleReservations(count: number) {
//    const reservations = [];
//    for (let i = 0; i < count; i++) {
//        reservations.push(generateRandomReservation());
//    }
//    return reservations;
//}

export default generateRandomReservation;

//const multipleReservations = generateMultipleReservations(1000);
//console.log(`Generated ${multipleReservations.length} reservations.`);
