import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateQuestionDto {
  @ApiProperty({
    description: '질문 제목',
    example: '강의에서 설명한 부분에 대한 질문입니다.',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: '질문 내용',
    example: '5분 12초 에 대한 질문이 있습니다.',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}
