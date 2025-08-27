export default class OpenAI {
  responses = {
    create: async (_: any) => ({
      output_text: JSON.stringify(globalThis.__OPENAI_MOCK__ ?? { ok: true })
    })
  };
}
