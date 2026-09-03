import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ObjectItemDocument = ObjectItem & Document;

@Schema({ timestamps: true })
export class ObjectItem {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  imageUrl: string;

  @Prop({ required: true })
  imagePublicId: string;

  @Prop({ default: 0 })
  likesCount: number;

  createdAt?: Date;
  updatedAt?: Date;
}

export const ObjectItemSchema = SchemaFactory.createForClass(ObjectItem);