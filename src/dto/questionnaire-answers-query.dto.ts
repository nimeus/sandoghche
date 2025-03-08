import { 
    IsOptional, 
    IsInt, 
    IsString, 
    IsBoolean, 
    IsEnum, 
    Min, 
    Max, 
    ValidateIf 
  } from 'class-validator';
  import { Type } from 'class-transformer';
  
  export enum SortByEnum {
    CREATED_AT = 'createdAt',
    UPDATED_AT = 'updatedAt',
    RATING = 'rating'
  }
  
  export enum SortOrderEnum {
    ASC = 'ASC',
    DESC = 'DESC'
  }
  
  export class QuestionnaireAnswersQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    page = 1;
  
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit = 10;
  
    @IsOptional()
    @IsString()
    @ValidateIf(o => o.search !== undefined)
    //@Max(255)
    search?: string;
  
    @IsOptional()
    @IsString()
    @ValidateIf(o => o.comment !== undefined)
    //@Max(255)
    comment?: string;
  
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    @Max(10)
    minRating = 0;
  
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    @Max(10)
    maxRating = 5;
  
    @IsOptional()
    @IsEnum(SortByEnum)
    sortBy: SortByEnum = SortByEnum.CREATED_AT;
  
    @IsOptional()
    @IsEnum(SortOrderEnum)
    sortOrder: SortOrderEnum = SortOrderEnum.DESC;
  
    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    hasAiReport?: boolean;
  
    @IsOptional()
    @IsString()
    @ValidateIf(o => o.tags !== undefined)
    tags?: string;
  
    @IsOptional()
    @IsString()
    @ValidateIf(o => o.categories !== undefined)
    categories?: string;
  
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    @Max(10)
    minMood?: number;
  
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    @Max(10)
    maxMood?: number;
  
    @IsOptional()
    @Type(() => Number)
    @Min(0)
    @Max(10)
    minImportance?: number;
  
    @IsOptional()
    @Type(() => Number)
    @Min(0)
    @Max(10)
    maxImportance?: number;
  
    @IsOptional()
    @Type(() => Number)
    @Min(0)
    @Max(10)
    minAnalyzedRating?: number;
  
    @IsOptional()
    @Type(() => Number)
    @Min(0)
    @Max(10)
    maxAnalyzedRating?: number;
  
    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    actionRequired?: boolean;
  
    // Sanitize input methods
    sanitizeInput(): QuestionnaireAnswersQueryDto {
      const sanitized = { ...this };
  
      // Sanitize string inputs
      if (sanitized.search) {
        sanitized.search = this.sanitizeString(sanitized.search);
      }
      if (sanitized.comment) {
        sanitized.comment = this.sanitizeString(sanitized.comment);
      }
      if (sanitized.tags) {
        sanitized.tags = this.sanitizeTags(sanitized.tags);
      }
      if (sanitized.categories) {
        sanitized.categories = this.sanitizeTags(sanitized.categories);
      }
  
      return sanitized;
    }
  
    // Helper method to sanitize strings
    private sanitizeString(input: string): string {
      return input
        .replace(/['";`\\]/g, '') // Remove quotes and potential SQL injection chars
        .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
        .trim()
        .substring(0, 255);
    }
  
    // Helper method to sanitize tags
    private sanitizeTags(tags: string): string {
      return tags
        .replace(/[^a-zA-Z0-9, ]/g, '')
        .trim()
        .substring(0, 255);
    }
  }