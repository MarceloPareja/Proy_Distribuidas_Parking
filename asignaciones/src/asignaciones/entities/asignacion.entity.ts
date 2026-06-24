import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Entidad Asignación — relación propietario ↔ vehículo.
 *
 * ─── Diseño de clave ───
 * Clave compuesta: (user_id, vehicle_id)
 * Ambos son UUIDs validados en los microservicios de Usuarios y Vehículos.
 * Esto garantiza que la misma combinación usuario-vehículo no pueda existir
 * dos veces en la tabla, permitiendo trazabilidad al reactivar/desactivar.
 *
 * ─── Restricción de unicidad activa ───
 * Un índice único parcial (vehicle_id WHERE activo = true) refuerza en BD
 * la regla de negocio: un vehículo solo puede tener UNA asignación activa.
 * La validación también se realiza a nivel de servicio para mensajes claros.
 */
@Entity('asignaciones')
@Index('UQ_vehicle_activo', ['vehicleId'], {
  unique: true,
  where: '"activo" = true',
})
export class Asignacion {
  @PrimaryColumn({ name: 'user_id', type: 'uuid' })
  userId: string;

  @PrimaryColumn({ name: 'vehicle_id', type: 'uuid' })
  vehicleId: string;

  /** Estado de la asignación — permite eliminación lógica y control de unicidad activa */
  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
