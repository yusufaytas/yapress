export type ContentRef = {
  title: string;
  permalink: string;
};

export type MediaAsset = {
  assetPath: string;
  pagePath: string;
  contentType: string;
  size: number;
  width?: number;
  height?: number;
  references: ContentRef[];
};
