export class SectionData {
  id: number = 0;
  name: string = "";
  courseId: number = 0;
  constructor(id: number, name: string, courseId: number) {
    this.id = id;
    this.name = name;
    this.courseId = courseId;
  }
}
