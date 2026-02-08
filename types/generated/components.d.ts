import type { Schema, Struct } from '@strapi/strapi';

export interface BlocksCodeBlock extends Struct.ComponentSchema {
  collectionName: 'components_blocks_code_blocks';
  info: {
    description: 'A code snippet with syntax highlighting';
    displayName: 'Code Block';
    icon: 'code';
  };
  attributes: {
    code: Schema.Attribute.Text & Schema.Attribute.Required;
    language: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'javascript'>;
  };
}

export interface BlocksImage extends Struct.ComponentSchema {
  collectionName: 'components_blocks_images';
  info: {
    description: 'An image block with optional caption';
    displayName: 'Image';
    icon: 'picture';
  };
  attributes: {
    altText: Schema.Attribute.String;
    caption: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
  };
}

export interface BlocksRichText extends Struct.ComponentSchema {
  collectionName: 'components_blocks_rich_texts';
  info: {
    description: 'A block of text content';
    displayName: 'Rich Text';
    icon: 'align-left';
  };
  attributes: {
    content: Schema.Attribute.RichText & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'blocks.code-block': BlocksCodeBlock;
      'blocks.image': BlocksImage;
      'blocks.rich-text': BlocksRichText;
    }
  }
}
