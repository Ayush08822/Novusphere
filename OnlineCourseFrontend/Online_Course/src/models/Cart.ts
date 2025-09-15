export class Cart {
  id: number = 0;
  title: string = "";
  price: number = 0;
  createdBy: string = "";
  rating: number = 0;
  image: File | null = null;

  constructor(id: number, title: string, price: number,createdBy: string, rating: number, image: File | null) {
    this.id = id;
    this.title = title;
    this.price = price;
    this.createdBy = createdBy;
    this.rating = rating;
    this.image = image;
  }
}
