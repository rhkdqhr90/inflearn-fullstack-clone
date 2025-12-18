import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { MentoringsService } from './mentorings.service';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateMentoringDto } from './dto/create-mentoring.dto';
import { Request } from 'express';
import { AccessTokenGuard } from 'src/auth/guards/access-token-guard';
import { UpdateMentoringDto } from './dto/update-mentoring.dto';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application.dto';

@ApiTags('멘토링')
@Controller('mentorings')
export class MentoringsController {
  constructor(private readonly mentoringsService: MentoringsService) {}

  @Post()
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '멘토링 생성' })
  @ApiOkResponse({
    description: '멘토링이 생성',
    type: CreateMentoringDto,
  })
  create(@Req() req: Request, @Body() createMentoringDto: CreateMentoringDto) {
    return this.mentoringsService.create(req.user!.sub, createMentoringDto);
  }

  @Get('my')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '내 멘토링 조회' })
  @ApiOkResponse({
    description: '멘토링 조회',
  })
  findMyMentoring(@Req() req: Request) {
    return this.mentoringsService.findMyMentoring(req.user!.sub);
  }

  @Patch(':id')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '멘토링 수정' })
  @ApiOkResponse({
    description: '멘토링 수정',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
    @Body() updateMentoringDto: UpdateMentoringDto,
  ) {
    return this.mentoringsService.update(id, req.user!.sub, updateMentoringDto);
  }

  @Patch(':id/toggle')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '멘토링 활성화' })
  @ApiOkResponse({
    description: '멘토링 활성화',
  })
  toggleActive(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    return this.mentoringsService.toggleActive(id, req.user!.sub);
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '멘토링 삭제' })
  @ApiOkResponse({
    description: '멘토링 삭제',
  })
  delete(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    return this.mentoringsService.remove(id, req.user!.sub);
  }

  @Get()
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '멘토링 목록 조회' })
  @ApiOkResponse({
    description: '멘토링 목록 조회',
  })
  findAll() {
    return this.mentoringsService.findAll();
  }

  @Post(':id/apply')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '멘토링 신청 관리 ' })
  @ApiOkResponse({
    description: '멘토링 신청 관리',
  })
  applyForMentoring(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
    @Body() createApplicationDto: CreateApplicationDto,
  ) {
    return this.mentoringsService.applyForMentoring(
      id,
      req.user!.sub,
      createApplicationDto,
    );
  }

  @Get(':id/applications')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '멘토링 신청 목록 조회 ' })
  @ApiOkResponse({
    description: '멘토링 신청 목록 조회',
  })
  getApplications(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    return this.mentoringsService.getApplications(id, req.user!.sub);
  }

  @Get('applications/my')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '내 멘토링 신청 목록 조회 ' })
  @ApiOkResponse({
    description: '내 멘토링 신청 목록 조회',
  })
  getMyApplications(@Req() req: Request) {
    return this.mentoringsService.getMyApplications(req.user!.sub);
  }

  @Patch('applications/:applicationId/status')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '멘토링 신청서 업데이트  ' })
  @ApiOkResponse({
    description: '멘토링 신청서 업데이트 ',
  })
  updateApplicationStatus(
    @Param('applicationId', ParseUUIDPipe) applicationId: string,
    @Req() req: Request,
    @Body() updateApplicationStatusDto: UpdateApplicationStatusDto,
  ) {
    return this.mentoringsService.updateApplicationStatus(
      applicationId,
      req.user!.sub,
      updateApplicationStatusDto,
    );
  }
}
