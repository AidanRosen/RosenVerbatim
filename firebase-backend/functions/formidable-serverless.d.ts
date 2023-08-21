declare module "formidable-serverless" {
    import * as http from "http";

    /**
     *
     */
    class Formidable {
      constructor(options?: {
        encoding?: string;
        uploadDir?: string;
        keepExtensions?: boolean;
        maxFileSize?: number;
      });

      parse(req: http.IncomingMessage,
        callback: (err: any, fields: any, files: any) => void): void;
    }

    export = Formidable;
}
