/*
  Warnings:

  - You are about to drop the column `empId` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `time` on the `Item` table. All the data in the column will be lost.
  - Added the required column `itemStatus` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `purpose` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `supplier` to the `Item` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Item] DROP COLUMN [empId],
[status],
[time];
ALTER TABLE [dbo].[Item] ADD [itemStatus] NVARCHAR(1000) NOT NULL,
[purpose] NVARCHAR(1000) NOT NULL,
[supplier] NVARCHAR(1000) NOT NULL;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
