import { Request, Response } from 'express';
import { ProductService } from '../services/product.service.js';
import { CreateProductSchema, UpdateProductSchema } from '@crm/shared';

export class ProductController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const category = req.query.category as string | undefined;
      const search = req.query.search as string | undefined;
      const products = await ProductService.getAll(category, search);
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const product = await ProductService.getById(id);
      if (!product) {
        res.status(404).json({ error: 'Producto no encontrado' });
        return;
      }
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const validated = CreateProductSchema.parse(req.body);
      const product = await ProductService.create(validated);
      res.status(201).json(product);
    } catch (error: any) {
      res.status(400).json({ error: error.errors || error.message });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const validated = UpdateProductSchema.parse(req.body);
      const product = await ProductService.update(id, validated);
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ error: error.errors || error.message });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      await ProductService.delete(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
