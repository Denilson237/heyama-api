import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { ObjectItem, ObjectItemDocument } from './schemas/object.schema';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { ObjectsGateway } from './objects.gateway';
import 'multer';

@Injectable()
export class ObjectsService {
  constructor(
    @InjectModel(ObjectItem.name)
    private objectModel: Model<ObjectItemDocument>,
    private cloudinaryService: CloudinaryService,
    private objectsGateway: ObjectsGateway,
  ) {}

  async toggleLike(id: string): Promise<ObjectItem> {
    const item = await this.objectModel.findById(id).exec();
    if (!item) {
      throw new NotFoundException(`Object with ID ${id} not found`);
    }

    item.likesCount = (item.likesCount || 0) + 1;
    const updatedItem = await item.save();

    // Émettre l'événement WebSocket pour la mise à jour en direct
    this.objectsGateway.notifyObjectLiked({
      id: updatedItem._id.toString(),
      likesCount: updatedItem.likesCount,
    });

    return updatedItem;
  }

  async create(title: string, description: string, file: Express.Multer.File): Promise<ObjectItem> {
    const uploadResult = await this.cloudinaryService.uploadImage(file);

    const newObject = new this.objectModel({
      title,
      description,
      imageUrl: uploadResult.secure_url,
      imagePublicId: uploadResult.public_id,
    });

    const savedObject = await newObject.save();
    
    this.objectsGateway.notifyObjectCreated(savedObject);

    return savedObject;
  }

  async findAll(): Promise<ObjectItem[]> {
    return this.objectModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<ObjectItem> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException(`Invalid ID format: ${id}`);
    }

    const item = await this.objectModel.findById(id).exec();
    if (!item) {
      throw new NotFoundException(`Object with ID ${id} not found`);
    }
    return item;
  }

  async remove(id: string): Promise<{ message: string }> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException(`Invalid ID format: ${id}`);
    }

    const item = await this.objectModel.findById(id).exec();
    if (!item) {
      throw new NotFoundException(`Object with ID ${id} not found`);
    }

    await this.cloudinaryService.deleteImage(item.imagePublicId);
    await this.objectModel.findByIdAndDelete(id).exec();

    this.objectsGateway.notifyObjectDeleted(id);

    return { message: 'Object deleted successfully' };
  }
}