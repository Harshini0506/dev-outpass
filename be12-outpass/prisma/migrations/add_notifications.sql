-- Migration: Add RoleAssignmentNotification table
-- This script adds the RoleAssignmentNotification table to track users needing role assignments

CREATE TABLE IF NOT EXISTS "RoleAssignmentNotification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userEmail" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isRead" BOOLEAN NOT NULL DEFAULT 0,
    "readAt" DATETIME
);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS "RoleAssignmentNotification_userEmail_idx" ON "RoleAssignmentNotification"("userEmail");
CREATE INDEX IF NOT EXISTS "RoleAssignmentNotification_isRead_idx" ON "RoleAssignmentNotification"("isRead");
CREATE INDEX IF NOT EXISTS "RoleAssignmentNotification_createdAt_idx" ON "RoleAssignmentNotification"("createdAt");
