import { log } from '@/lib/logger';

describe('Logger PII Redaction', () => {
  test('redacts emails', () => {
    const msg = 'Contact me at jane@example.com or support@company.org';
    const rec = (log as any).formatters.log({ msg });
    expect(rec.msg).not.toMatch(/example\.com|company\.org/);
    expect(rec.msg).toMatch(/\[redacted-email\]/);
  });

  test('redacts phone numbers', () => {
    const msg = 'Call me at +1 (555) 123-4567 or 555-987-6543';
    const rec = (log as any).formatters.log({ msg });
    expect(rec.msg).not.toMatch(/555|123|4567|987|6543/);
    expect(rec.msg).toMatch(/\[redacted-phone\]/);
  });

  test('redacts multiple PII in same message', () => {
    const msg = 'Email: john@test.com, Phone: +44 20 7946 0958';
    const rec = (log as any).formatters.log({ msg });
    expect(rec.msg).toMatch(/\[redacted-email\].*\[redacted-phone\]/);
  });

  test('preserves non-PII content', () => {
    const msg = 'Hello world, this is a normal message';
    const rec = (log as any).formatters.log({ msg });
    expect(rec.msg).toBe('Hello world, this is a normal message');
  });

  test('handles empty message', () => {
    const rec = (log as any).formatters.log({ msg: '' });
    expect(rec.msg).toBe('');
  });

  test('handles message without PII', () => {
    const msg = 'Just some regular text with numbers 123 and symbols @#$';
    const rec = (log as any).formatters.log({ msg });
    expect(rec.msg).toBe(msg);
  });
});
