import {
  Body,
  Controller,
  Get,
  Delete,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
  Patch,
  Query,
} from '@nestjs/common';
import { ChallengesService } from './challenges.service';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AccessTokenGuard } from 'src/auth/guards/access-token-guard';
import { Request } from 'express';
import { CreateChallengeDto } from './dto/create-challnege.dto';
import { ChallengeResponseDto } from './dto/challenge-response.dto';
import { UpdateChallengeDto } from './dto/update-challenge.dto';

@ApiTags('챌린지')
@Controller('')
export class ChallengesController {
  constructor(private readonly challengesService: ChallengesService) {}

  @Post('courses/:courseId/challenge')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({
    description: '챌린지 생성',
    type: ChallengeResponseDto,
  })
  create(
    @Req() req: Request,
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Body() createChallengeDto: CreateChallengeDto,
  ) {
    return this.challengesService.create(
      req.user!.sub,
      courseId,
      createChallengeDto,
    );
  }

  @Patch('courses/:courseId/challenge')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '챌린지 수정' })
  @ApiOkResponse({
    description: '챌린지가 수정되었습니다.',
    type: ChallengeResponseDto,
  })
  update(
    @Req() req: Request,
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Body() updateChallengeDto: UpdateChallengeDto,
  ) {
    return this.challengesService.update(
      req.user!.sub,
      courseId,
      updateChallengeDto,
    );
  }

  @Delete('courses/:courseId/challenge')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '챌린지 삭제' })
  @ApiOkResponse({
    description: '챌린지가 삭제되었습니다.',
  })
  remove(
    @Req() req: Request,
    @Param('courseId', ParseUUIDPipe) courseId: string,
  ) {
    return this.challengesService.remove(req.user!.sub, courseId);
  }

  // 챌린지 목록 조회 및 상세 조회
  @Get('challenges')
  @ApiOperation({ summary: '챌린지 목록 조회 (전체)' })
  @ApiOkResponse({
    description: '챌린지 목록',
    type: [ChallengeResponseDto],
  })
  findAll(@Query('status') status?: string) {
    return this.challengesService.findAll(status);
  }

  @Get('challenges/:slug')
  @ApiOperation({ summary: '챌린지 상세 조회 (슬러그)' })
  @ApiOkResponse({
    description: '챌린지 상세 정보',
    type: ChallengeResponseDto,
  })
  findOneBySlug(@Param('slug') slug: string) {
    return this.challengesService.findOneBySlug(slug);
  }

  //챌린지 신청
  @Post('challenges/:slug/join')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: '챌린지 신청',
    description:
      '이미 수강 중이면 챌린지만 참가, 아니면 장바구니에 추가 또는 자동 수강 신청',
  })
  @ApiOkResponse({
    description: '챌린지 신청 결과 (redirect 정보 포함)',
  })
  join(@Req() req: Request, @Param('slug') slug: string) {
    return this.challengesService.join(req.user!.sub, slug);
  }

  @Get('challenges/:slug/participants')
  @ApiOperation({ summary: '챌린지 참가자 목록' })
  @ApiOkResponse({
    description: '참가자 목록',
  })
  getParticipants(@Param('slug') slug: string) {
    return this.challengesService.getParticipantsBySlug(slug);
  }
}
