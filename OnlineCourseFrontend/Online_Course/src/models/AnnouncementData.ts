// This new class will structure the announcement data
export class AnnouncementData {
  id: number;
  announcementTitle: string;
  announcementDescription: string;
  email: string;
  createdAt: string;

  constructor(id: number, title: string, content: string, announcerEmail: string, createdAt: string) {
    this.id = id;
    this.announcementTitle = title;
    this.announcementDescription = content;
    this.email = announcerEmail;
    this.createdAt = createdAt;
  }
}