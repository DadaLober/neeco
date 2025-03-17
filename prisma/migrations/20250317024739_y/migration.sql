/*
  Warnings:

  - You are about to drop the `Item` table. If the table is not empty, all the data it contains will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[User] ADD [approvalRoleId] NVARCHAR(1000),
[departmentId] NVARCHAR(1000);

-- DropTable
DROP TABLE [dbo].[Item];

-- CreateTable
CREATE TABLE [dbo].[Department] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [Department_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Department_name_key] UNIQUE NONCLUSTERED ([name])
);

-- CreateTable
CREATE TABLE [dbo].[Documents] (
    [id] NVARCHAR(1000) NOT NULL,
    [referenceNo] NVARCHAR(1000) NOT NULL,
    [itemType] NVARCHAR(1000) NOT NULL,
    [itemStatus] NVARCHAR(1000) NOT NULL,
    [purpose] NVARCHAR(1000) NOT NULL,
    [supplier] NVARCHAR(1000) NOT NULL,
    [oic] BIT NOT NULL CONSTRAINT [Documents_oic_df] DEFAULT 0,
    [date] DATETIME2 NOT NULL,
    [departmentId] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [Documents_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Documents_referenceNo_key] UNIQUE NONCLUSTERED ([referenceNo])
);

-- CreateTable
CREATE TABLE [dbo].[ApprovalRole] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [sequence] INT NOT NULL,
    CONSTRAINT [ApprovalRole_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [ApprovalRole_name_key] UNIQUE NONCLUSTERED ([name]),
    CONSTRAINT [ApprovalRole_sequence_key] UNIQUE NONCLUSTERED ([sequence])
);

-- CreateTable
CREATE TABLE [dbo].[ApprovalStep] (
    [id] NVARCHAR(1000) NOT NULL,
    [documentId] NVARCHAR(1000) NOT NULL,
    [roleId] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000),
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [ApprovalStep_status_df] DEFAULT 'pending',
    [approvedAt] DATETIME2,
    CONSTRAINT [ApprovalStep_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[User] ADD CONSTRAINT [User_departmentId_fkey] FOREIGN KEY ([departmentId]) REFERENCES [dbo].[Department]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[User] ADD CONSTRAINT [User_approvalRoleId_fkey] FOREIGN KEY ([approvalRoleId]) REFERENCES [dbo].[ApprovalRole]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Documents] ADD CONSTRAINT [Documents_departmentId_fkey] FOREIGN KEY ([departmentId]) REFERENCES [dbo].[Department]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ApprovalStep] ADD CONSTRAINT [ApprovalStep_documentId_fkey] FOREIGN KEY ([documentId]) REFERENCES [dbo].[Documents]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[ApprovalStep] ADD CONSTRAINT [ApprovalStep_roleId_fkey] FOREIGN KEY ([roleId]) REFERENCES [dbo].[ApprovalRole]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[ApprovalStep] ADD CONSTRAINT [ApprovalStep_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
