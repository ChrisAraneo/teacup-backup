import path from "path";

export abstract class File<T> {
  constructor(private path: string, private content: T) {}

  getFilename(): string {
    const basename = path.basename(this.path);
    const parts = basename.split(".");

    return parts[0];
  }

  getExtension(): string | null {
    const basename = path.basename(this.path);
    const parts = basename.split(".");

    if (parts.length < 2) {
      return null;
    }

    return parts[1];
  }

  getContent(): T {
    return this.content;
  }

  setFilename(filename: string, extension: string | null): void {
    const basename = path.basename(this.path);
    const basenameIndex = this.path.lastIndexOf(basename);

    this.path =
      this.path.substring(0, basenameIndex) +
      filename +
      (extension ? extension : "");
  }
}
