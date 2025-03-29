import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { Announcement } from './entities/announcement.entity';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('announcements')
@Controller('announcements')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.CLAN_LEADER)
  @ApiOperation({ summary: '创建公告' })
  @ApiResponse({ status: 201, description: '公告创建成功', type: Announcement })
  async create(@Body() createAnnouncementDto: CreateAnnouncementDto, @Request() req) {
    // 如果是战队队长，只能为自己的战队创建公告
    if (req.user.role === UserRole.CLAN_LEADER) {
      // 未指定战队ID时，自动设置为队长所属战队
      if (!createAnnouncementDto.clanId) {
        createAnnouncementDto.clanId = req.user.clanId;
      } 
      // 指定了战队ID但不是自己的战队时，禁止操作
      else if (createAnnouncementDto.clanId !== req.user.clanId) {
        throw new ForbiddenException('您只能为自己的战队创建公告');
      }
    }
    
    return this.announcementsService.create(createAnnouncementDto, req.user.id);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: '获取公告列表' })
  @ApiQuery({ name: 'clanId', required: false, description: '战队ID，不提供则获取全局公告' })
  @ApiResponse({ status: 200, description: '公告列表获取成功', type: [Announcement] })
  findAll(@Query('clanId') clanId?: string) {
    return this.announcementsService.findAll(clanId);
  }

  @Get('pinned')
  @Public()
  @ApiOperation({ summary: '获取置顶公告列表' })
  @ApiQuery({ name: 'clanId', required: false, description: '战队ID，不提供则获取全局置顶公告' })
  @ApiResponse({ status: 200, description: '置顶公告列表获取成功', type: [Announcement] })
  findAllPinned(@Query('clanId') clanId?: string) {
    return this.announcementsService.findAllPinned(clanId);
  }

  @Get('month/:year/:month')
  @Public()
  @ApiOperation({ summary: '获取指定月份的公告列表' })
  @ApiQuery({ name: 'clanId', required: false, description: '战队ID，不提供则获取全局公告' })
  @ApiResponse({ status: 200, description: '月度公告列表获取成功', type: [Announcement] })
  findByMonth(
    @Param('year') year: number,
    @Param('month') month: number,
    @Query('clanId') clanId?: string,
  ) {
    return this.announcementsService.findByMonth(year, month, clanId);
  }

  @Get('search')
  @Public()
  @ApiOperation({ summary: '搜索公告' })
  @ApiQuery({ name: 'keyword', required: true, description: '搜索关键词' })
  @ApiQuery({ name: 'clanId', required: false, description: '战队ID，不提供则搜索全局公告' })
  @ApiResponse({ status: 200, description: '搜索结果获取成功', type: [Announcement] })
  search(@Query('keyword') keyword: string, @Query('clanId') clanId?: string) {
    return this.announcementsService.search(keyword, clanId);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: '获取公告详情' })
  @ApiResponse({ status: 200, description: '公告详情获取成功', type: Announcement })
  findOne(@Param('id') id: string) {
    return this.announcementsService.findOne(id);
  }

  @Post(':id/view')
  @Public()
  @ApiOperation({ summary: '增加公告浏览次数' })
  @ApiResponse({ status: 200, description: '浏览次数增加成功', type: Announcement })
  incrementViewCount(@Param('id') id: string) {
    return this.announcementsService.incrementViewCount(id);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.CLAN_LEADER)
  @ApiOperation({ summary: '更新公告' })
  @ApiResponse({ status: 200, description: '公告更新成功', type: Announcement })
  async update(@Param('id') id: string, @Body() updateAnnouncementDto: UpdateAnnouncementDto, @Request() req) {
    // 获取要更新的公告
    const announcement = await this.announcementsService.findOne(id);
    
    // 如果是战队队长，只能更新自己战队的公告
    if (req.user.role === UserRole.CLAN_LEADER) {
      // 检查公告是否属于队长的战队
      if (announcement.clanId !== req.user.clanId) {
        throw new ForbiddenException('您只能更新自己战队的公告');
      }
      
      // 不允许队长将公告转移到其他战队
      if (updateAnnouncementDto.clanId && updateAnnouncementDto.clanId !== req.user.clanId) {
        throw new ForbiddenException('您不能将公告转移到其他战队');
      }
    }
    
    return this.announcementsService.update(id, updateAnnouncementDto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.CLAN_LEADER)
  @ApiOperation({ summary: '删除公告' })
  @ApiResponse({ status: 200, description: '公告删除成功' })
  async remove(@Param('id') id: string, @Request() req) {
    // 获取要删除的公告
    const announcement = await this.announcementsService.findOne(id);
    
    // 如果是战队队长，只能删除自己战队的公告
    if (req.user.role === UserRole.CLAN_LEADER && announcement.clanId !== req.user.clanId) {
      throw new ForbiddenException('您只能删除自己战队的公告');
    }
    
    await this.announcementsService.remove(id);
    return { message: '公告删除成功' };
  }
}
