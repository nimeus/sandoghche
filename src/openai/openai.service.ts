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
    //console.log(this.openai)
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

  async chatGptRequestForAnalyzingAnswer(prompt: string): Promise<string> {
    try {

      const prePrompt = `Analyze the following survey comment and return only a JSON output. The input is a single text field labeled as "comment".

Generate the following fields in the JSON output:

1. analyzed_ai_rating: A rating from 1 to 5 based solely on the AI's analysis of the comment (1 = very negative, 5 = very positive). Base this rating on overall sentiment and key themes in the comment.

2. short_summary: A concise summary of the comment (1-2 sentences) that captures the main points while avoiding minor details.

3. category: The most relevant category for the comment. Use a consistent set of categories across responses. If the comment does not clearly relate to an existing category, assign a new category (or use "General" if appropriate).

4. tags: An array of up to 3 specific, actionable tags that describe the comment. Ensure consistency by using a predefined set of tags where possible; if the comment does not fit any existing tags, generate a new, descriptive tag (or use a default tag like "General").

5. importance_index: A score from 1 to 10 indicating the importance or urgency of the comment. Consider both sentiment and any explicit urgency markers. Use the following guidelines:
   - 1-3: Low importance (e.g., general feedback, no urgency).
   - 4-6: Moderate importance (e.g., minor issues, suggestions for improvement).
   - 7-10: High importance (e.g., critical issues, complaints requiring immediate attention).

6. user_mood: A score from 1 to 10 estimating how the user feels (1 = very negative, 10 = very positive) based on sentiment and key phrases in the comment.

7. needs_action: A boolean value (true or false) indicating whether the comment requires any follow-up action. Set to true if the comment includes complaints, critical issues, or urgent feedback; otherwise, set to false.

8. action_steps: If needs_action is true, provide a short sentence summarizing the action steps that the client should take in response to the comment. If needs_action is false, return an empty string.

9. pros: An array listing any positive aspects or strengths mentioned in the comment. If no positives are identified, return an empty array.

10. cons: An array listing any negative aspects, issues, or concerns mentioned in the comment. If no negatives are identified, return an empty array.

If the comment is empty, nonsensical, or does not provide valid feedback, return the following JSON exactly:

{
  "analyzed_ai_rating": null,
  "short_summary": "No valid comment provided.",
  "category": null,
  "tags": [],
  "importance_index": null,
  "user_mood": null,
  "needs_action": false,
  "action_steps": "",
  "pros": [],
  "cons": []
}

Return only the JSON output, formatted exactly as follows:

{
  "analyzed_ai_rating": <number>,
  "short_summary": <string>,
  "category": <string>,
  "tags": [<string>, ...],
  "importance_index": <number>,
  "user_mood": <number>,
  "needs_action": <boolean>,
  "action_steps": <string>,
  "pros": [<string>, ...],
  "cons": [<string>, ...]
}

comment: `;
  
      // Make a request to the ChatGPT model
      const completion: ChatCompletion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: prePrompt + prompt,
          },
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