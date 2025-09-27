// This new class will structure the announcement data
export class AnnouncementData {
  id: number;
  title: string;
  content: string;
  announcerEmail: string;
  createdAt: string;

  constructor(id: number, title: string, content: string, announcerEmail: string, createdAt: string) {
    this.id = id;
    this.title = title;
    this.content = content;
    this.announcerEmail = announcerEmail;
    this.createdAt = createdAt;
  }
}