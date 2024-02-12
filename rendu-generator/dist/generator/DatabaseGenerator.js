"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseGenerator = void 0;
const mysql = __importStar(require("mysql2/promise"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const ReservationGenerator_1 = __importDefault(require("./ReservationGenerator"));
class DatabaseGenerator {
    constructor(config) {
        this.config = config;
    }
    initializeDatabase(initializeScript) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('\x1b[34m%s\x1b[0m', 'Initializing database connection...');
                // conect without database to check if exists
                const connection = yield mysql.createConnection({
                    host: this.config.host,
                    user: this.config.user,
                    password: this.config.password
                });
                yield connection.query(`DROP DATABASE IF EXISTS ${this.config.database}`);
                yield connection.query(`CREATE DATABASE ${this.config.database}`);
                yield connection.end();
                this.connection = yield mysql.createConnection(this.config);
                console.log('Database connection initialized successfully.');
                console.log('\x1b[34m%s\x1b[0m', 'Running initialization script...');
                yield initializeScript(this.connection);
                console.log('Initialization script executed successfully.');
            }
            catch (error) {
                console.error('\x1b[31m%s\x1b[0m', 'Error initializing database:', error.message);
                process.exit(1);
            }
        });
    }
    seedReservations(seedScript, numberOfReservations) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('\x1b[34m%s\x1b[0m', 'Generating reservations...');
                for (let i = 0; i < numberOfReservations; i++) {
                    const reservation = (0, ReservationGenerator_1.default)();
                    yield seedScript(reservation, this.connection);
                }
                console.log('Reservations generated successfully.');
            }
            catch (error) {
                console.error('\x1b[31m%s\x1b[0m', 'Error generating reservations:', error);
                process.exit(1);
            }
        });
    }
    runStatisticsQueries(queries) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('\x1b[34m%s\x1b[0m', 'Running statistics queries...');
            if (!fs.existsSync(path.join(__dirname, '../../statistic-reports'))) {
                fs.mkdirSync(path.join(__dirname, '../../statistic-reports'));
            }
            // wrap each query in a try catch. stop if one fails
            for (let i = 0; i < queries.length; i++) {
                try {
                    console.log(`Running statistic report ${i}...`);
                    const [rows] = yield this.connection.query(queries[i]);
                    fs.writeFileSync(path.join(__dirname, `../../statistic-reports/query${i}.json`), JSON.stringify(rows, null, "\t"));
                    console.log(`Statistic report ${i} executed successfully.`);
                }
                catch (error) {
                    console.error('\x1b[31m%s\x1b[0m', `Error running statistics query ${i}:`, error.message);
                    process.exit(1);
                }
            }
            console.log('Statistics queries executed successfully.');
        });
    }
}
exports.DatabaseGenerator = DatabaseGenerator;
