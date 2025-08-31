import { describe, it, expect } from 'vitest';
import { ok, fail } from './envelope';

describe('HTTP Envelope Helper', () => {
  describe('ok()', () => {
    it('should create success response with data', () => {
      const data = { id: 1, name: 'Test' };
      const result = ok(data);
      
      expect(result).toEqual({
        ok: true,
        data: { id: 1, name: 'Test' }
      });
    });

    it('should include extra fields', () => {
      const data = { id: 1 };
      const extra = { message: 'Success', count: 1 };
      const result = ok(data, extra);
      
      expect(result).toEqual({
        ok: true,
        message: 'Success',
        count: 1,
        data: { id: 1 }
      });
    });
  });

  describe('fail()', () => {
    it('should create error response with default status', () => {
      const result = fail('VALIDATION_ERROR');
      
      expect(result).toEqual({
        ok: false,
        error: 'VALIDATION_ERROR',
        status: 400
      });
    });

    it('should create error response with custom status', () => {
      const result = fail('NOT_FOUND', 404);
      
      expect(result).toEqual({
        ok: false,
        error: 'NOT_FOUND',
        status: 404
      });
    });

    it('should include extra fields', () => {
      const extra = { field: 'email', value: 'invalid' };
      const result = fail('VALIDATION_ERROR', 400, extra);
      
      expect(result).toEqual({
        ok: false,
        error: 'VALIDATION_ERROR',
        status: 400,
        field: 'email',
        value: 'invalid'
      });
    });
  });
});
