declare module 'dom-to-image' {
  interface Options {
    quality?: number;
    bgcolor?: string;
    style?: {
      transform?: string;
      transformOrigin?: string;
    };
  }

  interface DomToImage {
    toJpeg(node: HTMLElement, options?: Options): Promise<string>;
    toPng(node: HTMLElement, options?: Options): Promise<string>;
    toBlob(node: HTMLElement, options?: Options): Promise<Blob>;
    toPixelData(node: HTMLElement, options?: Options): Promise<Uint8ClampedArray>;
  }

  const domtoimage: DomToImage;
  export default domtoimage;
} 