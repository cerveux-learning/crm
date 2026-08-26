import { Request, Response } from 'express';
import { CustomerService } from '../services/customer.service.js';
import { CreateCustomerSchema, UpdateCustomerSchema, CreateActivitySchema } from '@crm/shared';

export class CustomerController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const search = req.query.search as string | undefined;
      const status = req.query.status as string | undefined;
      const customers = await CustomerService.getAll(search, status);
      res.json(customers);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const customer = await CustomerService.getById(id);
      if (!customer) {
        res.status(404).json({ error: 'Cliente no encontrado' });
        return;
      }
      res.json(customer);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const validated = CreateCustomerSchema.parse(req.body);
      const customer = await CustomerService.create(validated);
      res.status(201).json(customer);
    } catch (error: any) {
      res.status(400).json({ error: error.errors || error.message });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const validated = UpdateCustomerSchema.parse(req.body);
      const customer = await CustomerService.update(id, validated);
      res.json(customer);
    } catch (error: any) {
      res.status(400).json({ error: error.errors || error.message });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      await CustomerService.delete(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async addActivity(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const validated = CreateActivitySchema.parse(req.body);
      const activity = await CustomerService.addActivity(id, validated);
      res.status(201).json(activity);
    } catch (error: any) {
      res.status(400).json({ error: error.errors || error.message });
    }
  }
}
