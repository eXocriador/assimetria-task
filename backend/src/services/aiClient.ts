import axios from 'axios';

type ArticlePayload = {
  title: string;
  content: string;
  model: string;
};

const requiredEnv = ['AI_PROVIDER', 'HF_API_KEY', 'HF_MODEL'] as const;

const loadConfig = () => {
  const missing = requiredEnv.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing AI configuration: ${missing.join(', ')}`);
  }

  const provider = process.env.AI_PROVIDER;
  if (provider !== 'huggingface') {
    throw new Error(`Unsupported AI_PROVIDER "${provider}". Only "huggingface" is supported.`);
  }

  return {
    provider,
    apiKey: process.env.HF_API_KEY as string,
    model: process.env.HF_MODEL as string,
  };
};

const { apiKey, model } = loadConfig();
const HF_API_URL = `https://api-inference.huggingface.co/models/${model}`;

const buildPrompt = (topic?: string): string => {
  const subject =
    topic?.trim() ||
    'an emerging topic in artificial intelligence and engineering best practices';

  return [
    'You are a helpful assistant that writes concise, informative blog posts in markdown.',
    'Generate a short article with:',
    '- A clear H1 title on the first line.',
    '- A few paragraphs of engaging body content about the requested topic.',
    '- Use markdown (headings, bullet points if helpful).',
    'Topic:',
    subject,
  ].join('\n');
};

const parseArticle = (rawText: string): ArticlePayload => {
  const lines = rawText.split('\n');

  const firstNonEmptyIndex = lines.findIndex(
    (line) => line.trim().length > 0
  );

  if (firstNonEmptyIndex === -1) {
    throw new Error('AI response was empty');
  }

  let title = lines[firstNonEmptyIndex].trim();
  let startIndex = firstNonEmptyIndex + 1;

  for (let i = firstNonEmptyIndex; i < lines.length; i += 1) {
    const headingMatch = lines[i].trim().match(/^#{1,6}\s+(.*)/);
    if (headingMatch) {
      title = headingMatch[1].trim();
      startIndex = i + 1;
      break;
    }
  }

  const content = lines.slice(startIndex).join('\n').trim();

  return {
    title,
    content,
    model,
  };
};

export const generateArticle = async (
  topic?: string
): Promise<ArticlePayload> => {
  try {
    const prompt = buildPrompt(topic);
    const response = await axios.post(
      HF_API_URL,
      {
        inputs: prompt,
        parameters: {
          max_new_tokens: 600,
          temperature: 0.7,
          return_full_text: false,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        timeout: 60_000,
      }
    );

    const rawText: string | undefined =
      response.data?.[0]?.generated_text || response.data?.generated_text;

    if (!rawText) {
      throw new Error('AI response missing generated_text field');
    }

    return parseArticle(rawText.trim());
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const detail =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message;
      throw new Error(
        `AI generation failed${status ? ` (status ${status})` : ''}: ${detail}`
      );
    }
    throw new Error(`AI generation failed: ${(error as Error).message}`);
  }
};
