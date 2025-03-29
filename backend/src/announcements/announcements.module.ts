import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnnouncementsService } from './announcements.service';
import { AnnouncementsController } from './announcements.controller';
import { Announcement } from './entities/announcement.entity';
import { ClansModule } from '../clans/clans.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Announcement]),
    ClansModule, // 引入ClansModule以便在AnnouncementsService中使用ClansService
  ],
  controllers: [AnnouncementsController],
  providers: [AnnouncementsService],
  exports: [AnnouncementsService],
})
export class AnnouncementsModule {}
