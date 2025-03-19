import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker'

const prisma = new PrismaClient()

async function main() {
    // Departments
    await prisma.department.createMany({
        data: [
            { name: 'CITET' },
            { name: 'IAD' },
            { name: 'FSD' },
            { name: 'TSD' },
            { name: 'ISD' },
            { name: 'ZOD' }
        ],
    })

    // Approval Roles
    await prisma.approvalRole.createMany({
        data: [
            { name: 'Supervisor', sequence: 1 },
            { name: 'Department Manager', sequence: 2 },
            { name: 'Auditor', sequence: 3 },
            { name: 'General Manager', sequence: 4 }
        ],
    })

    // Generate 100 mock users
    const users = Array.from({ length: 100 }, () => ({
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        role: 'USER',
    }))

    await prisma.user.createMany({ data: users })
}

main()
    .then(async () => {
        console.log('Seeding completed successfully!')
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error('Seeding failed:', e)
        await prisma.$disconnect()
        process.exit(1)
    })
