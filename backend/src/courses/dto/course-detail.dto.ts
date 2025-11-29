import { ApiProperty } from '@nestjs/swagger';
import { Course } from 'src/_gen/prisma-class/course';

export class CourseDetailDto extends Course {
  @ApiProperty({ type: Number, description: '총 수강생 수' })
  totalEnrollments: number;

  @ApiProperty({ type: Number, description: '평균 평점' })
  averageRating: number;

  @ApiProperty({ type: Number, description: '총 리뷰 수' })
  totalReviews: number;

  @ApiProperty({ type: Number, description: '총 렉처 수' })
  totalLectures: number;

  @ApiProperty({ type: Number, description: '총 강의 시간(분)' })
  totalDuration: number;
}
