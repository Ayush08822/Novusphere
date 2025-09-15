export class FileResponse {
  id: number;
  title: string;
  data: string;
  contentType: string; // Added to store the actual MIME type of the video

  constructor(id: number, title: string, data: string, contentType: string) {
    this.id = id;
    this.title = title;
    this.data = data;
    this.contentType = contentType;
  }
}