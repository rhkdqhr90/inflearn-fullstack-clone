import { ApiProperty } from '@nestjs/swagger';
import { MentoringScheduleDto } from './metoring-schedul.dto';
import { IsArray, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from '@nestjs/class-transformer';

export class CreateMentoringDto {
  @ApiProperty({ description: '멘토링명' })
  @IsString()
  name: string;

  @ApiProperty({ description: '직군/직무' })
  @IsString()
  jobRole: string;

  @ApiProperty({ description: '경력' })
  @IsString()
  experience: string;

  @ApiProperty({ description: '소속 회사(선택)' })
  @IsString()
  @IsOptional()
  company?: string;

  @ApiProperty({ description: '1회 가격', minimum: 0 })
  @IsInt()
  @Min(0)
  pricePerSession: number;

  @ApiProperty({
    description: '1회 최대 인원',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  maxParticipants: number;

  @ApiProperty({
    description: '1회 시간 (분)',
    example: 60,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  sessionDuration: number;

  @ApiProperty({
    description: '스케쥴 목록',
  })
  @IsArray()
  @Type(() => MentoringScheduleDto)
  schedules: MentoringScheduleDto[];
}
