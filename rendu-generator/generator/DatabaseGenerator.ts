import * as mysql from 'mysql2/promise';
import * as fs from "fs";
import * as path from "path";
import generateRandomReservation from "./ReservationGenerator";
import {VDMReservation} from "../types";

export class DatabaseGenerator {
    public connection: mysql.Connection;

    constructor(private config: mysql.ConnectionOptions) {
    }

    public async initializeDatabase(initializeScript: (conn: mysql.Connection) => Promise<void>): Promise<void> {
        try {
            console.log('\x1b[34m%s\x1b[0m', 'Initializing database connection...');
            // conect without database to check if exists
            const connection: mysql.Connection = await mysql.createConnection({
                host: this.config.host,
                user: this.config.user,
                password: this.config.password
            });

            await connection.query(`DROP DATABASE IF EXISTS ${this.config.database}`);
            await connection.query(`CREATE DATABASE ${this.config.database}`);
            await connection.end();

            this.connection = await mysql.createConnection(this.config);
            console.log('Database connection initialized successfully.');

            console.log('\x1b[34m%s\x1b[0m', 'Running initialization script...');
            await initializeScript(this.connection);
            console.log('Initialization script executed successfully.');
        } catch (error) {
            console.error('\x1b[31m%s\x1b[0m', 'Error initializing database:', error.message);
            process.exit(1);
        }
    }

    public async seedReservations(seedScript: (reservation: VDMReservation, conn: mysql.Connection) => Promise<void>, numberOfReservations: number): Promise<void> {
        try {
            console.log('\x1b[34m%s\x1b[0m', 'Generating reservations...');

            for (let i: number = 0; i < numberOfReservations; i++) {
                const reservation: VDMReservation = generateRandomReservation();
                await seedScript(reservation, this.connection);
            }

            console.log('Reservations generated successfully.');
        } catch (error) {
            console.error('\x1b[31m%s\x1b[0m', 'Error generating reservations:', error);
            process.exit(1);
        }
    }

    public async runStatisticsQueries(queries: string[]): Promise<void> {
        console.log('\x1b[34m%s\x1b[0m', 'Running statistics queries...');

        if (!fs.existsSync(path.join(__dirname, '../../statistic-reports'))) {
            fs.mkdirSync(path.join(__dirname, '../../statistic-reports'));
        }

        // wrap each query in a try catch. stop if one fails
        for (let i: number = 0; i < queries.length; i++) {
            try {
                console.log(`Running statistic report ${i}...`);
                const [rows] = await this.connection.query(queries[i]);
                fs.writeFileSync(path.join(__dirname, `../../statistic-reports/query${i}.json`), JSON.stringify(rows, null, "\t"));
                console.log(`Statistic report ${i} executed successfully.`);

            } catch (error) {
                console.error('\x1b[31m%s\x1b[0m', `Error running statistics query ${i}:`, error.message);
                process.exit(1);
            }
        }

        console.log('Statistics queries executed successfully.');

    }
}
