import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import OpenAIApi from 'openai';
import { ChatCompletion, ChatCompletionMessageParam } from 'openai/resources';

// Define a type for message objects
type Message = {
  text: string; 
  ai?: boolean; // Indicate if the message is from the AI
};

@Injectable()
export class OpenAIService {
  public openai: OpenAIApi;

  constructor() {
    this.openai = new OpenAIApi({
      apiKey: process.env.OPEN_AI_SECRET_KEY,
    });
    console.log(this.openai)
  }

  /**
   * Make a request to ChatGPT to generate a response based on a prompt and message history.
   * @param prompt - The prompt for the ChatGPT model
   * @param messages - An array of messages representing the conversation history
   * @returns A string containing the generated response
   */
  async chatGptRequest(prompt: string, messages: Message[]): Promise<string> {
    try {
      // Convert message history to the format expected by the OpenAI API
      const history = messages.map(
        (message): ChatCompletionMessageParam => ({
          role: message.ai ? 'assistant' : 'user',
          content: message.text,
        }),
      );

      const prePrompt = `return all user messages or responses as a html page that will be printable as a pdf.
       use good html tags and good css to format the page.
       just return the html code without any other text.

       users message:`;
      // Make a request to the ChatGPT model
      const completion: ChatCompletion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: prePrompt + prompt,           
          },
          ...history,
        ],
        temperature: 0.5,
        //max_tokens: 10000,
      });

      // Extract the content from the response
      const [content] = completion.choices.map((choice) => choice.message.content);

      if (content === null) {
        throw new ServiceUnavailableException('Received null content from ChatGPT');
      }

      return content;
    } catch (e) {
      // Log and propagate the error
      console.error(e);
      throw new ServiceUnavailableException('Failed request to ChatGPT');
    }
  }

  /**
   * Transcribe audio from a buffer using the OpenAI Whisper model.
   * @param audioBuffer - The buffer containing audio data
   * @param language - The language of the audio
   * @returns The transcribed text
   */
  async transcribeAudio(audioBuffer: Buffer, language: string): Promise<string> {
    // Convert the audio buffer to a file object
    const blob = new Blob([audioBuffer], {
      type: 'audio/wav',
    });
    const file = new File([blob], 'input.wav', { type: 'audio/wav' });

    try {
      // Make a request to the Whisper model for audio transcription
      const whisperResponse = await this.openai.audio.transcriptions.create({
        model: 'whisper-1',
        language,
        file,
        response_format: 'json',
      });

      // Return the transcribed text
      return whisperResponse.text;
    } catch (e) {
      // Log and propagate the error
      console.error(e);
      throw new ServiceUnavailableException('Failed to transcribe audio');
    }
  }

  /**
   * Generate an image based on a text prompt using the OpenAI DALL-E model.
   * @param text - The text prompt for image generation
   * @returns A URL pointing to the generated image
   */
  async generateImage(text: string): Promise<string> {
    try {
      // Make a request to the DALL-E model for image generation
      const { data } = await this.openai.images.generate({
        model: 'dall-e-3',
        prompt: text,
        response_format: 'url',
      });

      console.log(data);

      // Return the URL of the generated image
      if (!data[0].url) {
        throw new ServiceUnavailableException('Failed to generate image: URL is undefined');
      }
      return data[0].url;
    } catch (e) {
      // Log and propagate the error
      console.error(e);
      throw new ServiceUnavailableException('Failed to generate image');
    }
  }
}