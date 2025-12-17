import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateChallengeDto } from './dto/create-challnege.dto';
import { UpdateChallengeDto } from './dto/update-challenge.dto';

@Injectable()
export class ChallengesService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: string,
    courseId: string,
    createChallengeDto: CreateChallengeDto,
  ) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: { challenge: true },
    });

    if (!course) {
      throw new NotFoundException('강의를 찾을 수 없습니다.');
    }

    if (course.instructorId !== userId) {
      throw new ForbiddenException(
        '해당 강의의 강사만 챌린지를 생성할 수 있습니다.',
      );
    }

    if (course.challenge) {
      throw new BadRequestException('이미 챌린지가 존재하는 강의입니다.');
    }

    const recruitStart = new Date(createChallengeDto.recruitStartAt);
    const recruitEnd = new Date(createChallengeDto.recruitEndAt);
    const challengeStart = new Date(createChallengeDto.challengeStartAt);
    const challengeEnd = new Date(createChallengeDto.challengeEndAt);

    if (recruitEnd <= recruitStart) {
      throw new BadRequestException(
        '모집 마감일은 모집 시작일 이후여야 합니다.',
      );
    }

    if (challengeStart <= recruitEnd) {
      throw new BadRequestException(
        '챌린지 시작일은 모집 마감일 이후여야 합니다.',
      );
    }

    if (challengeEnd <= challengeStart) {
      throw new BadRequestException(
        '챌린지 종료일은 챌린지 시작일 이후여야 합니다.',
      );
    }

    const challenge = await this.prisma.challenge.create({
      data: {
        courseId,
        ...createChallengeDto,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            thumbnailUrl: true,
            instructor: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });
    return challenge;
  }

  async update(
    userId: string,
    courseId: string,
    updatechallengeDto: UpdateChallengeDto,
  ) {
    const challenge = await this.prisma.challenge.findUnique({
      where: { courseId },
      include: {
        course: true,
      },
    });
    if (!challenge) {
      throw new NotFoundException('챌린지를 찾을 수 없습니다.');
    }

    if (challenge.course.instructorId !== userId) {
      throw new ForbiddenException('해당 챌린지의 강사만 수정할 수 있습니다.');
    }

    const updateChallenge = await this.prisma.challenge.update({
      where: { courseId },
      data: updatechallengeDto,
      include: {
        course: true,
      },
    });
    return updateChallenge;
  }

  async remove(userId: string, courseId: string) {
    const challenge = await this.prisma.challenge.findUnique({
      where: { courseId },
      include: {
        course: true,
      },
    });

    if (!challenge) {
      throw new NotFoundException('챌린지를 찾을 수 없습니다.');
    }

    if (challenge.course.instructorId !== userId) {
      throw new ForbiddenException('해당 챌린지의 강사만 삭제할 수 있습니다.');
    }

    await this.prisma.challenge.delete({
      where: { courseId },
    });

    return challenge;
  }

  async findAll(status?: string) {
    const where = status ? { status } : {};

    const challenge = await this.prisma.challenge.findMany({
      where,
      include: {
        course: {
          include: {
            instructor: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            categories: true,
          },
        },
        _count: {
          select: {
            participants: true,
          },
        },
      },
      orderBy: {
        recruitStartAt: 'desc',
      },
    });

    return challenge;
  }

  async findOneBySlug(slug: string) {
    const course = await this.prisma.course.findUnique({
      where: { slug },
      include: {
        challenge: {
          include: {
            course: {
              include: {
                instructor: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                  },
                },
                sections: {
                  include: {
                    lectures: {
                      orderBy: { order: 'asc' },
                      take: 1,
                    },
                  },
                  orderBy: { order: 'asc' },
                  take: 1,
                },
              },
            },
            _count: {
              select: {
                participants: true,
              },
            },
          },
        },
      },
    });
    if (!course || !course.challenge) {
      throw new NotFoundException('챌린지를 찾을 수 없습니다.');
    }

    return course.challenge;
  }

  async join(userId: string, slug: string) {
    const course = await this.prisma.course.findUnique({
      where: { slug },
      include: {
        challenge: true,
        sections: {
          include: {
            lectures: {
              orderBy: { order: 'asc' },
              take: 1,
            },
          },
          orderBy: { order: 'asc' },
          take: 1,
        },
      },
    });

    if (!course || !course.challenge) {
      throw new NotFoundException('챌린지를 찾을 수 없습니다.');
    }
    const challenge = course.challenge;
    if (challenge.status !== 'RECRUITING') {
      throw new BadRequestException('현재 모집 중인 챌린지가 아닙니다.');
    }

    const now = new Date();
    if (now < challenge.recruitStartAt || now > challenge.recruitEndAt) {
      throw new BadRequestException('모집 기간이 아닙니다.');
    }

    if (challenge.currentParticipants >= challenge.maxParticipants) {
      throw new BadRequestException('모집 정원이 마감되었습니다.');
    }

    const existingParticipant =
      await this.prisma.challengeParticipant.findUnique({
        where: {
          challengeId_userId: {
            challengeId: challenge.id,
            userId,
          },
        },
      });
    if (existingParticipant) {
      throw new BadRequestException('이미 참가 신청한 챌린지입니다.');
    }

    //이미 수강중인가?
    const existingEnrollment = await this.prisma.courseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: course.id,
        },
      },
    });

    if (existingEnrollment || course.price === 0) {
      await this.prisma.$transaction(async (prisma) => {
        await prisma.challengeParticipant.create({
          data: {
            challengeId: challenge.id,
            userId,
          },
        });
        // 참가자 수 증가
        await prisma.challenge.update({
          where: { id: challenge.id },
          data: {
            currentParticipants: {
              increment: 1,
            },
          },
        });
      });
      const firstLecture = course.sections[0]?.lectures[0];
      const firstLectureId = firstLecture?.id || null;
      return {
        enrolled: true,
        courseSlug: course.slug,
        redirect: firstLectureId
          ? `/courses/lecture/${firstLectureId}`
          : `/courses/${course.slug}`,
        message: '챌린지 신청이 완료되었습니다!',
      };
    } else {
      const existingCartItem = await this.prisma.cartItem.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId: course.id,
          },
        },
      });
      if (!existingCartItem) {
        await this.prisma.cartItem.create({
          data: {
            userId,
            courseId: course.id,
          },
        });
      }
      return {
        enrolled: false,
        courseSlug: course.slug,
        redirect: '/carts',
        message: '장바구니에 담았습니다. 결제 후 챌린지에 참가하세요!',
      };
    }
  }

  async getParticipantsBySlug(slug: string) {
    const course = await this.prisma.course.findUnique({
      where: { slug },
      include: {
        challenge: true,
      },
    });

    if (!course || !course.challenge) {
      throw new NotFoundException('챌린지를 찾을 수 없습니다.');
    }

    const participants = await this.prisma.challengeParticipant.findMany({
      where: { challengeId: course.challenge.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        joinedAt: 'asc',
      },
    });

    return participants;
  }
}
