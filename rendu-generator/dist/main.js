"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const DatabaseGenerator_1 = require("./generator/DatabaseGenerator");
const ReservationGenerator_1 = require("./generator/ReservationGenerator");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const employee = (0, ReservationGenerator_1.generateEmployee)();
        const NB_RESERVATIONS = 2500;
        const generator = new DatabaseGenerator_1.DatabaseGenerator({
            host: '127.0.0.1',
            user: 'root',
            password: '12345678',
            database: 'escape_game'
        });
        function getRandomTime() {
            const hours = Math.floor(Math.random() * 24);
            const minutes = Math.floor(Math.random() * 60);
            const seconds = Math.floor(Math.random() * 60);
            return [hours, minutes, seconds].map(val => val.toString().padStart(2, '0')).join(':');
        }
        function toMySQLFormat(isoDateString) {
            if (!isoDateString) {
                console.error('Aucune date fournie pour la conversion.');
                return null;
            }
            const date = new Date(isoDateString);
            if (isNaN(date.getTime())) {
                console.error('Date invalide reçue:', isoDateString);
                return null;
            }
            return date.toISOString().slice(0, 19).replace('T', ' ');
        }
        yield generator.initializeDatabase((conn) => __awaiter(this, void 0, void 0, function* () {
            // Création de la table users
            yield conn.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                first_name VARCHAR(255) NOT NULL,
                last_name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                gender VARCHAR(50),
                street VARCHAR(255),
                zip_code VARCHAR(50),
                city VARCHAR(255),
                country VARCHAR(255),
                phone_number VARCHAR(50),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
            // Création de la table establishments
            yield conn.query(`
            CREATE TABLE IF NOT EXISTS establishments (
                id_establishment INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                address_street VARCHAR(255) NOT NULL,
                address_city VARCHAR(255) NOT NULL,
                address_zip_code VARCHAR(50),
                address_country VARCHAR(500),
                phone_number VARCHAR(50),
                email VARCHAR(255),
                contact_name VARCHAR(255),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
            // Création de la table rooms
            yield conn.query(`
            CREATE TABLE IF NOT EXISTS rooms (
                id_room INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                capacity INT,
                establishment_id INT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (establishment_id) REFERENCES establishments(id_establishment)
            )
        `);
            // Création de la table reservations
            yield conn.query(`
            CREATE TABLE IF NOT EXISTS reservations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                game_id INT NOT NULL,
                date DATETIME NOT NULL,
                duration INT NOT NULL,
                nb_players INT NOT NULL,
                voucher VARCHAR(50),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
        `);
            //Création de la table games
            yield conn.query(`
            CREATE TABLE IF NOT EXISTS games (
                id INT AUTO_INCREMENT PRIMARY KEY,
                room_id INT NOT NULL,
                establishment_id INT NOT NULL,
                id_pricing INT,
                FOREIGN KEY (room_id) REFERENCES rooms(id_room),
                FOREIGN KEY (establishment_id) REFERENCES establishments(id_establishment)
                )
        `);
            //Création de la table réservations (clés secondaires NB)
            yield conn.query(`
            ALTER TABLE reservations
            ADD CONSTRAINT fk_reservations_user_id FOREIGN KEY (user_id) REFERENCES users(id)
        `);
            yield conn.query(`
            ALTER TABLE reservations 
            ADD CONSTRAINT fk_reservations_game_id FOREIGN KEY (game_id) REFERENCES games(id)
        `);
            // Création de la table pricing
            yield conn.query(`
            CREATE TABLE IF NOT EXISTS pricing (
                id INT AUTO_INCREMENT PRIMARY KEY,
                price DECIMAL(10, 2) NOT NULL,
                vat DECIMAL(10, 2) NOT NULL,
                id_room INT NOT NULL,
                FOREIGN KEY (id_room) REFERENCES rooms(id_room)
            )
        `);
            yield conn.query(`
            ALTER TABLE games
            ADD CONSTRAINT fk_games_pricing FOREIGN KEY (id_pricing) REFERENCES pricing(id)
        `);
            // Création de la table payments
            yield conn.query(`
            CREATE TABLE IF NOT EXISTS payments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                amount DECIMAL(10, 2) NOT NULL,
                currency VARCHAR(3) NOT NULL,
                type VARCHAR(50) NOT NULL,
                id_reservation INT NOT NULL,
                FOREIGN KEY (id_reservation) REFERENCES reservations(id)
            )
        `);
            // Création de la table reviews
            yield conn.query(`
            CREATE TABLE IF NOT EXISTS reviews (
                id_review INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                review_text TEXT,
                rating INT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);
            // Création de la table reviews images
            yield conn.query(`
            CREATE TABLE IF NOT EXISTS review_images (
                id_image INT AUTO_INCREMENT PRIMARY KEY,
                review_id INT NOT NULL,
                image_url VARCHAR(255) NOT NULL,
                uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (review_id) REFERENCES reviews(id_review)
            )
        `);
            // Création de la table employees
            yield conn.query(`
            CREATE TABLE IF NOT EXISTS employees (
                id_employee INT AUTO_INCREMENT PRIMARY KEY,
                employee_name VARCHAR(255) NOT NULL,
                employee_firstname VARCHAR(255) NOT NULL,
                employee_position VARCHAR(255) NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
        `);
            // Création de la table planning
            yield conn.query(`
            CREATE TABLE IF NOT EXISTS planning (
                id_planning INT AUTO_INCREMENT PRIMARY KEY,
                id_employee INT NOT NULL,
                date DATE NOT NULL,
                start_time TIME NOT NULL,
                end_time TIME NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (id_employee) REFERENCES employees(id_employee)
            )
        `);
        }));
        yield generator.seedReservations((reservation, conn) => __awaiter(this, void 0, void 0, function* () {
            let shouldContinue = true;
            const reservationDate = toMySQLFormat(reservation.date);
            if (!reservationDate) {
                console.error('Erreur: Date de réservation invalide pour', reservation);
                // Fixer une date par défaut, super solution
                const defaultDate = new Date();
                const defaultDateString = toMySQLFormat(defaultDate.toISOString());
                if (!defaultDateString) {
                    console.error('Erreur: Impossible de fixer une date par défaut.');
                    shouldContinue = false;
                }
                else {
                    reservation.date = defaultDateString;
                }
            }
            const [establishmentResult] = yield conn.query(`
            INSERT INTO establishments (name, address_street, address_city, address_zip_code, address_country, phone_number, email, contact_name)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
                reservation.establishmentDetails.name,
                reservation.establishmentDetails.address_street,
                reservation.establishmentDetails.address_city,
                reservation.establishmentDetails.address_zip_code,
                reservation.establishmentDetails.address_country,
                reservation.establishmentDetails.phone_number,
                reservation.establishmentDetails.email,
                reservation.establishmentDetails.contact_name
            ]);
            const establishmentId = establishmentResult.insertId;
            const [roomResult] = yield conn.query(`
            INSERT INTO rooms (name, description, capacity, establishment_id)
            VALUES (?, ?, ?, ?)`, [
                reservation.roomDetails.name,
                reservation.roomDetails.description,
                reservation.roomDetails.capacity,
                establishmentId
            ]);
            const roomId = roomResult.insertId;
            const [gameResult] = yield conn.query(`INSERT INTO games (room_id, establishment_id) VALUES (?, ?)`, [
                roomId,
                establishmentId
            ]);
            const gameId = gameResult.insertId;
            const [userResult] = yield conn.query(`INSERT INTO users (first_name, last_name, email, gender, street, zip_code, city, country, phone_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
                reservation.user.firstName,
                reservation.user.lastName,
                reservation.user.email,
                reservation.user.gender,
                reservation.user.address.street,
                reservation.user.address.zipCode,
                reservation.user.address.city,
                reservation.user.address.country,
                reservation.user.phoneNumber
            ]);
            const userId = userResult.insertId;
            yield conn.query(`INSERT INTO reservations (user_id, game_id, date, duration, nb_players, voucher) VALUES (?, ?, ?, ?, ?, ?)`, [
                userId,
                gameId,
                reservationDate,
                reservation.duration,
                reservation.nbPlayers,
                reservation.voucher
            ]);
            for (const price of reservation.pricing) {
                yield conn.query(`INSERT INTO pricing (price, vat, id_room) VALUES (?, ?, ?)`, [
                    price.price, price.vat, roomId
                ]);
            }
            for (const review of reservation.reviews) {
                const reviewDate = toMySQLFormat(new Date().toISOString());
                if (!reviewDate) {
                    throw new Error('Date de revue invalide.');
                }
                const [reviewResult] = yield conn.query(`
                    INSERT INTO reviews (user_id, review_text, created_at)
                    VALUES (?, ?, ?)`, [
                    userId,
                    review.text,
                    reviewDate
                ]);
                const reviewId = reviewResult.insertId;
                for (const imageUrl of review.images) {
                    yield conn.query(`
                        INSERT INTO review_images (review_id, image_url, uploaded_at)
                        VALUES (?, ?, ?)`, [
                        reviewId,
                        imageUrl,
                        reviewDate
                    ]);
                }
            }
            yield conn.query(`INSERT INTO payments (amount, currency, type, id_reservation) VALUES (?, ?, ?, ?)`, [
                reservation.payment.amount, reservation.payment.currency, reservation.payment.type, userId
            ]);
            // Insérer les données de l'employé dans la base de données
            const [employeeResult] = yield conn.query(`
            INSERT INTO employees (employee_name, employee_firstname, employee_position)
            VALUES (?, ?, ?)`, [
                employee.employee_name,
                employee.employee_firstname,
                employee.employee_position
            ]);
            const employeeId = employeeResult.insertId;
            // Insérer les données de planning
            yield conn.query(`INSERT INTO planning (id_employee, date, start_time, end_time) VALUES (?, ?, ?, ?)`, [
                employeeId,
                reservationDate,
                getRandomTime(),
                getRandomTime()
            ]);
        }), NB_RESERVATIONS);
        yield generator.runStatisticsQueries([
            //nombre total de réservation par utilisateur
            //Cette requête sélectionne l'identifiant de chaque utilisateur et le nombre total de réservations
            // effectuées par cet utilisateur, elle regroupe les résultats par user_id pour obtenir le total des réservations
            // de chaque utilisateur
            `SELECT user_id, COUNT(*) as total_reservations FROM reservations GROUP BY user_id;`,
            //moyenne de joueurs par réservation
            //Cette requête calcule la moyenne du nombre de joueurs pour toutes les réservations
            // elle utilise la fonction AVG pour obtenir la moyenne de joueurs par réservation à partir de la table des réservations.
            `SELECT AVG(nb_players) as average_players FROM reservations;`,
            //réservations par établissement
            //Cette requête vise à déterminer le nombre de réservations effectuées pour chaque établissement.
            // Elle joint trois tables : les réservations, les jeux  et les établissements
            // en utilisant les identifiants appropriés pour effectuer les jointures.
            // Ensuite, elle regroupe les résultats par l'identifiant de l'établissement et compte
            // le nombre de réservations pour chaque établissement.
            `SELECT e.name, COUNT(*) as reservation_count
         FROM reservations r
                  JOIN games g ON r.game_id = g.id
                  JOIN establishments e ON g.establishment_id = e.id_establishment
         GROUP BY e.id_establishment;
        `,
            //les chambres les plus réservées
            //cette requête identifies les cinq chambres les plus réservées Elle joint les tables des réservations et des jeux
            // pour accéder aux données nécessaires. Les résultats sont groupés par room_id et ordonnés par le nombre de réservations en ordre décroissant,
            // avec une limite de cinq résultats pour se concentrer sur les chambres les plus populaires.
            `SELECT room_id, COUNT(*) as reservation_count
         FROM reservations r
                  JOIN games g ON r.game_id = g.id
         GROUP BY room_id
         ORDER BY reservation_count DESC
             LIMIT 5;
        `,
            //Statistiques sur les paiements
            //cette requête calcule la moyenne et le total des montants des paiements regroupés par type de paiement
            `SELECT type, AVG(amount) as average_amount, SUM(amount) as total_amount FROM payments GROUP BY type;

        `,
        ]);
        yield generator.connection.end();
        console.log('\x1b[32m%s\x1b[0m', 'Database successfully seeded.');
        process.exit(0);
    });
}
main();
