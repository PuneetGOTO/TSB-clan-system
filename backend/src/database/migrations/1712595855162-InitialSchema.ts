import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1712595855162 implements MigrationInterface {
    name = 'InitialSchema1712595855162'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 创建用户表
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "username" character varying NOT NULL,
                "password" character varying NOT NULL,
                "email" character varying NOT NULL,
                "role" character varying NOT NULL DEFAULT 'CLAN_MEMBER',
                "isActive" boolean NOT NULL DEFAULT true,
                "power" integer NOT NULL DEFAULT '0',
                "weeklyKills" integer NOT NULL DEFAULT '0',
                "clanId" uuid,
                "twoFactorSecret" character varying,
                "isTwoFactorEnabled" boolean NOT NULL DEFAULT false,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"),
                CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
            )
        `);

        // 创建战队表
        await queryRunner.query(`
            CREATE TABLE "clans" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "description" text,
                "leaderId" uuid NOT NULL,
                "totalPower" integer NOT NULL DEFAULT '0',
                "weeklyKills" integer NOT NULL DEFAULT '0',
                "isActive" boolean NOT NULL DEFAULT true,
                "isMainClan" boolean NOT NULL DEFAULT false,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_cfc848edf47ddcbb3d39d0878e5" UNIQUE ("name"),
                CONSTRAINT "PK_2d11fd5e86e15426251a4811fcf" PRIMARY KEY ("id")
            )
        `);

        // 创建公告表
        await queryRunner.query(`
            CREATE TABLE "announcements" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "title" character varying NOT NULL,
                "content" text NOT NULL,
                "isPinned" boolean NOT NULL DEFAULT false,
                "clanId" uuid,
                "authorId" uuid NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_b3ad840eb86d6eea4d1c537eaf2" PRIMARY KEY ("id")
            )
        `);

        // 创建任务表
        await queryRunner.query(`
            CREATE TABLE "tasks" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "title" character varying NOT NULL,
                "description" text,
                "status" character varying NOT NULL DEFAULT 'TODO',
                "priority" character varying NOT NULL DEFAULT 'MEDIUM',
                "dueDate" TIMESTAMP,
                "progress" integer NOT NULL DEFAULT '0',
                "clanId" uuid NOT NULL,
                "assignedToId" uuid,
                "createdById" uuid NOT NULL,
                "completedAt" TIMESTAMP,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_8d12ff38fcc62aaba2cab748772" PRIMARY KEY ("id")
            )
        `);

        // 添加外键约束
        await queryRunner.query(`
            ALTER TABLE "users" 
            ADD CONSTRAINT "FK_user_clan" 
            FOREIGN KEY ("clanId") 
            REFERENCES "clans"("id") 
            ON DELETE SET NULL 
            ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "clans" 
            ADD CONSTRAINT "FK_clan_leader" 
            FOREIGN KEY ("leaderId") 
            REFERENCES "users"("id") 
            ON DELETE NO ACTION 
            ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "announcements" 
            ADD CONSTRAINT "FK_announcement_clan" 
            FOREIGN KEY ("clanId") 
            REFERENCES "clans"("id") 
            ON DELETE CASCADE 
            ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "announcements" 
            ADD CONSTRAINT "FK_announcement_author" 
            FOREIGN KEY ("authorId") 
            REFERENCES "users"("id") 
            ON DELETE NO ACTION 
            ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "tasks" 
            ADD CONSTRAINT "FK_task_clan" 
            FOREIGN KEY ("clanId") 
            REFERENCES "clans"("id") 
            ON DELETE CASCADE 
            ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "tasks" 
            ADD CONSTRAINT "FK_task_assignee" 
            FOREIGN KEY ("assignedToId") 
            REFERENCES "users"("id") 
            ON DELETE SET NULL 
            ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "tasks" 
            ADD CONSTRAINT "FK_task_creator" 
            FOREIGN KEY ("createdById") 
            REFERENCES "users"("id") 
            ON DELETE NO ACTION 
            ON UPDATE NO ACTION
        `);

        // 创建UUID扩展（如果不存在）
        await queryRunner.query(`
            CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 删除外键约束
        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_task_creator"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_task_assignee"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_task_clan"`);
        await queryRunner.query(`ALTER TABLE "announcements" DROP CONSTRAINT "FK_announcement_author"`);
        await queryRunner.query(`ALTER TABLE "announcements" DROP CONSTRAINT "FK_announcement_clan"`);
        await queryRunner.query(`ALTER TABLE "clans" DROP CONSTRAINT "FK_clan_leader"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_user_clan"`);

        // 删除表
        await queryRunner.query(`DROP TABLE "tasks"`);
        await queryRunner.query(`DROP TABLE "announcements"`);
        await queryRunner.query(`DROP TABLE "clans"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }
}
