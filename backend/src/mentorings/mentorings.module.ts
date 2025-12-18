import { Module } from '@nestjs/common';
import { MentoringsService } from './mentorings.service';
import { MentoringsController } from './mentorings.controller';

@Module({
  controllers: [MentoringsController],
  providers: [MentoringsService],
})
export class MentoringsModule {}
