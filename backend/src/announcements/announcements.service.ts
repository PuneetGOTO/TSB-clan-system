import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan, Between } from 'typeorm';
import { Announcement } from './entities/announcement.entity';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { ClansService } from '../clans/clans.service';

@Injectable()
export class AnnouncementsService {
  constructor(
    @InjectRepository(Announcement)
    private announcementsRepository: Repository<Announcement>,
    private clansService: ClansService,
  ) {}

  async create(createAnnouncementDto: CreateAnnouncementDto, userId: string): Promise<Announcement> {
    // 检查战队ID是否有效（如果提供了）
    if (createAnnouncementDto.clanId) {
      await this.clansService.findOne(createAnnouncementDto.clanId);
    }

    // 检查是否已经有3个置顶公告
    if (createAnnouncementDto.isPinned) {
      const pinnedCount = await this.announcementsRepository.count({
        where: {
          isPinned: true,
          ...(createAnnouncementDto.clanId ? { clanId: createAnnouncementDto.clanId } : { clanId: null }),
        },
      });

      if (pinnedCount >= 3) {
        throw new ForbiddenException('最多只能有3个置顶公告');
      }
    }

    // 创建新公告
    const announcement = this.announcementsRepository.create({
      ...createAnnouncementDto,
      authorId: userId,
    });

    return this.announcementsRepository.save(announcement);
  }

  async findAll(clanId?: string): Promise<Announcement[]> {
    const queryOptions: any = {
      order: {
        isPinned: 'DESC',
        createdAt: 'DESC',
      },
      relations: ['author', 'clan'],
    };

    if (clanId) {
      queryOptions.where = { clanId };
    }

    return this.announcementsRepository.find(queryOptions);
  }

  async findAllPinned(clanId?: string): Promise<Announcement[]> {
    const queryOptions: any = {
      where: { isPinned: true },
      order: { createdAt: 'DESC' },
      relations: ['author', 'clan'],
    };

    if (clanId) {
      queryOptions.where.clanId = clanId;
    }

    return this.announcementsRepository.find(queryOptions);
  }

  async findOne(id: string): Promise<Announcement> {
    const announcement = await this.announcementsRepository.findOne({
      where: { id },
      relations: ['author', 'clan'],
    });

    if (!announcement) {
      throw new NotFoundException(`ID为${id}的公告不存在`);
    }

    return announcement;
  }

  async update(id: string, updateAnnouncementDto: UpdateAnnouncementDto): Promise<Announcement> {
    const announcement = await this.findOne(id);

    // 检查是否要更新置顶状态，且要置顶
    if (updateAnnouncementDto.isPinned && !announcement.isPinned) {
      // 检查是否已经有3个置顶公告
      const pinnedCount = await this.announcementsRepository.count({
        where: {
          isPinned: true,
          ...(announcement.clanId ? { clanId: announcement.clanId } : { clanId: null }),
        },
      });

      if (pinnedCount >= 3) {
        throw new ForbiddenException('最多只能有3个置顶公告');
      }
    }

    // 更新公告
    this.announcementsRepository.merge(announcement, updateAnnouncementDto);
    return this.announcementsRepository.save(announcement);
  }

  async remove(id: string): Promise<void> {
    const announcement = await this.findOne(id);
    await this.announcementsRepository.remove(announcement);
  }

  async incrementViewCount(id: string): Promise<Announcement> {
    const announcement = await this.findOne(id);
    announcement.viewCount += 1;
    return this.announcementsRepository.save(announcement);
  }

  async findByMonth(year: number, month: number, clanId?: string): Promise<Announcement[]> {
    // 计算月份的开始和结束日期
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999); // 月份最后一天的结束时间

    const queryOptions: any = {
      where: {
        createdAt: Between(startDate, endDate),
      },
      order: {
        createdAt: 'DESC',
      },
      relations: ['author', 'clan'],
    };

    if (clanId) {
      queryOptions.where.clanId = clanId;
    }

    return this.announcementsRepository.find(queryOptions);
  }

  async search(keyword: string, clanId?: string): Promise<Announcement[]> {
    const queryBuilder = this.announcementsRepository.createQueryBuilder('announcement')
      .leftJoinAndSelect('announcement.author', 'author')
      .leftJoinAndSelect('announcement.clan', 'clan')
      .where('(announcement.title LIKE :keyword OR announcement.content LIKE :keyword)', { keyword: `%${keyword}%` })
      .orderBy('announcement.isPinned', 'DESC')
      .addOrderBy('announcement.createdAt', 'DESC');

    if (clanId) {
      queryBuilder.andWhere('announcement.clanId = :clanId', { clanId });
    }

    return queryBuilder.getMany();
  }
}
