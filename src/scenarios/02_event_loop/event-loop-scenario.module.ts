import { Module } from '@nestjs/common';
import { EventLoopScenarioController } from './event-loop-scenario.controller';
import { EventLoopScenarioService } from './event-loop-scenario.service';

@Module({
  controllers: [EventLoopScenarioController],
  providers: [EventLoopScenarioService],
})
export class EventLoopScenarioModule {}
