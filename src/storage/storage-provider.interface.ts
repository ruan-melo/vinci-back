export interface StorageProviderInterface {
  save(file: Express.Multer.File, folder: string): Promise<string>;
  delete(filename: string, folder: string): Promise<void>;
}
