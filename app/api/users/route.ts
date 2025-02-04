import { NextResponse } from 'next/server';
import { getConnection } from '@/app/lib/db-config';

export async function GET() {
    try {
        const pool = await getConnection();
        const result = await pool.request().query(`SELECT * FROM dbo.users`);
        return NextResponse.json({ users: result.recordset });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();
        const pool = await getConnection();
        const result = await pool.request()
            .input('email', email)
            .input('password', password)
            .query(`INSERT INTO dbo.users (email, password) VALUES (@email, @password)`);

        return NextResponse.json({ message: 'User created successfully' }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { id } = await request.json();
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', id)
            .query(`DELETE FROM dbo.users WHERE id = @email`);

        return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
}
