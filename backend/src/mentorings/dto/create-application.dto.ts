import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEmail, IsString } from 'class-validator';

export class CreateApplicationDto {
  @ApiProperty({ description: '신청할 날짜 시간' })
  @IsDateString()
  scheduledDate: string;

  @ApiProperty({ description: '연락 가능한 연락처(멘토에게만 공개' })
  @IsString()
  phoneNumber: string;

  @ApiProperty({ description: '연락 가능한 이메일(멘토에게만 공개' })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: '지식공유자에게 남길 메시지',
    example:
      '멘토링 받고 싶은 내용을 상세하게 남겨주시면 더욱 의미있는 시간을 가질 수 있어요!',
  })
  @IsString()
  message: string;
}
