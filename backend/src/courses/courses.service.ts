/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Course, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import slugfy from 'lib/slugify';
import { SearchCourseResponseDto } from './dto/search-rsponse.dto';
import { SearchCourseDto } from './dto/search-course.dto';
import { CourseDetailDto } from './dto/course-detail.dto';
import { CourseFavorite as CourseFavoriteEntity } from 'src/_gen/prisma-class/course_favorite';
import { GetFavoriteResponseDto } from './dto/favorite.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { CourseReview as CourseReviewEntity } from 'src/_gen/prisma-class/course_review';
import { UpdateReviewDto } from './dto/update-review.dto';
import { InstructorReplyDto } from './dto/instructor-reply.dto';
import { CourseReviewsResponseDto } from './dto/course-review-response.dto';
@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: string,
    creatCourseDto: CreateCourseDto,
  ): Promise<Course> {
    return this.prisma.course.create({
      data: {
        title: creatCourseDto.title,
        slug: slugfy(creatCourseDto.title),
        instructorId: userId,
        status: 'DRAFT',
      },
    });
  }
  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.CourseWhereUniqueInput;
    where?: Prisma.CourseWhereInput;
    orderBy?: Prisma.CourseOrderByWithRelationInput;
  }): Promise<Course[]> {
    const { skip, take, cursor, where, orderBy } = params;

    return this.prisma.course.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include: {
        challenge: {
          select: {
            id: true,
            status: true,
            maxParticipants: true,
            currentParticipants: true,
            recruitStartAt: true,
            recruitEndAt: true,
            challengeStartAt: true,
            challengeEndAt: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });
  }

  async findAllMyCourses(userId: string): Promise<Course[]> {
    const enrollments = await this.prisma.courseEnrollment.findMany({
      where: {
        userId,
      },
    });

    return this.prisma.course.findMany({
      where: {
        id: {
          in: enrollments.map((enrollment) => enrollment.courseId),
        },
      },
    });
  }

  async findOne(id: string, userId?: string): Promise<CourseDetailDto | null> {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        challenge: true,
        instructor: true,
        categories: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        enrollments: true,
        sections: {
          include: {
            lectures: {
              select: {
                id: true,
                title: true,
                isPreview: true,
                duration: true,
                order: true,
                videoStorageInfo: true,
              },
              orderBy: {
                order: 'asc',
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
        _count: {
          select: {
            enrollments: true,
            reviews: true,
            lectures: true,
          },
        },
      },
    });

    if (!course) {
      return null;
    }
    const isInstructor = course.instructorId == userId;
    const isEnrolled = userId
      ? !!(await this.prisma.courseEnrollment.findFirst({
          where: {
            userId,
            courseId: id,
          },
        }))
      : false;
    const averageRating =
      course.reviews.length > 0
        ? course.reviews.reduce((sum, review) => sum + review.rating, 0) /
          course.reviews.length
        : 0;
    const totalDuration = course.sections.reduce(
      (sum, section) =>
        sum +
        section.lectures.reduce(
          (lecSum, lecture) => lecSum + (lecture.duration || 0),
          0,
        ),
      0,
    );

    const sectionsWithFilteredVideoStorageInfo = course.sections.map(
      (section) => ({
        ...section,
        lectures: section.lectures.map((lecture) => ({
          ...lecture,
          videoStorageInfo:
            isInstructor || isEnrolled || lecture.isPreview
              ? lecture.videoStorageInfo
              : null,
        })),
      }),
    );

    const result = {
      ...course,
      sections: sectionsWithFilteredVideoStorageInfo,
      isEnrolled,
      totalEnrollments: course._count.enrollments,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: course._count.reviews,
      totalLectures: course._count.lectures,
      totalDuration,
    };
    return result as unknown as CourseDetailDto;
  }

  async update(
    id: string,
    userId: string,
    updateCourseDto: UpdateCourseDto,
  ): Promise<Course> {
    const course = await this.prisma.course.findUnique({
      where: { id },
    });
    if (!course) {
      throw new NotFoundException(`ID: ${id} 코스를 찾을 수 없습니다.`);
    }
    const { categoryIds, ...otherData } = updateCourseDto;
    const data: Prisma.CourseUpdateInput = { ...otherData };

    if (course.instructorId !== userId) {
      throw new UnauthorizedException('강의 소유자만 수정할 수 있습니다.');
    }
    if (categoryIds && categoryIds.length > 0) {
      data.categories = {
        connect: categoryIds.map((id) => ({ id })),
      };
    }

    return this.prisma.course.update({
      where: { id },
      data,
    });
  }
  async delete(id: string, userId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
    });
    if (!course) {
      throw new NotFoundException(`ID: ${id} 코스를 찾을 수 없습니다.`);
    }

    if (course.instructorId !== userId) {
      throw new UnauthorizedException('강의 소유자만 수정할 수 있습니다.');
    }

    await this.prisma.course.delete({
      where: { id },
    });
    return course;
  }

  async searchCourses(
    searchCourseDto: SearchCourseDto,
  ): Promise<SearchCourseResponseDto> {
    const { q, category, priceRange, sortBy, order, page, pageSize } =
      searchCourseDto;

    const where: Prisma.CourseWhereInput = {};

    if (q) {
      where.OR = [
        {
          title: {
            contains: q,
            mode: 'insensitive',
          },
        },
        {
          instructor: {
            name: {
              contains: q,
              mode: 'insensitive',
            },
          },
        },
      ];
    }

    if (category) {
      where.categories = {
        some: {
          slug: category,
        },
      };
    }
    if (priceRange) {
      const priceConditions: any = {};
      if (priceRange.min !== undefined) {
        priceConditions.gte = priceRange.min;
      }
      if (priceRange.max !== undefined) {
        priceConditions.lte = priceRange.max;
      }
      if (Object.keys(priceConditions).length > 0) {
        where.price = priceConditions;
      }
    }

    const orderBy: Prisma.CourseOrderByWithRelationInput = {};
    if (sortBy == 'price') {
      orderBy.price = order as 'asc' | 'desc';
    }
    const skip = (page - 1) * pageSize;
    const totalItems = await this.prisma.course.count({ where });
    const courses = await this.prisma.course.findMany({
      where,
      orderBy,
      skip,
      take: pageSize,
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
          },
        },
        categories: true,
        _count: {
          select: {
            enrollments: true,
            reviews: true,
          },
        },
      },
    });

    // 페이지네이션 정보 계산
    const totalPages = Math.ceil(totalItems / pageSize);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      courses: courses as any[],
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        hasNext,
        hasPrev,
      },
    };
  }
  async addFavorite(courseId: string, userId: string): Promise<boolean> {
    try {
      const existingFavorite = await this.prisma.courseFavorite.findFirst({
        where: {
          userId,
          courseId,
        },
      });
      if (existingFavorite) {
        return true;
      }

      await this.prisma.courseFavorite.create({
        data: {
          userId,
          courseId,
        },
      });
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  async removeFavorite(courseId: string, userId: string): Promise<boolean> {
    try {
      const existingFavorite = await this.prisma.courseFavorite.findFirst({
        where: {
          userId,
          courseId,
        },
      });
      if (existingFavorite) {
        await this.prisma.courseFavorite.delete({
          where: {
            id: existingFavorite.id,
          },
        });
        return true;
      }
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  async getFavorite(
    courseId: string,
    userId?: string,
  ): Promise<GetFavoriteResponseDto> {
    const course = await this.prisma.course.findUnique({
      where: {
        id: courseId,
      },
      include: {
        _count: {
          select: {
            favorites: true,
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException(`${courseId}를 코스를 찾지 못했습니다.`);
    }

    if (userId) {
      const existingFavorite = await this.prisma.courseFavorite.findFirst({
        where: {
          userId,
          courseId,
        },
      });

      return {
        isFavorite: !!existingFavorite,
        favoriteCount: course._count.favorites,
      };
    } else {
      return {
        isFavorite: false,
        favoriteCount: course._count.favorites,
      };
    }
  }

  async getMyFavorites(userId: string): Promise<CourseFavoriteEntity[]> {
    const existingFavorites = await this.prisma.courseFavorite.findMany({
      where: {
        userId,
      },
    });
    return existingFavorites as unknown as CourseFavoriteEntity[];
  }

  async enrollCourse(courseId: string, userId: string): Promise<boolean> {
    try {
      const existingEnroll = await this.prisma.courseEnrollment.findFirst({
        where: {
          userId,
          courseId,
        },
      });
      if (existingEnroll) {
        throw new ConflictException('이미 수강신청한 강의 입니다.');
      }
      await this.prisma.courseEnrollment.create({
        data: {
          userId,
          courseId,
          enrolledAt: new Date(),
        },
      });
      return true;
    } catch (err) {
      throw new Error(err);
    }
  }

  async getAllLectureActivities(courseId: string, userId: string) {
    const courseActivities = await this.prisma.lectureActivity.findMany({
      where: {
        userId,
        courseId,
      },
    });

    return courseActivities;
  }

  async getCourseReviews(
    courseId: string,
    page: number,
    pageSize: number,
    sort: 'latest' | 'oldest' | 'rating_high' | 'rating_low',
    userId?: string,
  ): Promise<CourseReviewsResponseDto> {
    const where: Prisma.CourseReviewWhereInput = {
      courseId,
    };
    const orderBy: Prisma.CourseReviewOrderByWithRelationInput = {};

    if (sort === 'latest') {
      orderBy.createdAt = 'desc';
    } else if (sort === 'oldest') {
      orderBy.createdAt = 'asc';
    } else if (sort === 'rating_high') {
      orderBy.rating = 'desc';
    } else if (sort === 'rating_low') {
      orderBy.rating = 'asc';
    }

    const skip = (page - 1) * pageSize;
    const totalItems = await this.prisma.courseReview.count({ where });
    const totalPages = Math.ceil(totalItems / pageSize);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    const myReview =
      userId &&
      (await this.prisma.courseReview.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId,
          },
        },
      }));
    const reviews = await this.prisma.courseReview.findMany({
      where,
      orderBy,
      skip,
      take: pageSize,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return {
      myReviewExists: !!myReview,
      totalReviewCount: totalItems,
      currentPage: page,
      pageSize,
      totalPages,
      hasNext,
      hasPrev,
      reviews: reviews as unknown as CourseReviewEntity[],
    };
  }

  async createReview(
    courseId: string,
    userId: string,
    createReviewDto: CreateReviewDto,
  ): Promise<CourseReviewEntity> {
    const course = await this.prisma.course.findUnique({
      where: {
        id: courseId,
      },
    });
    if (!course) {
      throw new NotFoundException(`${courseId}를 코스를 찾지 못했습니다.`);
    }
    const enrollment = await this.prisma.courseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });
    if (!enrollment) {
      throw new UnauthorizedException(
        '수강신청한 강의만 리뷰를 작성 할 수 있습니다.',
      );
    }
    const existingReview = await this.prisma.courseReview.findFirst({
      where: {
        userId,
        courseId,
      },
    });
    if (existingReview) {
      throw new ConflictException('이미 리뷰를 작성한 강의 입니다.');
    }

    const review = await this.prisma.courseReview.create({
      data: {
        content: createReviewDto.content,
        rating: createReviewDto.rating,

        user: {
          connect: {
            id: userId,
          },
        },
        course: {
          connect: {
            id: courseId,
          },
        },
      },
    });
    return review as unknown as CourseReviewEntity;
  }

  async updateReview(
    reviewId: string,
    userId: string,
    updateReviewDto: UpdateReviewDto,
  ): Promise<CourseReviewEntity> {
    const existingReview = await this.prisma.courseReview.findFirst({
      where: {
        id: reviewId,
      },
    });
    if (!existingReview) {
      throw new ConflictException('작성하신 리뷰가 존재하지 않습니다.');
    }
    if (existingReview.userId !== userId) {
      throw new UnauthorizedException('작성하신 리뷰만 수정할 수 있습니다.');
    }
    const updatedReview = await this.prisma.courseReview.update({
      where: {
        id: reviewId,
      },
      data: {
        content: updateReviewDto.content,
        rating: updateReviewDto.rating,
      },
    });
    return updatedReview as unknown as CourseReviewEntity;
  }
  async deleteReview(reviewId: string, userId: string): Promise<boolean> {
    const existingReview = await this.prisma.courseReview.findFirst({
      where: {
        id: reviewId,
      },
    });
    if (!existingReview) {
      throw new ConflictException('작성하신 리뷰가 존재하지 않습니다.');
    }
    if (existingReview.userId !== userId) {
      throw new UnauthorizedException('작성하신 리뷰만 삭제할 수 있습니다.');
    }
    await this.prisma.courseReview.delete({
      where: { id: reviewId },
    });
    return true;
  }

  async createInstructorReply(
    reviewId: string,
    userId: string,
    instructorReplyDto: InstructorReplyDto,
  ): Promise<CourseReviewEntity> {
    const review = await this.prisma.courseReview.findUnique({
      where: { id: reviewId },
      include: {
        course: {
          select: {
            instructorId: true,
          },
        },
      },
    });
    if (!review) {
      throw new ConflictException('작성하신 리뷰가 존재하지 않습니다.');
    }
    if (review.course.instructorId !== userId) {
      throw new UnauthorizedException('이미 강사만 답변 할 수 있습니다.');
    }
    const updatedReview = await this.prisma.courseReview.update({
      where: { id: reviewId },
      data: {
        instructorReply: instructorReplyDto.instructorReply,
      },
    });
    return updatedReview as unknown as CourseReviewEntity;
  }

  async getInstructorReviews(userId: string): Promise<CourseReviewEntity[]> {
    const reviews = await this.prisma.courseReview.findMany({
      where: {
        course: {
          instructorId: userId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return reviews as unknown as CourseReviewEntity[];
  }
}
