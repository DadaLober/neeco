BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Department] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [Department_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Department_name_key] UNIQUE NONCLUSTERED ([name])
);

-- CreateTable
CREATE TABLE [dbo].[User] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [email] NVARCHAR(1000) NOT NULL,
    [password] NVARCHAR(1000) NOT NULL,
    [role] NVARCHAR(1000) NOT NULL,
    [image] NVARCHAR(1000),
    [is2FAEnabled] BIT NOT NULL CONSTRAINT [User_is2FAEnabled_df] DEFAULT 0,
    [twoFASecret] NVARCHAR(1000),
    [departmentId] INT,
    [approvalRoleId] INT,
    [isActive] BIT NOT NULL CONSTRAINT [User_isActive_df] DEFAULT 1,
    [lastLogin] DATETIME2,
    [loginAttempts] INT NOT NULL CONSTRAINT [User_loginAttempts_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [User_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [User_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [User_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[Documents] (
    [id] NVARCHAR(1000) NOT NULL,
    [referenceNo] NVARCHAR(1000) NOT NULL,
    [documentType] NVARCHAR(1000) NOT NULL,
    [documentStatus] NVARCHAR(1000) NOT NULL,
    [purpose] NVARCHAR(1000) NOT NULL,
    [supplier] NVARCHAR(1000) NOT NULL,
    [oic] BIT NOT NULL CONSTRAINT [Documents_oic_df] DEFAULT 0,
    [date] DATETIME2 NOT NULL,
    [departmentId] INT,
    CONSTRAINT [Documents_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Documents_referenceNo_key] UNIQUE NONCLUSTERED ([referenceNo])
);

-- CreateTable
CREATE TABLE [dbo].[ApprovalRole] (
    [id] INT NOT NULL IDENTITY(1,1),
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
    [roleId] INT NOT NULL,
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
