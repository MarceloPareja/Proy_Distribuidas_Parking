import { Column, Entity, PrimaryGeneratedColumn, TableInheritance } from 'typeorm';

export enum Clasificacion{
    ELECTRICO = 'Electrico',
    HIBRIDO = 'Hibrido',
    GASOLINA = 'Gasolina',
    DIESEL = 'Diesel'
}

//Estado de ocupación dentro del parqueadero. Es la fuente de verdad
//que consulta el gateway antes de autorizar un ingreso o una salida.
export enum EstadoVehiculo{
    FUERA = 'fuera',
    DENTRO = 'dentro'
}

@Entity()
@TableInheritance({column : {type : 'varchar', name : 'tipo'}})
//Herencia de tablas. Usa como campo diferenciador un campo tipo
export abstract class Vehiculo {

    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({unique: true})
    placa!: string;

    @Column()
    marca!: string;

    @Column()
    modelo!: string;

    @Column()
    color!: string;

    @Column()
    anio!: number; //Puede existir hasta un año más al actual
    
    @Column({type : 'enum', enum : Clasificacion})
    clasificacion!: Clasificacion

    //--- Campos de soporte para el gateway de tickets ---

    @Column({type : 'enum', enum : EstadoVehiculo, default : EstadoVehiculo.FUERA})
    estado!: EstadoVehiculo;

    @Column({type : 'timestamp', nullable : true})
    fechaUltimoIngreso!: Date | null;

    @Column({type : 'timestamp', nullable : true})
    fechaUltimaSalida!: Date | null;

    //Bloqueo administrativo: vehículo reportado, en mora, vetado, etc.
    //El gateway debe rechazar el ingreso si activo = false.
    @Column({default : true})
    activo!: boolean;

    //Referencia al propietario en el microservicio gestion-usuarios.
    //NO es una FK de base de datos (son servicios y bases distintas):
    //es solo un UUID que se valida vía HTTP contra ese servicio.
    //Opcional: admite vehículos de visitantes sin dueño registrado.
    @Column({type : 'uuid', nullable : true})
    idPropietario!: string | null;

    abstract obtenerTipo(): string;
}
