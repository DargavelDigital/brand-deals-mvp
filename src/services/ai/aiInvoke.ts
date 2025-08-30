import { computeBias, getRecentDownRate, hardToneOverride } from './feedbackBias';
import { isOn } from '@/config/flags';
import { aiInvoke as originalAiInvoke } from '@/ai/invoke';

type InvokeOpts = {
  workspaceId: string;
  tone?: 'professional' | 'relaxed' | 'fun';
  model?: string;
  traceId?: string;
};

export async function aiInvoke(
  key: string,
  input: any,
  opts: InvokeOpts
): Promise<any> {
  // Start with original AI invoke
  let system = '';
  let style: any = {};
  let fewshots: any[] = [];

  // If feedback adaptation is enabled, compute bias and merge it
  if (isOn('ai.adapt.feedback')) {
    try {
      const bias = await computeBias(opts.workspaceId);
      
      // Log bias application for observability
      const biasKeysApplied: Record<string, any> = {};
      
      if (key.startsWith('outreach.')) {
        const tone = opts.tone ?? bias.outreach?.toneBias;
        if (tone) {
          style.tone = tone;
          biasKeysApplied.outreachTone = tone;
        }

        // Check for hard tone override based on recent negative feedback
        const recentDownRate = await getRecentDownRate(opts.workspaceId, 'OUTREACH', 24);
        const hardOverride = hardToneOverride(bias, recentDownRate);
        if (hardOverride && !opts.tone) {
          style.tone = hardOverride;
          biasKeysApplied.hardToneOverride = hardOverride;
          system += '\n# Safety Override\nHigh negative feedback detected; using professional tone safeguard.';
        }

        const dos = bias.outreach?.do?.length
          ? `Prefer these notions/phrases when natural: ${bias.outreach.do.join(', ')}.`
          : '';
        const donts = bias.outreach?.dont?.length
          ? `Avoid these notions/phrases: ${bias.outreach.dont.join(', ')}.`
          : '';
        const nudge = bias.outreach?.nudge ? `Global nudge: ${bias.outreach.nudge}` : '';
        
        if (dos || donts || nudge) {
          system += `\n# Adaptation\n${dos}\n${donts}\n${nudge}`.trim();
          biasKeysApplied.do = bias.outreach?.do?.length || 0;
          biasKeysApplied.dont = bias.outreach?.dont?.length || 0;
          biasKeysApplied.nudge = !!bias.outreach?.nudge;
        }
      }

      if (key.startsWith('match.')) {
        const geo = bias.match?.geoWeight ?? 1;
        // Clamp geo weight between 0.8 and 2
        const clampedGeo = Math.max(0.8, Math.min(2, geo));
        system += `\n# Scoring Tweaks\nGeo proximity weight: ${clampedGeo}x.`;
        biasKeysApplied.geoWeight = clampedGeo;
        
        if (bias.match?.boostCategories) {
          const clampedBoosts = Object.fromEntries(
            Object.entries(bias.match.boostCategories).map(([k, v]) => [
              k,
              Math.max(0.8, Math.min(2, v)), // Clamp between 0.8 and 2
            ])
          );
          system += `\nBoost categories: ${Object.entries(clampedBoosts)
            .map(([k, v]) => `${k}:${v}x`)
            .join(', ')}.`;
          biasKeysApplied.boostCategories = Object.keys(clampedBoosts).length;
        }
        
        if (bias.match?.downrankSignals?.length) {
          system += `\nDownrank if descriptions include: ${bias.match.downrankSignals.join(', ')}.`;
          biasKeysApplied.downrankSignals = bias.match.downrankSignals.length;
        }
      }

      if (key.startsWith('audit.')) {
        if (bias.audit?.style) {
          style.presentation = bias.audit.style;
          biasKeysApplied.auditStyle = bias.audit.style;
        }
        if (bias.audit?.avoid?.length) {
          system += `\nAvoid: ${bias.audit.avoid.join(', ')}.`;
          biasKeysApplied.auditAvoid = bias.audit.avoid.length;
        }
      }

      // Log bias application for observability
      if (Object.keys(biasKeysApplied).length > 0) {
        console.log(`[AI-ADAPT] Bias applied for ${key}:`, {
          traceId: opts.traceId,
          biasKeysApplied,
          workspaceId: opts.workspaceId,
        });
      }
    } catch (error) {
      console.error('[AI-ADAPT] Error applying bias:', error);
      // Continue without bias if there's an error
    }
  }

  // Call the original AI invoke with potentially modified system/style
  return originalAiInvoke(key, input, {
    system: system || undefined,
    style: Object.keys(style).length > 0 ? style : undefined,
    fewshots: fewshots.length > 0 ? fewshots : undefined,
    model: opts.model,
  });
}
