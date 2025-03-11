import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import OpenAIApi from 'openai';
import { ChatCompletion, ChatCompletionMessageParam } from 'openai/resources';
import { AIReportDto } from 'src/dto/ai-report.dto';

// Define a type for message objects
type Message = {
  text: string; 
  ai?: boolean; // Indicate if the message is from the AI
};

@Injectable()
export class OpenAIService {
  public openai: OpenAIApi;
  private languagePrompt = ' *فارسی*';

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

  async chatGptRequestForAnalyzingAnswer_d(prompt: string, uniqueData: any): Promise<string> {
    try {
      const prePrompt = `Analyze the following survey comment and return only a JSON output. The input is a single text field labeled as "comment".
  
  For consistent categorization and tagging, carefully consider the previously used categories, tags, pros, and cons before creating new ones.
  
  IMPORTANT CONSISTENCY RULES:
  - All generated text should be in ${this.languagePrompt}.
  - Before creating a new category, tag, pro, or con, check if an existing one exactly matches the concept.
  - There is no need to use the exact words used in the comment anywhere, you can write better phrases.
  
  Generate the following fields in the JSON output:
  
  1. analyzed_ai_rating: A rating from 1 to 5 based solely on the overall sentiment and key themes in the comment (1 = very negative, 5 = very positive).
  2. short_summary: A concise summary (1-2 sentences) that captures the main points without minor details.
  3. category: The most relevant category for the comment. IMPORTANT: First check if any of these existing categories apply: ${uniqueData.categories.join(", ")}. create a new category if none of the existing ones are matches the concept, don't use top level general categories for example for a comment about restaurant, categories could be like serviec,food quality, design,staffs, cleaness and etc.
  4. tags: An array of up to 2 specific, actionable tags/keywords that describe the comment. IMPORTANT: First check if any of these existing tags apply: ${uniqueData.tags.join(", ")}. create new tags if none of the existing ones are matches the concept.
  5. importance_index: A score from 1 to 10 indicating the importance or urgency of the comment. Guidelines:
     - 1-3: Low importance (e.g., general feedback, no urgency).
     - 4-6: Moderate importance (e.g., minor issues, suggestions for improvement).
     - 7-10: High importance (e.g., critical issues, urgent complaints).
  6. user_mood: A score from 1 to 10 estimating the user’s mood (1 = very negative, 10 = very positive) based on sentiment and key phrases.
  7. needs_action: A boolean indicating whether the comment requires follow-up action (true for complaints, critical issues, or urgent feedback).
  8. action_steps: If needs_action is true, provide a short sentence summarizing recommended follow-up actions; otherwise, return an empty string.
  9. pros: An array listing any positive aspects based on the comment. IMPORTANT: First check if any of these existing pros apply: ${uniqueData.pros.join(", ")}. Use exact wording when the concept matches; otherwise, add new meaningful pros.
  10. cons: An array listing any negative aspects based on the comment. IMPORTANT: First check if any of these existing cons apply: ${uniqueData.cons.join(", ")}. Use exact wording when the concept matches; otherwise, add new meaningful cons.
  
  If the comment is empty, nonsensical, or does not provide valid feedback, return exactly:
  
  {
    "analyzed_ai_rating": null,
    "short_summary": "No valid comment provided.",
    "category": "", // write unknown in language mentioned before if the category is not clear
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
        temperature: 0.5, // Lower temperature for more consistent responses
        //max_tokens: 10000,
      });
  
      // Extract the content from the response
      const [content] = completion.choices.map((choice) => choice.message.content);
  
      if (content === null) {
        throw new ServiceUnavailableException('Received null content from ChatGPT');
      }
  
      return content;
    } catch (e) {
      console.error(e);
      throw new ServiceUnavailableException('Failed request to ChatGPT');
    }
  }
  
  async chatGptRequestForAnalyzingAnswer(prompt: string, uniqueData: any): Promise<string> {
    try {
      const prePrompt = `Analyze the following survey comment and return only a JSON output. The input is a single text field labeled as "comment".
  
  For consistent categorization and tagging, carefully consider the previously used categories, tags, pros, and cons before creating new ones.
  
  IMPORTANT CONSISTENCY RULES:
  - All generated text should be in ${this.languagePrompt} and DONT USE ANY THING ELSE.
  - Before creating a new category, tag, pro, or con, check if an existing one exactly matches the concept.
  - There is no need to use the exact words used in the comment anywhere, you can write better phrases.
  
  Generate the following fields in the JSON output:
  
  1. analyzed_ai_rating: A rating from 1 to 5 based solely on the overall sentiment and key themes in the comment (1 = very negative, 5 = very positive).
  2. short_summary: A concise summary (1-2 sentences) that captures the main points without minor details.
  3. category: The most relevant category for the comment. IMPORTANT: First check if any of these existing categories apply: ${uniqueData.categories.join(", ")}. Create a new category if none of the existing ones match the concept, but don't use general categories (e.g., for a restaurant, categories could be service, food quality, design, staff, cleanliness, etc.).
  4. tags: An array of up to 2 specific, actionable tags/keywords that describe the comment. IMPORTANT: First check if any of these existing tags apply: ${uniqueData.tags.join(", ")}. Create new tags if none of the existing ones match the concept.
  5. importance_index: A score from 1 to 10 indicating the importance or urgency of the comment.
  6. user_mood: A score from 1 to 10 estimating the user’s mood (1 = very negative, 10 = very positive) based on sentiment and key phrases.
  7. needs_action: A boolean indicating whether the comment requires follow-up action (true for complaints, critical issues, or urgent feedback).
  8. action_steps: If needs_action is true, provide a short sentence summarizing recommended follow-up actions; otherwise, return an empty string.
  9. pros: An array listing any positive aspects based on the comment. IMPORTANT: First check if any of these existing pros apply: ${uniqueData.pros.join(", ")}. Use exact wording when the concept matches; otherwise, add new meaningful pros.
  10. cons: An array listing any negative aspects based on the comment. IMPORTANT: First check if any of these existing cons apply: ${uniqueData.cons.join(", ")}. Use exact wording when the concept matches; otherwise, add new meaningful cons.
  
  If the comment is empty, nonsensical, or does not provide valid feedback, return exactly:
  
  {
    "analyzed_ai_rating": null,
    "short_summary": "No valid comment provided.",
    "category": "", // Write "unknown" in the specified language if the category is unclear
    "tags": [],
    "importance_index": null,
    "user_mood": null,
    "needs_action": false,
    "action_steps": "",
    "pros": [],
    "cons": []
  }
  
  Return only the (JSON output) formatted exactly as follows:
  `;

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          //"HTTP-Referer": "<YOUR_SITE_URL>",
          //"X-Title": "<YOUR_SITE_NAME>",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-lite-001",
          messages: [{
            role: "system",
            content: prePrompt + prompt,
          }],
          temperature: 0.5,
        })
      });

      if (!response.ok) {
        throw new ServiceUnavailableException(`Failed request to OpenRouter: ${response.statusText}`);
      }
      const data = await response.json();
      console.log(data.choices?.[0]?.message)
      const content = this.extractJson(data.choices?.[0]?.message?.content);
      console.log(content)

      if (!content) {
        throw new ServiceUnavailableException("Received null content from OpenRouter");
      }

      return content;
    } catch (e) {
      console.error(e);
      throw new ServiceUnavailableException("Failed request to OpenRouter");
    }
  }

  private extractJson(content: string): any {
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch && jsonMatch[1]) {
      return jsonMatch[1];
    }
    throw new Error("Invalid JSON format");
  }

  public async generateBatchReportFromAI(
    existingData: BatchReportData,
    newAnswers: { response: string; aiReport: AIReportDto }[]
  ): Promise<string> {
    if (newAnswers.length !== 10) {
      throw new Error("Exactly 10 new answers are required.");
    }
  
    const prePrompt = `
  You are an AI updating a JSON survey report. You will receive:
  1. An existing report (JSON) with prior aggregated data.
  2. An array of exactly 10 new survey answers. Each answer has:
     - "response": user comment.
     - "aiReport": including fields such as analyzed_ai_rating, user_mood, importance (1-10), categories, tags, needs_action, pros, and cons.
  Tasks:
  - Merge the 10 new answers with the existing report.
  - Increment "totalAnswers" by 10 (counting all, even with null values).
  - Recalculate "averageAIRating" and "averageUserMood" using only valid (non-null) values.
  - Update "importanceDistribution" by grouping "importance" into "1-3", "4-6", and "7-10".
  - Aggregate counts for "categories" and "tags".
  - Update "needsActionCount", "prosCount", and "consCount".
  - Update "summaryStats" with counts for totalPros, totalCons, and actionStepsRequired.
  - Generate summary: use previous summary and merge to generate useful text that considers all aspects and gives good suggestions for improvement, should comment on the most important issues and talk about the statistics and information available. summary should be vey complete and not a short text.
  - IMPORTANT: All generated text should be in ${this.languagePrompt}.
  Return ONLY the updated JSON report exactly matching this structure:
  
  {
    "questionnaireId": <string>,
    "totalAnswers": <number>,
    "averageAIRating": <number>,
    "averageUserMood": <number>,
    "importanceDistribution": { "1-3": <number>, "4-6": <number>, "7-10": <number> },
    "categories": { <string>: <number> },
    "tags": { <string>: <number> },
    "needsActionCount": <number>,
    "prosCount": <number>,
    "consCount": <number>,
    "summary": <string>,
    "summaryStats": { "totalPros": { <string>: <number> }, "totalCons": { <string>: <number> }, "actionStepsRequired": <number> }
  }
  
  Do not include any extra text.
  
  Existing report:
  ${JSON.stringify(existingData, null, 2)}
  
  New answers (10):
  ${JSON.stringify(newAnswers, null, 2)}
  `;
  
    const fullPrompt = prePrompt;
  
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: fullPrompt }],
      temperature: 0.3,
    });
  
    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error("No content returned from AI");
    }
    return content;
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