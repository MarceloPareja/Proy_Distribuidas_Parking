import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { PersonasService } from './personas.service';
import { CreatePersonaDto } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';

@Controller('personas')
export class PersonasController {
  constructor(private readonly personasService: PersonasService) {}

  @Post()
  create(@Body() createPersonaDto: CreatePersonaDto) {
    return this.personasService.create(createPersonaDto);
  }

  @Get()
  findAll() {
    return this.personasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.personasService.findOne(id);
  }

  @Get('dni/:dni')
  findByDni(@Param('dni') dni: string) {
    return this.personasService.findByDni(dni);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePersonaDto: UpdatePersonaDto) {
    return this.personasService.update(id, updatePersonaDto);
  }

  @Patch('/activate/:id')
  activate(@Param('id') id: string) {
    return this.personasService.activate(id);
  }

  @Patch('/deactivate/:id')
  deactivate(@Param('id') id: string) {
    return this.personasService.deactivate(id);
  }

}
