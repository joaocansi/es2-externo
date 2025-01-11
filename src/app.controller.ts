import { Controller, Inject, Post } from '@nestjs/common';
import AppService from './app.service';

@Controller()
export default class AppController {
  constructor(
    @Inject('AppService')
    private readonly appService: AppService,
  ) {}

  @Post('/restaurarBanco')
  async restoreDatabase() {
    await this.appService.restoreDatabase();
  }
}
