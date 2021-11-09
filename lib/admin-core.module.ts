import { DynamicModule, Module, Provider } from '@nestjs/common';

import {
  AdminModuleAsyncOptions,
  AdminModuleOptions,
  AdminOptionsFactory,
} from './common';
import { AppModule, AuthModule, EntitiesModule } from './modules';

import { AdminEnvironment } from './admin-environment';
import { ADMIN_MODULE_OPTIONS } from './admin.constants';

@Module({})
export class AdminCoreModule {
  static register(options: AdminModuleOptions = {}): DynamicModule {
    const adminModuleOptions = {
      provide: ADMIN_MODULE_OPTIONS,
      useValue: options,
    };
    const providers = [adminModuleOptions, AdminEnvironment];

    return {
      global: true,
      module: AdminCoreModule,
      imports: [AppModule, AuthModule, EntitiesModule],
      providers,
      exports: providers,
    };
  }

  static registerAsync(options: AdminModuleAsyncOptions = {}): DynamicModule {
    const providers = [...this.createAsyncProviders(options), AdminEnvironment];

    return {
      global: true,
      module: AdminCoreModule,
      imports: (options.imports || []).concat([
        AppModule,
        AuthModule,
        EntitiesModule,
      ]),
      providers,
      exports: providers,
    };
  }

  private static createAsyncProviders(
    options: AdminModuleAsyncOptions,
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: options.useClass,
        useClass: options.useClass,
      },
    ];
  }

  private static createAsyncOptionsProvider(
    options: AdminModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: ADMIN_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }
    return {
      provide: ADMIN_MODULE_OPTIONS,
      useFactory: async (optionsFactory: AdminOptionsFactory) =>
        await optionsFactory.createAdminOptions(),
      inject: [options.useExisting || options.useClass],
    };
  }
}
