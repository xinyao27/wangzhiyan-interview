import { createDeepSeek } from "@ai-sdk/deepseek";
import { MODELS } from "@/lib/constants";

export const deepseek = createDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY,
})(MODELS.deepseek);
