import { UserRole } from "src/roleusers/entities/roleuser.entity";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { RoleName } from "../enums/role-name.enum";

@Entity('role')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
 
  @Column({ default: true })
  active!: boolean;
 
  @CreateDateColumn()
  created_at!: Date;
 
  @Column({ type: 'text', nullable: true })
  description!: string;
 
  @Column({
    type: 'enum',
    enum: RoleName,
    unique: true,
  })
  name!: RoleName;
 
  @UpdateDateColumn()
  updated_at!: Date;
 
  @OneToMany(() => UserRole, (userRole) => userRole.role)
  userRoles!: UserRole[];
}
 