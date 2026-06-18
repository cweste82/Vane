import { describe, it, expect } from 'vitest';
import { injectImagesIntoMessages } from './multimodal';
import type { ChatCompletionMessageParam } from 'openai/resources/index.mjs';

const IMG = 'data:image/png;base64,AAAA';

describe('injectImagesIntoMessages', () => {
  it('returns the same array reference when there are no images', () => {
    const msgs = [{ role: 'user', content: 'hi' }] as ChatCompletionMessageParam[];
    expect(injectImagesIntoMessages(msgs, [])).toBe(msgs);
  });

  it('returns the same array reference when there is no user message', () => {
    const msgs = [{ role: 'system', content: 'sys' }] as ChatCompletionMessageParam[];
    expect(injectImagesIntoMessages(msgs, [IMG])).toBe(msgs);
  });

  it('appends image_url parts to the LAST user message only', () => {
    const msgs = [
      { role: 'system', content: 'sys' },
      { role: 'user', content: 'first' },
      { role: 'assistant', content: 'a' },
      { role: 'user', content: 'describe this' },
    ] as ChatCompletionMessageParam[];

    const out = injectImagesIntoMessages(msgs, [IMG]);
    const last = out[3] as any;

    expect(Array.isArray(last.content)).toBe(true);
    expect(last.content[0]).toEqual({ type: 'text', text: 'describe this' });
    expect(last.content[1]).toEqual({ type: 'image_url', image_url: { url: IMG } });
    // earlier user message untouched
    expect((out[1] as any).content).toBe('first');
    // input not mutated
    expect((msgs[3] as any).content).toBe('describe this');
  });
});
