export type Artwork={id:number;title:string;artist:string;medium:string;style:string;status:string;width:string;height:string;dimensionUnit:string;year:string;description:string;featured:boolean;photos:{id:string;category:string}[]};
export type GalleryEvent={id:string;title:string;description:string;starts_at:string;venue:string;category:string};
export type GalleryData={artworks:Artwork[];events:GalleryEvent[];unavailable?:boolean;now:number};
