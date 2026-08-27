import * as fs from "fs";
import * as path from "path";

export class FileUtils {
  static readonly RESULTS_DIR = path.resolve("allure-results");
  static readonly REPORT_DIR = path.resolve("allure-report");

  static ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  static readJsonFile<T>(filePath: string): T | null {
    try {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, "utf-8");
        return JSON.parse(content) as T;
      }
    } catch {
      return null;
    }
    return null;
  }

  static writeJsonFile(filePath: string, data: unknown): void {
    this.ensureDirectoryExists(path.dirname(filePath));
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  }

  static cleanDirectory(dirPath: string): void {
    if (fs.existsSync(dirPath)) {
      fs.rmSync(dirPath, { recursive: true, force: true });
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  static getTimestamp(): string {
    return new Date().toISOString().replace(/[:.]/g, "-");
  }
}
