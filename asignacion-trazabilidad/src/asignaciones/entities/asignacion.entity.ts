import { UUID } from 'crypto';
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
 * Esto garantiza que la misma combinación usuario-vehículo no pueda existir
 * dos veces en la tabla, permitiendo trazabilidad al reactivar/desactivar.
 *
 * ─── Restricción de unicidad activa ───
 * Un índice único parcial (vehicle_id WHERE activo = true) refuerza en BD
 * la regla de negocio: un vehículo solo puede tener UNA asignación activa.
 * La validación también se realiza a nivel de servicio para mensajes claros.
 */
@Entity('asignaciones')
export class Asignacion {
  @PrimaryColumn({ type: 'uuid', name: 'user_id' })
  userId: string;

  @PrimaryColumn({ type: 'uuid', name: 'vehicle_id' })
  vehicleId: string;

  /** Estado de la asignación — permite eliminación lógica y control de unicidad activa */
  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
