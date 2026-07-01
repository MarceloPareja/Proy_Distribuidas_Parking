import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
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
 * Entidad EventoAuditoria — registro inmutable de cada cambio en asignaciones.
 *
 * Campos requeridos por RF2:
 *  - ID del evento (auto-generado)
 *  - Clave compuesta afectada (user_id + vehicle_id)
 *  - Tipo de acción (CREACIÓN / MODIFICACIÓN / ELIMINACIÓN)
 *  - Timestamp con zona horaria
 *  - Payload del cambio (datos anteriores vs. nuevos)
 */
@Entity('eventos_auditoria')
export class EventoAuditoria {
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

  /** Datos anteriores (null en creación) */
  @Column({ name: 'datos_anteriores', type: 'jsonb', nullable: true })
  datosAnteriores: Record<string, any> | null;

  /** Datos nuevos (null en eliminación) */
  @Column({ name: 'datos_nuevos', type: 'jsonb', nullable: true })
  datosNuevos: Record<string, any> | null;

  /** Timestamp con zona horaria — se genera automáticamente */
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
