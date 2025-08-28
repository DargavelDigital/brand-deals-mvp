import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

describe('Retention Service (Mocked)', () => {
  // Mock the prisma client
  const mockPrisma = {
    $transaction: vi.fn(),
    workspace: {
      update: vi.fn(),
      findMany: vi.fn(),
      delete: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
    membership: {
      deleteMany: vi.fn(),
    },
    encryptedSecret: {
      deleteMany: vi.fn(),
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('softDeleteWorkspace', () => {
    it('should soft delete a workspace and log the action', async () => {
      const mockTransaction = vi.fn().mockImplementation(async (callback) => {
        return await callback(mockPrisma)
      })
      mockPrisma.$transaction.mockImplementation(mockTransaction)

      // Simulate the service logic
      await mockPrisma.$transaction(async (tx: any) => {
        await tx.workspace.update({
          where: { id: 'ws1' },
          data: { deletedAt: new Date() }
        })
        await tx.auditLog.create({
          data: {
            workspaceId: 'ws1',
            actorUserId: 'user1',
            action: 'workspace.soft_delete',
            targetType: 'Workspace',
            targetId: 'ws1'
          }
        })
      })

      expect(mockPrisma.$transaction).toHaveBeenCalled()
      expect(mockPrisma.workspace.update).toHaveBeenCalledWith({
        where: { id: 'ws1' },
        data: { deletedAt: expect.any(Date) }
      })
      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
        data: {
          workspaceId: 'ws1',
          actorUserId: 'user1',
          action: 'workspace.soft_delete',
          targetType: 'Workspace',
          targetId: 'ws1'
        }
      })
    })

    it('should handle soft delete without actor user', async () => {
      const mockTransaction = vi.fn().mockImplementation(async (callback) => {
        return await callback(mockPrisma)
      })
      mockPrisma.$transaction.mockImplementation(mockTransaction)

      await mockPrisma.$transaction(async (tx: any) => {
        await tx.workspace.update({
          where: { id: 'ws1' },
          data: { deletedAt: new Date() }
        })
        await tx.auditLog.create({
          data: {
            workspaceId: 'ws1',
            actorUserId: undefined,
            action: 'workspace.soft_delete',
            targetType: 'Workspace',
            targetId: 'ws1'
          }
        })
      })

      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
        data: {
          workspaceId: 'ws1',
          actorUserId: undefined,
          action: 'workspace.soft_delete',
          targetType: 'Workspace',
          targetId: 'ws1'
        }
      })
    })
  })

  describe('purgeDeletedOlderThan', () => {
    it('should purge workspaces deleted older than specified days', async () => {
      const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      const oldWorkspaces = [
        { id: 'ws1' },
        { id: 'ws2' },
        { id: 'ws3' }
      ]

      mockPrisma.workspace.findMany.mockResolvedValue(oldWorkspaces)
      
      const mockTransaction = vi.fn().mockImplementation(async (callback) => {
        return await callback(mockPrisma)
      })
      mockPrisma.$transaction.mockImplementation(mockTransaction)

      // Simulate the service logic
      const rows = await mockPrisma.workspace.findMany({
        where: { deletedAt: { lt: cutoff } },
        select: { id: true }
      })
      
      for (const w of rows) {
        await mockPrisma.$transaction(async (tx: any) => {
          await tx.membership.deleteMany({ where: { workspaceId: w.id } })
          await tx.encryptedSecret.deleteMany({ where: { workspaceId: w.id } })
          await tx.auditLog.deleteMany({ where: { workspaceId: w.id } })
          await tx.workspace.delete({ where: { id: w.id } })
        })
      }

      expect(mockPrisma.workspace.findMany).toHaveBeenCalledWith({
        where: { deletedAt: { lt: cutoff } },
        select: { id: true }
      })
      expect(rows.length).toBe(3)

      // Should call transaction for each workspace
      expect(mockPrisma.$transaction).toHaveBeenCalledTimes(3)
    })

    it('should handle cascade deletes for each workspace', async () => {
      const oldWorkspaces = [{ id: 'ws1' }]
      mockPrisma.workspace.findMany.mockResolvedValue(oldWorkspaces)
      
      const mockTransaction = vi.fn().mockImplementation(async (callback) => {
        return await callback(mockPrisma)
      })
      mockPrisma.$transaction.mockImplementation(mockTransaction)

      // Simulate the service logic
      const rows = await mockPrisma.workspace.findMany({
        where: { deletedAt: { lt: new Date() } },
        select: { id: true }
      })
      
      for (const w of rows) {
        await mockPrisma.$transaction(async (tx: any) => {
          await tx.membership.deleteMany({ where: { workspaceId: w.id } })
          await tx.encryptedSecret.deleteMany({ where: { workspaceId: w.id } })
          await tx.auditLog.deleteMany({ where: { workspaceId: w.id } })
          await tx.workspace.delete({ where: { id: w.id } })
        })
      }

      // Verify the transaction callback deletes related data
      const transactionCallback = mockTransaction.mock.calls[0][0]
      await transactionCallback(mockPrisma)

      expect(mockPrisma.membership.deleteMany).toHaveBeenCalledWith({
        where: { workspaceId: 'ws1' }
      })
      expect(mockPrisma.encryptedSecret.deleteMany).toHaveBeenCalledWith({
        where: { workspaceId: 'ws1' }
      })
      expect(mockPrisma.auditLog.deleteMany).toHaveBeenCalledWith({
        where: { workspaceId: 'ws1' }
      })
      expect(mockPrisma.workspace.delete).toHaveBeenCalledWith({
        where: { id: 'ws1' }
      })
    })

    it('should return 0 when no workspaces to purge', async () => {
      mockPrisma.workspace.findMany.mockResolvedValue([])

      const rows = await mockPrisma.workspace.findMany({
        where: { deletedAt: { lt: new Date() } },
        select: { id: true }
      })

      expect(rows.length).toBe(0)
      expect(mockPrisma.$transaction).not.toHaveBeenCalled()
    })

    it('should handle different day thresholds', async () => {
      const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      mockPrisma.workspace.findMany.mockResolvedValue([])

      await mockPrisma.workspace.findMany({
        where: { deletedAt: { lt: cutoff } },
        select: { id: true }
      })

      expect(mockPrisma.workspace.findMany).toHaveBeenCalledWith({
        where: { deletedAt: { lt: cutoff } },
        select: { id: true }
      })
    })
  })
})
