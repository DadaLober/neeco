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

    // Generate mock users
    const users = Array.from({ length: 100 }, () => ({
        id: faker.string.uuid(),
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        role: 'USER',
        departmentId: Math.floor(Math.random() * 6) + 1,
        approvalRoleId: Math.random() > 0.7 ? Math.floor(Math.random() * 4) + 1 : null,
        lastLogin: faker.date.recent(),
    }))

    await prisma.user.createMany({ data: users })
    const allUsers = await prisma.user.findMany()

    // Generate mock documents
    const documentTypes = ['APV', 'BOM', 'BR', 'CA', 'COC', 'CV', 'ICT', 'IS', 'KMCT', 'MC', 'MRV', 'PM',
        'PO', 'RET', 'RM', 'RR', 'RS', 'RV', 'SA', 'SOP', 'ST', 'TMZ', 'TO', 'TOA']
    const purposes = ['Procurement', 'Maintenance', 'Project', 'Operations', 'Human Resources', 'Training']

    for (let i = 0; i < 250; i++) {
        const docType = documentTypes[Math.floor(Math.random() * documentTypes.length)]
        const departmentId = Math.floor(Math.random() * 6) + 1

        // Determine document outcome
        const statusRoll = Math.random()
        const docStatus = statusRoll < 0.3 ? 'Approved' : statusRoll < 0.5 ? 'Rejected' : 'Pending'
        const rejectionStep = docStatus === 'Rejected' ? Math.floor(Math.random() * 4) + 1 : null

        const document = await prisma.documents.create({
            data: {
                referenceNo: `DOC-${faker.string.alphanumeric(8).toUpperCase()}`,
                documentType: docType,
                documentStatus: 'Pending', // Temporary status, updated later
                purpose: purposes[Math.floor(Math.random() * purposes.length)],
                supplier: faker.company.name(),
                oic: Math.random() > 0.8,
                date: faker.date.recent({ days: 90 }),
                departmentId,
            },
        })

        // Create approval steps
        const approvalRoles = await prisma.approvalRole.findMany({ orderBy: { sequence: 'asc' } })

        for (const role of approvalRoles) {
            const eligibleUsers = allUsers.filter(
                user => user.approvalRoleId === role.id && user.departmentId === departmentId
            )
            const userId = eligibleUsers.length > 0 ? eligibleUsers[Math.floor(Math.random() * eligibleUsers.length)].id : null

            let stepStatus: string
            let approvedAt: Date | null = null

            if (docStatus === 'Approved') {
                stepStatus = 'approved'
                approvedAt = faker.date.recent({ days: 30 })
            } else if (docStatus === 'Rejected') {
                if (role.sequence === rejectionStep) {
                    stepStatus = 'rejected'
                } else if (role.sequence < rejectionStep!) {
                    stepStatus = 'approved'
                    approvedAt = faker.date.recent({ days: 30 })
                } else {
                    stepStatus = 'pending'
                }
            } else { // Pending
                const approvedUpTo = Math.floor(Math.random() * 4)
                stepStatus = role.sequence <= approvedUpTo ? 'approved' : 'pending'
                approvedAt = stepStatus === 'approved' ? faker.date.recent({ days: 30 }) : null
            }

            await prisma.approvalStep.create({
                data: {
                    documentId: document.id,
                    roleId: role.id,
                    userId,
                    status: stepStatus,
                    approvedAt,
                }
            })
        }

        // Update document status after creating steps
        await prisma.documents.update({
            where: { id: document.id },
            data: { documentStatus: docStatus }
        })
    }
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