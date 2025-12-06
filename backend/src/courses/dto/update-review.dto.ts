import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class UpdateReviewDto {
  @ApiProperty({
    description: '수강평 내용',
    required: false,
    example: '정말 유익한 강의였습니다. ',
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  content?: string;

  @ApiProperty({ description: '평점 (1~5)', example: 5, required: false })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  @Max(5)
  @IsOptional()
  rating?: number;
}
