import { prisma } from '@/lib/prisma';
import { UnauthorizedResponse } from '@/schemas';
import { User, Documents, Department, ApprovalRole, Prisma } from '@prisma/client';

export type EditableUser = Prisma.UserGetPayload<{
    select: {
        id: true;
        name: true;
        email: true;
        role: true;
        departmentId: true;
        approvalRoleId: true;
    };
}>;

export type EditableDocument = Prisma.DocumentsGetPayload<{
    select: {
        id: true;
        referenceNo: true;
        documentType: true;
        documentStatus: true;
        purpose: true;
        supplier: true;
        oic: true;
        date: true;
        departmentId: true;
    };
}>;

export type UserWithRelations = Prisma.UserGetPayload<{
    select: {
        id: true;
        name: true;
        email: true;
        role: true;
        lastLogin: true;
        loginAttempts: true;
        departmentId: true;
        approvalRoleId: true;
        image: true;
        department: { select: { id: true, name: true } };
        approvalRole: { select: { id: true, name: true, sequence: true } };
    };
}>;

export type DocumentWithRelations = Prisma.DocumentsGetPayload<{
    select: {
        id: true
        referenceNo: true
        documentType: true
        documentStatus: true
        purpose: true
        supplier: true
        oic: true
        date: true
        departmentId: true
        department: { select: { id: true, name: true } }
    }
}>;

//Database functions
export async function getAllUsersQuery(): Promise<UserWithRelations[]> {
    return await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            lastLogin: true,
            loginAttempts: true,
            image: true,
            departmentId: true,
            approvalRoleId: true,
            department: {
                select: {
                    id: true,
                    name: true,
                }
            },
            approvalRole: {
                select: {
                    id: true,
                    name: true,
                    sequence: true,
                }
            }
        }
    })
}

export async function deleteUserQuery(userId: string): Promise<User> {
    return await prisma.user.delete({
        where: { id: userId },
    });
}

export async function updateUserQuery(userId: string, data: EditableUser): Promise<EditableUser> {
    return await prisma.user.update({
        where: { id: userId },
        data: data
    });
}

export async function getUserByEmailQuery(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
        where: { email: email },
    })
}

export async function getUserByIDQuery(userId: string): Promise<User & { twoFASecret: string | null } | null> {
    return await prisma.user.findUnique({
        where: { id: userId },
    });
}

export async function setLastLoginQuery(email: string): Promise<User> {
    return await prisma.user.update({
        where: { email: email },
        data: { lastLogin: new Date() }
    });
}

export async function setLoginAttemptsQuery(email: string): Promise<User> {
    return await prisma.user.update({
        where: { email: email },
        data: { loginAttempts: { increment: 1 } }
    });
}

export async function createUserInQuery(name: string, email: string, password: string): Promise<User> {
    return await prisma.user.create({
        data: {
            name: name,
            email: email,
            password: password,
        },
    });
}

export async function getAllDocumentsQuery(): Promise<DocumentWithRelations[]> {
    return await prisma.documents.findMany({
        select: {
            id: true,
            referenceNo: true,
            documentType: true,
            documentStatus: true,
            purpose: true,
            supplier: true,
            oic: true,
            date: true,
            departmentId: true,
            department: {
                select: {
                    id: true,
                    name: true,
                }
            },
        },
        orderBy: { date: 'desc' }
    });
}

export async function setDocumentsQuery(documents: Omit<EditableDocument, 'id'>[]): Promise<number> {
    try {
        let insertedCount = 0;

        await prisma.$transaction(async (tx) => {
            for (const doc of documents) {
                const { ...docData } = doc;

                const createdDoc = await tx.documents.create({
                    data: docData
                });

                if (doc.departmentId) {
                    const approvers = await tx.user.findMany({
                        where: {
                            departmentId: doc.departmentId,
                            NOT: { approvalRoleId: null }
                        },
                        include: {
                            approvalRole: true
                        },
                        orderBy: {
                            approvalRole: {
                                sequence: 'asc'
                            }
                        }
                    });

                    const allRoles = await tx.approvalRole.findMany({
                        orderBy: { sequence: 'asc' }
                    });

                    const assignedRoleIds = new Set();

                    for (const approver of approvers) {
                        await tx.approvalStep.create({
                            data: {
                                documentId: createdDoc.id,
                                roleId: approver.approvalRoleId!,
                                userId: approver.id,
                                status: 'pending'
                            }
                        });

                        assignedRoleIds.add(approver.approvalRoleId);
                    }

                    for (const role of allRoles) {
                        if (!assignedRoleIds.has(role.id)) {
                            await tx.approvalStep.create({
                                data: {
                                    documentId: createdDoc.id,
                                    roleId: role.id,
                                    status: 'pending'
                                }
                            });
                        }
                    }
                }

                insertedCount++;
            }
        });

        return insertedCount;
    } catch (error) {
        console.error("Database error adding documents:", error);
        throw error;
    }
}

export async function setup2FAInDB(userId: string, twoFASecret: string): Promise<User> {
    return await prisma.user.update({
        where: { id: userId },
        data: {
            twoFASecret: twoFASecret
        },
    });
}

export async function verify2FAInDB(userId: string): Promise<User> {
    return await prisma.user.update({
        where: { id: userId },
        data: { is2FAEnabled: true },
    });
}

export async function disable2FAInDB(userId: string): Promise<User> {
    return prisma.user.update({
        where: { id: userId },
        data: { is2FAEnabled: false, twoFASecret: null },
    });
}

export async function getAllDepartmentsQuery(): Promise<Department[]> {
    return prisma.department.findMany({
        select: {
            id: true,
            name: true,
        }
    });
}

export async function getAllApprovalRolesQuery(): Promise<ApprovalRole[]> {
    return prisma.approvalRole.findMany({
        select: {
            id: true,
            name: true,
            sequence: true,
        }
    });
}