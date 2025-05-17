import { Module } from '@nestjs/common';
import { SystemController } from './system.controller';
import { SystemService } from './system.service';
import { ObservabilityModule } from '../observability/observability.module';

@Module({
  imports: [ObservabilityModule],
  controllers: [SystemController],
  providers: [SystemService],
})
export class SystemModule {}
