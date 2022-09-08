import { resolve } from 'path';
import { tmpFolder } from 'src/storage/config/upload';
import { StorageProviderInterface } from './storage-provider.interface';
import * as fs from 'fs';

const UPLOAD_DESTINATION = resolve(tmpFolder, '..', 'uploads');

export class LocalStorageProvider implements StorageProviderInterface {
  /**
   *
   * @param file file from the multer middleware
   * @param folder folder to save the file
   * @returns filename
   */
  async save(file: Express.Multer.File, folder: string): Promise<string> {
    const destination = resolve(UPLOAD_DESTINATION, folder, file.filename);
    const result = await fs.promises.rename(
      resolve(file.path),
      resolve(destination),
    );

    return file.filename;
  }
  /**
   *
   * @param filename file from the multer middleware to delete
   * @param folder folder where the file is saved
   */
  async delete(filename: string, folder: string): Promise<void> {
    const location = resolve(UPLOAD_DESTINATION, folder, filename);
    await fs.promises.unlink(location);
  }

  async deleteFromTemp(filename: string, folder: string): Promise<void> {
    const location = resolve(tmpFolder, folder, filename);
    try {
      await fs.promises.unlink(location);
    } catch {
      // do nothing
    }
  }
}
