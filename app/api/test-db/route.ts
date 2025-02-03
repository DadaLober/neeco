import { NextResponse } from 'next/server';
import { getConnection } from '@/app/lib/db-config';

export async function GET() {
    const pool = await getConnection();
    const result = await pool.request().query(`SELECT 1 as test`);
    return NextResponse.json(result.recordset);
}