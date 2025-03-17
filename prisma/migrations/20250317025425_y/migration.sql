/*
  Warnings:

  - You are about to drop the column `itemStatus` on the `Documents` table. All the data in the column will be lost.
  - You are about to drop the column `itemType` on the `Documents` table. All the data in the column will be lost.
  - Added the required column `documentStatus` to the `Documents` table without a default value. This is not possible if the table is not empty.
  - Added the required column `documentType` to the `Documents` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Documents] DROP COLUMN [itemStatus],
[itemType];
ALTER TABLE [dbo].[Documents] ADD [documentStatus] NVARCHAR(1000) NOT NULL,
[documentType] NVARCHAR(1000) NOT NULL;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
