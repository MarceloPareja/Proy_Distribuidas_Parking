import { ApiProperty } from '@nestjs/swagger';
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

    @ApiProperty({ description: 'Identificador único del vehículo', example: '550e8400-e29b-41d4-a716-446655440000' })
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ApiProperty({ description: 'Número de placa del vehículo', example: 'ABC-1234' })
    @Column({unique: true})
    placa!: string;

    @ApiProperty({description : 'Marca del vehículo',example : 'Toyota'})
    @Column()
    marca!: string;

    @ApiProperty({description: 'Modelo del vehículo', example:'Corolla'})
    @Column()
    modelo!: string;

    @ApiProperty({description: 'Color del vehículo', example: 'Rojo'})
    @Column()
    color!: string;

    @ApiProperty({description : 'Año del vehículo' , example : '2020'})
    @Column()
    anio!: number; //Puede existir hasta un año más al actual
    
    @ApiProperty({description: 'Clasificación de vehículo por combustible', example : "Electrico"})
    @Column({type : 'enum', enum : Clasificacion})
    clasificacion!: Clasificacion

    //--- Campos de soporte para el gateway de tickets ---
    @ApiProperty({description: 'Clasificación de vehículo por combustible', example : "Electrico"})
    @Column({type : 'enum', enum : EstadoVehiculo, default : EstadoVehiculo.FUERA})
    estado!: EstadoVehiculo;

    @ApiProperty({description: 'Fecha del último ingreso del vehículo', example: '2023-01-01'})
    @Column({type : 'timestamp', nullable : true})
    fechaUltimoIngreso!: Date | null;

    @ApiProperty({description: 'Fecha de la última salida del vehículo', example: '2023-01-01'})
    @Column({type : 'timestamp', nullable : true})
    fechaUltimaSalida!: Date | null;

    //Bloqueo administrativo: vehículo reportado, en mora, vetado, etc.
    //El gateway debe rechazar el ingreso si activo = false.
    @ApiProperty({description: 'Indica si el vehículo está activo', example: true})
    @Column({default : true})
    activo!: boolean;

    //Referencia al propietario en el microservicio gestion-usuarios.
    //NO es una FK de base de datos (son servicios y bases distintas):
    //es solo un UUID que se valida vía HTTP contra ese servicio.
    //Opcional: admite vehículos de visitantes sin dueño registrado.
    @ApiProperty({description: 'ID del propietario', example: '123e4567-e89b-12d3-a456-426614174000'})
    @Column({type : 'uuid', nullable : true})
    idPropietario!: string | null;

    abstract obtenerTipo(): string;
}
