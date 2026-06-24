import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * Tipo de acción registrada en la auditoría.
 */
export enum TipoAccion {
  CREACION = 'CREACION',
  MODIFICACION = 'MODIFICACION',
  ELIMINACION = 'ELIMINACION',
}

/**
 * Entidad Auditoria — registro inmutable de cada cambio en asignaciones.
 *
 * Campos requeridos por RF2:
 *  - id (uuid auto-generado)
 *  - vehicle_id (uuid de la clave compuesta)
 *  - user_id (uuid de la clave compuesta)
 *  - accion (CREACIÓN / MODIFICACIÓN / ELIMINACIÓN)
 *  - timestamp con zona horaria (auto-generado)
 *  - payload (JSON con datos anteriores vs. nuevos)
 *
 * Tabla indexada para búsquedas rápidas por usuario y vehículo.
 */
@Entity('auditoria')
@Index('IDX_auditoria_user_vehicle', ['userId', 'vehicleId'])
@Index('IDX_auditoria_accion', ['accion'])
@Index('IDX_auditoria_timestamp', ['timestamp'])
export class Auditoria {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** user_id de la clave compuesta afectada */
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  /** vehicle_id de la clave compuesta afectada */
  @Column({ name: 'vehicle_id', type: 'uuid' })
  vehicleId: string;

  /** Tipo de acción: CREACION | MODIFICACION | ELIMINACION */
  @Column({
    type: 'enum',
    enum: TipoAccion,
  })
  accion: TipoAccion;

  /** Payload del cambio: objeto JSON con información del evento */
  @Column({ type: 'jsonb', nullable: true })
  payload: Record<string, any> | null;

  /** Timestamp con zona horaria — se genera automáticamente */
  @CreateDateColumn({ name: 'timestamp', type: 'timestamptz' })
  timestamp: Date;
}
