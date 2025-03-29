import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Request, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserRole } from './entities/user.entity';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.CLAN_LEADER)
  @ApiOperation({ summary: '创建新用户' })
  @ApiResponse({ status: 201, description: '用户创建成功', type: User })
  create(@Body() createUserDto: CreateUserDto, @Request() req) {
    // 如果是战队队长创建用户，则自动将用户分配到该队长的战队
    if (req.user.role === UserRole.CLAN_LEADER) {
      createUserDto.clanId = req.user.clanId;
      createUserDto.role = UserRole.CLAN_MEMBER; // 限制队长只能创建队员
    }
    
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '获取所有用户列表' })
  @ApiResponse({ status: 200, description: '用户列表获取成功', type: [User] })
  findAll() {
    return this.usersService.findAll();
  }

  @Get('clan/:clanId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.CLAN_LEADER)
  @ApiOperation({ summary: '获取指定战队的用户列表' })
  @ApiResponse({ status: 200, description: '用户列表获取成功', type: [User] })
  findAllByClanId(@Param('clanId') clanId: string, @Request() req) {
    // 如果是战队队长，只能查看自己战队的用户
    if (req.user.role === UserRole.CLAN_LEADER && req.user.clanId !== clanId) {
      throw new ForbiddenException('您只能查看自己战队的成员');
    }
    
    return this.usersService.findAllByClanId(clanId);
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.CLAN_LEADER)
  @ApiOperation({ summary: '获取指定用户详情' })
  @ApiResponse({ status: 200, description: '用户详情获取成功', type: User })
  findOne(@Param('id') id: string, @Request() req) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.CLAN_LEADER)
  @ApiOperation({ summary: '更新用户信息' })
  @ApiResponse({ status: 200, description: '用户信息更新成功', type: User })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Request() req) {
    // 获取要更新的用户信息
    const user = await this.usersService.findOne(id);
    
    // 如果是战队队长，只能更新自己战队的成员
    if (req.user.role === UserRole.CLAN_LEADER) {
      // 检查要更新的用户是否属于队长的战队
      if (user.clanId !== req.user.clanId) {
        throw new ForbiddenException('您只能更新自己战队的成员');
      }
      
      // 队长不能更改用户的角色和所属战队
      delete updateUserDto.role;
      delete updateUserDto.clanId;
    }
    
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.CLAN_LEADER)
  @ApiOperation({ summary: '删除用户' })
  @ApiResponse({ status: 200, description: '用户删除成功' })
  async remove(@Param('id') id: string, @Request() req) {
    // 获取要删除的用户信息
    const user = await this.usersService.findOne(id);
    
    // 如果是战队队长，只能删除自己战队的成员
    if (req.user.role === UserRole.CLAN_LEADER) {
      // 检查要删除的用户是否属于队长的战队
      if (user.clanId !== req.user.clanId) {
        throw new ForbiddenException('您只能删除自己战队的成员');
      }
      
      // 检查要删除的用户是否是队长自己，队长不能删除自己
      if (user.id === req.user.id) {
        throw new ForbiddenException('队长不能删除自己的账号');
      }
    }
    
    await this.usersService.remove(id);
    return { message: '用户删除成功' };
  }

  @Patch(':id/power')
  @Roles(UserRole.SUPER_ADMIN, UserRole.CLAN_LEADER)
  @ApiOperation({ summary: '更新用户战力' })
  @ApiResponse({ status: 200, description: '用户战力更新成功', type: User })
  async updatePower(@Param('id') id: string, @Body('power') power: number, @Request() req) {
    // 获取要更新的用户信息
    const user = await this.usersService.findOne(id);
    
    // 如果是战队队长，只能更新自己战队的成员
    if (req.user.role === UserRole.CLAN_LEADER && user.clanId !== req.user.clanId) {
      throw new ForbiddenException('您只能更新自己战队的成员');
    }
    
    return this.usersService.updatePower(id, power);
  }

  @Patch(':id/kills')
  @Roles(UserRole.SUPER_ADMIN, UserRole.CLAN_LEADER)
  @ApiOperation({ summary: '更新用户本周击杀数' })
  @ApiResponse({ status: 200, description: '用户击杀数更新成功', type: User })
  async updateKills(@Param('id') id: string, @Body('kills') kills: number, @Request() req) {
    // 获取要更新的用户信息
    const user = await this.usersService.findOne(id);
    
    // 如果是战队队长，只能更新自己战队的成员
    if (req.user.role === UserRole.CLAN_LEADER && user.clanId !== req.user.clanId) {
      throw new ForbiddenException('您只能更新自己战队的成员');
    }
    
    return this.usersService.updateWeeklyKills(id, kills);
  }

  @Post('reset-weekly-kills')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '重置所有用户的本周击杀数' })
  @ApiResponse({ status: 200, description: '重置成功' })
  async resetWeeklyKills() {
    await this.usersService.resetWeeklyKills();
    return { message: '所有用户的本周击杀数已重置' };
  }
}
