/*
  Warnings:

  - Made the column `role` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[User] DROP CONSTRAINT [User_role_df];
ALTER TABLE [dbo].[User] ALTER COLUMN [role] NVARCHAR(1000) NOT NULL;
ALTER TABLE [dbo].[User] ADD CONSTRAINT [User_role_df] DEFAULT 'USER' FOR [role];
ALTER TABLE [dbo].[User] ADD [isActive] BIT NOT NULL CONSTRAINT [User_isActive_df] DEFAULT 1,
[lastLogin] DATETIME2,
[loginAttempts] INT NOT NULL CONSTRAINT [User_loginAttempts_df] DEFAULT 0;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
