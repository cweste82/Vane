import z from 'zod';
import {
  GenerateObjectInput,
  GenerateOptions,
  GenerateTextInput,
  GenerateTextOutput,
  StreamTextOutput,
} from '../types';

abstract class BaseLLM<CONFIG> {
  protected attachedImages: string[] = [];

  constructor(protected config: CONFIG) {}

  /**
   * Attach base64 data-URI images to this request-scoped model instance.
   * Providers that support vision forward these on the last user message.
   */
  attachImages(images: string[]): void {
    this.attachedImages = images ?? [];
  }

  abstract generateText(input: GenerateTextInput): Promise<GenerateTextOutput>;
  abstract streamText(
    input: GenerateTextInput,
  ): AsyncGenerator<StreamTextOutput>;
  abstract generateObject<T>(input: GenerateObjectInput): Promise<z.infer<T>>;
  abstract streamObject<T>(
    input: GenerateObjectInput,
  ): AsyncGenerator<Partial<z.infer<T>>>;
}

export default BaseLLM;
