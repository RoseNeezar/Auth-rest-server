import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("text", { unique: true, nullable: true })
  googleId: string | null;

  @Column("text", { nullable: true })
  googleAccessToken: string | null;

  @Column("text")
  email: string;

  @Column("text", { nullable: true })
  password: string;

  @Column("text", { unique: true, nullable: true })
  username: string | null;

  @Column("text", { nullable: true })
  photoUrl: string;

  @Column("int", { default: 0 })
  tokenVersion: number;

  @Column("jsonb", { nullable: true })
  other: any;

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updatedAt: Date;
}
