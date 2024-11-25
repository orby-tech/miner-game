import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { NewGameParamsDto, NewGameDto } from './models/new-game/dtos/new-game';
import { PublicGame } from '../../common/game';

@Controller('/api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/room/:roomId/')
  async getGame(@Param() params: NewGameParamsDto): Promise<PublicGame> {
    return this.appService.getGameByRoom(params.roomId);
  }

  @Post('/room/:roomId/gen-new-game')
  async genNewGame(
    @Param() params: NewGameParamsDto,
    @Body() body: NewGameDto,
  ): Promise<PublicGame> {
    return this.appService.setNewGame(
      params.roomId,
      body.side,
      body.diamondCount,
    );
  }
}
