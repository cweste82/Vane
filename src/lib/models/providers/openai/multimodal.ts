import type {
  ChatCompletionContentPart,
  ChatCompletionMessageParam,
} from 'openai/resources/index.mjs';

/**
 * Append `image_url` content parts to the LAST user message.
 * Pure: returns a NEW array and does not mutate the input.
 * Returns the input unchanged when there are no images or no user message.
 */
export function injectImagesIntoMessages(
  messages: ChatCompletionMessageParam[],
  images: string[],
): ChatCompletionMessageParam[] {
  if (!images || images.length === 0) return messages;

  let idx = -1;
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === 'user') {
      idx = i;
      break;
    }
  }
  if (idx === -1) return messages;

  const target = messages[idx];
  const text = typeof target.content === 'string' ? target.content : '';

  const parts: ChatCompletionContentPart[] = [
    { type: 'text', text },
    ...images.map((url) => ({
      type: 'image_url' as const,
      image_url: { url },
    })),
  ];

  const updated = [...messages];
  updated[idx] = { ...target, content: parts } as ChatCompletionMessageParam;
  return updated;
}
