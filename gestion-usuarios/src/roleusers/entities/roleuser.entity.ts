@@import { Role } from "src/roles/entities/role.entity";
import { User } from "src/users/entities/user.entity";
import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";

@Entity('user_role')
export class UserRole {
  @PrimaryColumn({ type: 'uuid' })
  id_user!: string;
 
  @PrimaryColumn({ type: 'uuid' })
  id_role!: string;
 
  @Column({ default: true })
  active!: boolean;
 
  @CreateDateColumn()
  assigned_at!: Date;
 
  @UpdateDateColumn({nullable : true})
  updated_at!: Date;
 
  @ManyToOne(() => User, (user) => user.userRoles)
  @JoinColumn({ name: 'id_user' })
  user!: User;
 
  @ManyToOne(() => Role, (role) => role.userRoles)
  @JoinColumn({ name: 'id_role' })
  role!: Role;
}