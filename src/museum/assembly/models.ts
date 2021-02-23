export enum Category {
  A = 0 as i8,
  B = 1 as i8,
  C = 2 as i8,
  D = 4 as i8,
}

@nearBindgen
export class Meme {
  constructor(
    public title: String,
    public artist: String,
    public category: Category,
  ) { }
}
