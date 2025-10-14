export class SectionData {
  id: number = 0;
  name: string = "";
  courseId: string = "";
  constructor(id: number, name: string, courseId: string) {
    this.id = id;
    this.name = name;
    this.courseId = courseId;
  }
}
