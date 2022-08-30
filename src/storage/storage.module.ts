import { Global, Module } from '@nestjs/common';
import { LocalStorageProvider } from 'src/storage/local-storage-provider';

@Global()
@Module({
  providers: [
    {
      provide: 'StorageProvider',
      useClass:
        process.env.STORAGE_TYPE === 'disk'
          ? LocalStorageProvider
          : LocalStorageProvider,
    },
  ],
  exports: ['StorageProvider'],
})
export class StorageModule {}
