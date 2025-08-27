import { runRealAudit } from '../audit/index';
import { discovery } from '../discovery';
import { email } from '../email';
import { mediaPack } from '../mediaPack';
import { mockAuditService } from './mock/audit.mock';
import { mockDiscoveryService } from './mock/discovery.mock';
import { mockEmailService } from './mock/email.mock';
import { mockMediaPackService } from './mock/mediaPack.mock';

// Real providers (production)
export const realProviders = {
  audit: runRealAudit,
  discovery: discovery.run,
  email: email.send,
  mediaPack: mediaPack.generate
};

// Mock providers (development/demo)
export const mockProviders = {
  audit: mockAuditService.runAudit,
  discovery: mockDiscoveryService.discoverBrands,
  email: mockEmailService.sendEmail,
  mediaPack: mockMediaPackService.generate
};

// Provider selection based on environment
export function getProviders() {
  const isDemo = process.env.DEMO_MODE === 'true';
  return isDemo ? mockProviders : realProviders;
}

// Individual provider exports
export const auditProvider = getProviders().audit;
export const discoveryProvider = getProviders().discovery;
export const emailProvider = getProviders().email;
export const mediaPackProvider = getProviders().mediaPack;
