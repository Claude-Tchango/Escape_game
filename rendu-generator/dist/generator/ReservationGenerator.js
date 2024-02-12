"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateEmployee = void 0;
const faker_1 = require("@faker-js/faker");
function generatePricing(idRoom) {
    return Array.from({ length: faker_1.faker.datatype.number({ min: 1, max: 10 }) }, () => ({
        id: faker_1.faker.datatype.number(),
        price: faker_1.faker.datatype.float({ min: 10, max: 100 }),
        vat: faker_1.faker.datatype.float({ min: 5, max: 20 }),
        id_room: idRoom
    }));
}
function generateReview() {
    return Array.from({ length: faker_1.faker.datatype.number({ min: 1, max: 3 }) }, () => ({
        text: faker_1.faker.lorem.paragraphs(faker_1.faker.datatype.number({ min: 1, max: 3 })),
        images: Array.from({ length: faker_1.faker.datatype.number({ min: 0, max: 5 }) }, faker_1.faker.image.imageUrl)
    }));
}
function generateEstablishment() {
    return {
        id_establishment: faker_1.faker.datatype.number({ min: 1, max: 25 }),
        name: faker_1.faker.company.name(),
        address_street: faker_1.faker.address.streetAddress(),
        address_city: faker_1.faker.address.city(),
        address_zip_code: faker_1.faker.address.zipCode(),
        address_country: faker_1.faker.address.country(),
        phone_number: faker_1.faker.phone.number(),
        email: faker_1.faker.internet.email(),
        contact_name: faker_1.faker.name.fullName()
    };
}
function generateRoom(establishmentId) {
    return {
        id_room: faker_1.faker.datatype.number(),
        name: faker_1.faker.commerce.productName(),
        description: faker_1.faker.lorem.sentence(),
        capacity: faker_1.faker.datatype.number({ min: 1, max: 100 }),
        establishment_id: establishmentId
    };
}
function generateEmployee() {
    return {
        id_employee: faker_1.faker.datatype.number(),
        employee_name: faker_1.faker.name.lastName(),
        employee_firstname: faker_1.faker.name.firstName(),
        employee_position: faker_1.faker.name.jobTitle()
    };
}
exports.generateEmployee = generateEmployee;
function generatePlanning(idEmployee) {
    return {
        id_planning: faker_1.faker.datatype.number(),
        id_employee: idEmployee,
        date: faker_1.faker.date.future().toISOString().split('T')[0],
        start_time: faker_1.faker.date.future().toISOString().split('T')[1].split('.')[0],
        end_time: faker_1.faker.date.future().toISOString().split('T')[1].split('.')[0]
    };
}
function generateRandomReservation() {
    const establishment = generateEstablishment();
    const room = generateRoom(establishment.id_establishment);
    const employee = generateEmployee();
    const planning = generatePlanning(employee.id_employee);
    const pricing = generatePricing(room.id_room);
    const totalPrice = pricing.reduce((acc, cur) => acc + cur.price, 0);
    const idReservation = faker_1.faker.datatype.number();
    return {
        establishmentDetails: establishment,
        roomDetails: room,
        employee: employee,
        user: {
            phoneNumber: faker_1.faker.phone.number(),
            firstName: faker_1.faker.name.firstName(),
            lastName: faker_1.faker.name.lastName(),
            email: faker_1.faker.internet.email(),
            gender: faker_1.faker.name.gender(),
            address: {
                street: faker_1.faker.address.streetAddress(),
                zipCode: faker_1.faker.address.zipCode(),
                city: faker_1.faker.address.city(),
                country: faker_1.faker.address.country()
            }
        },
        game: {
            id: faker_1.faker.datatype.number(),
            room_id: room.id_room,
            establishment_id: establishment.id_establishment
        },
        pricing: pricing,
        payment: {
            id: faker_1.faker.datatype.number(),
            amount: totalPrice,
            currency: faker_1.faker.finance.currencyCode(),
            type: faker_1.faker.finance.transactionType(),
            id_reservation: idReservation
        },
        date: faker_1.faker.date.soon().toISOString(),
        duration: faker_1.faker.datatype.number({ min: 10, max: 100 }),
        nbPlayers: pricing.length,
        voucher: faker_1.faker.lorem.word(),
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
exports.default = generateRandomReservation;
//const multipleReservations = generateMultipleReservations(1000);
//console.log(`Generated ${multipleReservations.length} reservations.`);
