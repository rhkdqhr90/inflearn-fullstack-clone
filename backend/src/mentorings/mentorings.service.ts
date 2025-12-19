import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMentoringDto } from './dto/create-mentoring.dto';
import { UpdateMentoringDto } from './dto/update-mentoring.dto';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application.dto';

@Injectable()
export class MentoringsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createMentoringDto: CreateMentoringDto) {
    const existingMentoring = await this.prisma.mentoring.findUnique({
      where: { userId },
    });

    if (existingMentoring) {
      throw new BadRequestException(
        '이미 활성화된 멘토링이 있습니다. 기간 내 하나의 멘토링만 생성 가능합니다.',
      );
    }
    const { schedules, ...mentoringData } = createMentoringDto;

    const parsedSchedules = schedules.map((schedule) => {
      if (typeof schedule === 'string') {
        return JSON.parse(schedule) as {
          dayOfWeek: number;
          startTime: string;
          endTime: string;
        };
      }
      return schedule;
    });

    return this.prisma.mentoring.create({
      data: {
        ...mentoringData,
        userId,
        schedules: {
          create: parsedSchedules.map((schedule) => ({
            dayOfWeek: schedule.dayOfWeek,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
          })),
        },
      },
      include: {
        schedules: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });
  }

  async findMyMentoring(userId: string) {
    const mentoring = await this.prisma.mentoring.findUnique({
      where: { userId },
      include: {
        schedules: {
          orderBy: { dayOfWeek: 'asc' },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });
    return mentoring;
  }

  async findByInstructorId(instructorId: string) {
    const mentoring = await this.prisma.mentoring.findUnique({
      where: {
        userId: instructorId,
        isActive: true,
      },
      include: {
        schedules: {
          orderBy: { dayOfWeek: 'asc' },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });
    return mentoring;
  }
  async findAll() {
    return this.prisma.mentoring.findMany({
      where: { isActive: true },
      include: {
        schedules: {
          orderBy: { dayOfWeek: 'asc' },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            bio: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
  async update(
    id: string,
    userId: string,
    updateMentoringDto: UpdateMentoringDto,
  ) {
    const mentoring = await this.prisma.mentoring.findUnique({
      where: { id },
    });

    if (!mentoring) {
      throw new NotFoundException('멘토링을 찾을 수 없습니다.');
    }

    if (mentoring.userId !== userId) {
      throw new ForbiddenException('본인의 멘토링만 수정할 수 있습니다.');
    }
    const { schedules, ...mentoringData } = updateMentoringDto;
    if (schedules && schedules.length > 0) {
      await this.prisma.mentoringSchedule.deleteMany({
        where: { mentoringId: id },
      });

      const parsedSchedules = schedules.map((schedule) => {
        if (typeof schedule === 'string') {
          return JSON.parse(schedule) as {
            dayOfWeek: number;
            startTime: string;
            endTime: string;
          };
        }
        return schedule;
      });

      return this.prisma.mentoring.update({
        where: { id },
        data: {
          ...mentoringData,
          schedules: {
            create: parsedSchedules.map((schedule) => ({
              dayOfWeek: schedule.dayOfWeek,
              startTime: schedule.startTime,
              endTime: schedule.endTime,
            })),
          },
        },
        include: {
          schedules: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      });
    }
    return this.prisma.mentoring.update({
      where: { id },
      data: {
        ...mentoringData,
      },
      include: {
        schedules: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });
  }

  async toggleActive(id: string, userId: string) {
    const mentoring = await this.prisma.mentoring.findUnique({
      where: { id },
    });
    if (!mentoring) {
      throw new NotFoundException('멘토링을 찾을 수 없습니다.');
    }

    if (mentoring.userId !== userId) {
      throw new ForbiddenException('본인의 멘토링만 수정할 수 있습니다.');
    }
    return this.prisma.mentoring.update({
      where: { id },
      data: {
        isActive: !mentoring.isActive,
      },
      include: {
        schedules: true,
      },
    });
  }
  async remove(id: string, userId: string) {
    const mentoring = await this.prisma.mentoring.findUnique({
      where: { id },
    });

    if (!mentoring) {
      throw new NotFoundException('멘토링을 찾을 수 없습니다.');
    }

    if (mentoring.userId !== userId) {
      throw new ForbiddenException('본인의 멘토링만 삭제할 수 있습니다.');
    }

    await this.prisma.mentoring.delete({
      where: { id },
    });

    return { message: '멘토링이 삭제되었습니다.' };
  }

  async applyForMentoring(
    mentoringId: string,
    applicantId: string,
    createApplicationDto: CreateApplicationDto,
  ) {
    const mentoring = await this.prisma.mentoring.findUnique({
      where: { id: mentoringId },
    });
    if (!mentoring) {
      throw new NotFoundException('멘토링을 찾을 수 없습니다.');
    }

    if (!mentoring.isActive) {
      throw new BadRequestException('현재 신청할 수 없는 멘토링입니다.');
    }

    if (mentoring.userId === applicantId) {
      throw new BadRequestException('본인의 멘토링에는 신청할 수 없습니다.');
    }

    const existingApplication =
      await this.prisma.mentoringApplication.findUnique({
        where: {
          mentoringId_applicantId_scheduledDate: {
            mentoringId,
            applicantId,
            scheduledDate: new Date(createApplicationDto.scheduledDate),
          },
        },
      });
    if (existingApplication) {
      throw new BadRequestException('이미 해당 시간에 신청하셨습니다.');
    }

    return this.prisma.mentoringApplication.create({
      data: {
        mentoringId,
        applicantId,
        ...createApplicationDto,
      },
      include: {
        applicant: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        mentoring: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }
  async getApplications(mentoringId: string, userId: string) {
    const mentoring = await this.prisma.mentoring.findUnique({
      where: { id: mentoringId },
    });

    if (!mentoring) {
      throw new NotFoundException('멘토링을 찾을 수 없습니다.');
    }

    if (mentoring.userId !== userId) {
      throw new ForbiddenException('본인의 멘토링 신청만 조회할 수 있습니다.');
    }

    return this.prisma.mentoringApplication.findMany({
      where: { mentoringId },
      include: {
        applicant: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // 내 신청 목록 조회 (멘티)
  async getMyApplications(applicantId: string) {
    return this.prisma.mentoringApplication.findMany({
      where: { applicantId },
      include: {
        mentoring: {
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
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // 신청 상태 업데이트 (수락/거절)
  async updateApplicationStatus(
    applicationId: string,
    userId: string,
    updateApplicationStatusDto: UpdateApplicationStatusDto,
  ) {
    const application = await this.prisma.mentoringApplication.findUnique({
      where: { id: applicationId },
      include: {
        mentoring: true,
      },
    });

    if (!application) {
      throw new NotFoundException('신청을 찾을 수 없습니다.');
    }

    if (application.mentoring.userId !== userId) {
      throw new ForbiddenException('본인의 멘토링 신청만 처리할 수 있습니다.');
    }

    return this.prisma.mentoringApplication.update({
      where: { id: applicationId },
      data: {
        status: updateApplicationStatusDto.status,
      },
      include: {
        applicant: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        mentoring: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }
}
