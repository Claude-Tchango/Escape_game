import {Currency} from "@faker-js/faker";

declare type Pricing = {
    id: number;
    price: number;
    vat: number;
    id_room: number;
};

declare type Review = {
    text: string;
    images: string[];
};

declare type Establishment = {
    id_establishment: number;
    name: string;
    address_street: string;
    address_city: string;
    address_zip_code: string;
    address_country: string;
    phone_number: string;
    email: string;
    contact_name: string;
};

declare type Room = {
    id_room: number;
    name: string;
    description: string;
    capacity: number;
    establishment_id: number;
};

declare type Employee = {
    id_employee: number;
    employee_name: string;
    employee_firstname: string;
    employee_position: string;
};

declare type Planning = {
    id_planning: number;
    id_employee: number;
    date: string;
    start_time: string;
    end_time: string;
};

declare type VDMReservation = {
    establishmentDetails: Establishment;
    roomDetails: Room;
    user: {
        phoneNumber: string;
        firstName: string;
        lastName: string;
        email: string;
        gender: string;
        address: {
            street: string;
            zipCode: string;
            city: string;
            country: string;
        };
    };
    game: {
        id: number;
        room_id: number;
        establishment_id: number;
    };
    pricing: Array<Pricing>;
    payment: {
        id: number;
        amount: number;
        type: string;
        currency: Currency['code'];
        id_reservation: number;
    };
    employee: {
        id_employee: number;
    };
    date: string;
    duration: number;
    nbPlayers: number;
    voucher: string;
    reviews: Array<Review>;
};
