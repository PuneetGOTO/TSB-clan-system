import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, ForbiddenException, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { ClansService } from './clans.service';
import { CreateClanDto } from './dto/create-clan.dto';
import { UpdateClanDto } from './dto/update-clan.dto';
import { Clan } from './entities/clan.entity';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('clans')
@Controller('clans')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ClansController {
  constructor(private readonly clansService: ClansService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '创建新战队' })
  @ApiResponse({ status: 201, description: '战队创建成功', type: Clan })
  create(@Body() createClanDto: CreateClanDto) {
    return this.clansService.create(createClanDto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: '获取所有活跃战队列表（公开API）' })
  @ApiResponse({ status: 200, description: '战队列表获取成功', type: [Clan] })
  findAllActive() {
    return this.clansService.findAllActive();
  }

  @Get('admin')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '获取所有战队列表（包括未激活）' })
  @ApiResponse({ status: 200, description: '战队列表获取成功', type: [Clan] })
  findAll() {
    return this.clansService.findAll();
  }

  @Get('main')
  @Public()
  @ApiOperation({ summary: '获取主战队信息' })
  @ApiResponse({ status: 200, description: '主战队信息获取成功', type: Clan })
  findMainClan() {
    return this.clansService.findMainClan();
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: '获取指定战队详情' })
  @ApiResponse({ status: 200, description: '战队详情获取成功', type: Clan })
  findOne(@Param('id') id: string) {
    return this.clansService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.CLAN_LEADER)
  @ApiOperation({ summary: '更新战队信息' })
  @ApiResponse({ status: 200, description: '战队信息更新成功', type: Clan })
  async update(@Param('id') id: string, @Body() updateClanDto: UpdateClanDto, @Request() req) {
    // 如果是战队队长，只能更新自己的战队
    if (req.user.role === UserRole.CLAN_LEADER) {
      const clan = await this.clansService.findOne(id);
      
      // 检查战队是否属于当前队长
      if (clan.leaderId !== req.user.id) {
        throw new ForbiddenException('您只能更新自己的战队');
      }
      
      // 队长不能更改队长，只有管理员可以
      delete updateClanDto.leaderId;
    }
    
    return this.clansService.update(id, updateClanDto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '删除战队' })
  @ApiResponse({ status: 200, description: '战队删除成功' })
  async remove(@Param('id') id: string) {
    await this.clansService.remove(id);
    return { message: '战队删除成功' };
  }

  @Post(':id/activate')
  @Public()
  @ApiOperation({ summary: '激活战队' })
  @ApiResponse({ status: 200, description: '战队激活成功', type: Clan })
  activate(@Param('id') id: string, @Body('activationCode') activationCode: string) {
    return this.clansService.activate(id, activationCode);
  }

  @Post(':id/deactivate')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '停用战队' })
  @ApiResponse({ status: 200, description: '战队停用成功', type: Clan })
  deactivate(@Param('id') id: string) {
    return this.clansService.deactivate(id);
  }

  @Post(':id/update-power')
  @Roles(UserRole.SUPER_ADMIN, UserRole.CLAN_LEADER)
  @ApiOperation({ summary: '更新战队总战力' })
  @ApiResponse({ status: 200, description: '战队总战力更新成功', type: Clan })
  async updateTotalPower(@Param('id') id: string, @Request() req) {
    // 如果是战队队长，只能更新自己的战队
    if (req.user.role === UserRole.CLAN_LEADER) {
      const clan = await this.clansService.findOne(id);
      
      // 检查战队是否属于当前队长
      if (clan.leaderId !== req.user.id) {
        throw new ForbiddenException('您只能更新自己的战队');
      }
    }
    
    return this.clansService.updateTotalPower(id);
  }

  @Post(':id/update-kills')
  @Roles(UserRole.SUPER_ADMIN, UserRole.CLAN_LEADER)
  @ApiOperation({ summary: '更新战队本周击杀数' })
  @ApiResponse({ status: 200, description: '战队本周击杀数更新成功', type: Clan })
  async updateWeeklyKills(@Param('id') id: string, @Request() req) {
    // 如果是战队队长，只能更新自己的战队
    if (req.user.role === UserRole.CLAN_LEADER) {
      const clan = await this.clansService.findOne(id);
      
      // 检查战队是否属于当前队长
      if (clan.leaderId !== req.user.id) {
        throw new ForbiddenException('您只能更新自己的战队');
      }
    }
    
    return this.clansService.updateWeeklyKills(id);
  }

  @Post('reset-weekly-kills')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '重置所有战队的本周击杀数' })
  @ApiResponse({ status: 200, description: '重置成功' })
  async resetAllWeeklyKills() {
    await this.clansService.resetAllWeeklyKills();
    return { message: '所有战队的本周击杀数已重置' };
  }

  @Post(':id/members/:userId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.CLAN_LEADER)
  @ApiOperation({ summary: '添加成员到战队' })
  @ApiResponse({ status: 200, description: '成员添加成功' })
  async addMember(@Param('id') id: string, @Param('userId') userId: string, @Request() req) {
    // 如果是战队队长，只能向自己的战队添加成员
    if (req.user.role === UserRole.CLAN_LEADER) {
      const clan = await this.clansService.findOne(id);
      
      // 检查战队是否属于当前队长
      if (clan.leaderId !== req.user.id) {
        throw new ForbiddenException('您只能向自己的战队添加成员');
      }
    }
    
    await this.clansService.addMemberToClan(id, userId);
    return { message: '成员添加成功' };
  }

  @Delete(':id/members/:userId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.CLAN_LEADER)
  @ApiOperation({ summary: '从战队中移除成员' })
  @ApiResponse({ status: 200, description: '成员移除成功' })
  async removeMember(@Param('id') id: string, @Param('userId') userId: string, @Request() req) {
    // 如果是战队队长，只能从自己的战队移除成员
    if (req.user.role === UserRole.CLAN_LEADER) {
      const clan = await this.clansService.findOne(id);
      
      // 检查战队是否属于当前队长
      if (clan.leaderId !== req.user.id) {
        throw new ForbiddenException('您只能从自己的战队移除成员');
      }
    }
    
    await this.clansService.removeMemberFromClan(id, userId);
    return { message: '成员移除成功' };
  }
}
