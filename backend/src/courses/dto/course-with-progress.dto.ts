import { ApiProperty } from '@nestjs/swagger';
import { Course } from 'src/_gen/prisma-class/course';

export class CourseWithProgressDto extends Course {
  @ApiProperty({ description: '진도율 (0-100)' })
  progress: number;

  @ApiProperty({ description: '완료한 강의 수' })
  completedLectures: number;

  @ApiProperty({ description: '전체 강의 수' })
  totalLectures: number;

  @ApiProperty({ description: '마지막 학습 시간' })
  lastWatchedAt: Date;

  @ApiProperty({ description: '수강 시작 시간' })
  enrolledAt: Date;
}
