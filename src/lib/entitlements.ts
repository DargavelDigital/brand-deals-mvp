import { Plan } from '@prisma/client';

export function hasPro(plan: Plan) {
  return plan === 'PRO' || plan === 'AGENCY';
}
export function hasAgency(plan: Plan) {
  return plan === 'AGENCY';
}
