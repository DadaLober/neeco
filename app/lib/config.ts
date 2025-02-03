import sql from 'mssql';

if (!process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_SERVER || !process.env.DB_DATABASE) {
    throw new Error('Database configuration is missing.');
}

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true,
        connectTimeout: 15000,
        requestTimeout: 15000,
    }
};

export async function getConnection(): Promise<sql.ConnectionPool> {
    try {
        const pool = await sql.connect(config);
        console.log('Connected to database:', config.database);
        return pool;
    } catch (error) {
        console.error('Database connection failed:', error);
        throw error;
    }
}
