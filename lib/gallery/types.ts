export type Artwork={id:number;title:string;artist:string;medium:string;style:string;theme:string;surface:string;size:string;status:string;width:string;height:string;dimensionUnit:string;year:string;description:string;featured:boolean;photos:{id:string;category:string}[]};
export type GalleryEvent={id:string;title:string;description:string;starts_at:string;venue:string;category:string};
export type ArtistProfile={name:string;city:string;photoId:string};
export type GalleryData={artworks:Artwork[];events:GalleryEvent[];artistProfiles?:ArtistProfile[];homepageContent?:{heroArtworkId:number|null;collectionArtworkIds:number[]};unavailable?:boolean;now:number};
