export class CourseFormData {
  id: number = 0;
  tags: string = "";
  title: string = "";
  description: string = "";
  aboutAuthor: string = "";
  price: number = 0;
  rating: number = 0;
  studentsEnrolled: number = 0;
  createdBy: string = "";
  image: File | null = null;
  public: boolean = false;
  updatedAt: string = "";

  constructor(
    id: number,
    tags: string,
    title: string,
    description: string,
    aboutAuthor: string,
    price: number,
    createdBy: string,
    image: File | null,
    isPublic: boolean,
    updatedAt: string
  ) {
    this.id = id;
    this.tags = tags;
    this.title = title;
    this.description = description;
    this.aboutAuthor = aboutAuthor;
    this.price = price;
    this.createdBy = createdBy;
    this.image = image;
    this.public = isPublic;
    this.updatedAt = updatedAt;
  }
}
