import 'dotenv/config';
import { prisma } from './prisma.js';

async function main() {
  console.log('🌱 Starting CRM database seed...');

  // Clear existing data
  await prisma.activity.deleteMany({});
  await prisma.saleOrderItem.deleteMany({});
  await prisma.saleOrder.deleteMany({});
  await prisma.deal.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.customer.deleteMany({});

  // 1. Create Products & Services
  const p1 = await prisma.product.create({
    data: {
      code: 'SRV-DEV-01',
      name: 'Desarrollo de Software a Medida',
      description: 'Consultoría y desarrollo fullstack para aplicaciones web y móviles',
      category: 'SERVICE',
      unitPrice: 2500,
      cost: 1200,
      stock: 99,
      active: true,
    },
  });

  const p2 = await prisma.product.create({
    data: {
      code: 'SUB-CRM-PRO',
      name: 'Licencia CRM Cloud Anual',
      description: 'Suscripción por 1 año con soporte prioritario y usuarios ilimitados',
      category: 'SUBSCRIPTION',
      unitPrice: 1200,
      cost: 150,
      stock: 500,
      active: true,
    },
  });

  const p3 = await prisma.product.create({
    data: {
      code: 'SRV-CONS-AUDIT',
      name: 'Auditoría de Seguridad y DevOps',
      description: 'Revisión exhaustiva de infraestructura cloud y optimización CI/CD',
      category: 'SERVICE',
      unitPrice: 1800,
      cost: 600,
      stock: 50,
      active: true,
    },
  });

  const p4 = await prisma.product.create({
    data: {
      code: 'HW-POS-TERMINAL',
      name: 'Terminal POS Inteligente Touch',
      description: 'Dispositivo físico para cobros en punto de venta con lector contactless',
      category: 'PRODUCT',
      unitPrice: 450,
      cost: 250,
      stock: 45,
      active: true,
    },
  });

  console.log('✅ Products created');

  // 2. Create Customers
  const c1 = await prisma.customer.create({
    data: {
      name: 'Carlos Mendoza',
      email: 'carlos.mendoza@innovasolutions.com',
      phone: '+34 611 223 344',
      company: 'Innova Solutions S.L.',
      position: 'Director de Tecnología (CTO)',
      status: 'CUSTOMER',
      address: 'Paseo de la Castellana 45, Madrid',
      tags: JSON.stringify(['Tecnología', 'B2B', 'VIP']),
      notes: 'Cliente de alto valor interesado en modernizar su infraestructura ERP.',
    },
  });

  const c2 = await prisma.customer.create({
    data: {
      name: 'Lucía Fernández',
      email: 'lfernandez@globalretail.net',
      phone: '+34 622 334 455',
      company: 'Global Retail Group',
      position: 'Gerente de Operaciones',
      status: 'PROSPECT',
      address: 'Avinguda Diagonal 210, Barcelona',
      tags: JSON.stringify(['Retail', 'E-commerce']),
      notes: 'Solicitó presupuesto para 10 terminales POS y migración cloud.',
    },
  });

  const c3 = await prisma.customer.create({
    data: {
      name: 'Martín Gómez',
      email: 'mgomez@finanzasyseguros.es',
      phone: '+34 633 445 566',
      company: 'Finanzas & Seguros Iberia',
      position: 'Director Comercial',
      status: 'LEAD',
      address: 'Gran Vía 12, Valencia',
      tags: JSON.stringify(['Finanzas', 'Nuevo Lead']),
      notes: 'Contacto recibido desde campaña de marketing en LinkedIn.',
    },
  });

  const c4 = await prisma.customer.create({
    data: {
      name: 'Elena Romero',
      email: 'eromero@logisticanorte.com',
      phone: '+34 644 556 677',
      company: 'Logística del Norte S.A.',
      position: 'Directora General (CEO)',
      status: 'CUSTOMER',
      address: 'Polígono Industrial Las Mercedes, Bilbao',
      tags: JSON.stringify(['Logística', 'Recurrente']),
      notes: 'Facturación periódica de suscripciones y soporte continuo.',
    },
  });

  console.log('✅ Customers created');

  // 3. Create Deals in Pipeline
  const now = new Date();

  await prisma.deal.create({
    data: {
      title: 'Implementación Cloud CRM & DevOps',
      value: 7400,
      currency: 'USD',
      stage: 'WON',
      priority: 'HIGH',
      probability: 100,
      expectedCloseDate: new Date(now.getFullYear(), now.getMonth(), 15),
      customerId: c1.id,
      notes: 'Contrato firmado con anticipo del 50%.',
    },
  });

  await prisma.deal.create({
    data: {
      title: 'Equipamiento POS + Sistema de Cobro',
      value: 4500,
      currency: 'USD',
      stage: 'NEGOTIATION',
      priority: 'HIGH',
      probability: 80,
      expectedCloseDate: new Date(now.getFullYear(), now.getMonth() + 1, 10),
      customerId: c2.id,
      notes: 'Revisando términos de garantía y plazo de entrega.',
    },
  });

  await prisma.deal.create({
    data: {
      title: 'Consultoría y Automatización de Procesos',
      value: 3600,
      currency: 'USD',
      stage: 'PROPOSAL',
      priority: 'MEDIUM',
      probability: 60,
      expectedCloseDate: new Date(now.getFullYear(), now.getMonth() + 1, 25),
      customerId: c3.id,
      notes: 'Propuesta enviada por email, esperando reunión de feedback.',
    },
  });

  await prisma.deal.create({
    data: {
      title: 'Renovación Licencias CRM Pro 2026',
      value: 2400,
      currency: 'USD',
      stage: 'QUALIFIED',
      priority: 'MEDIUM',
      probability: 30,
      expectedCloseDate: new Date(now.getFullYear(), now.getMonth() + 2, 5),
      customerId: c4.id,
      notes: 'Evaluando ampliación de cupo para nuevos empleados.',
    },
  });

  await prisma.deal.create({
    data: {
      title: 'Integración Pasarela de Pagos',
      value: 1900,
      currency: 'USD',
      stage: 'LEAD',
      priority: 'LOW',
      probability: 10,
      expectedCloseDate: new Date(now.getFullYear(), now.getMonth() + 2, 28),
      customerId: c3.id,
      notes: 'Primer contacto realizado.',
    },
  });

  console.log('✅ Deals created');

  // 4. Create Sale Orders & Invoices
  // Invoice 1 - Paid
  const inv1 = await prisma.saleOrder.create({
    data: {
      orderNumber: 'FAC-2026-0001',
      type: 'INVOICE',
      status: 'PAID',
      customerId: c1.id,
      issueDate: new Date(now.getFullYear(), now.getMonth() - 1, 10),
      dueDate: new Date(now.getFullYear(), now.getMonth(), 10),
      subtotal: 5000,
      taxRate: 0.21,
      taxAmount: 1050,
      discountAmount: 0,
      total: 6050,
      notes: 'Pago recibido por transferencia bancaria.',
      items: {
        create: [
          {
            productId: p1.id,
            description: 'Desarrollo de Software a Medida - Fase 1',
            quantity: 2,
            unitPrice: 2500,
            discount: 0,
            total: 5000,
          },
        ],
      },
    },
  });

  // Invoice 2 - Paid this month
  const inv2 = await prisma.saleOrder.create({
    data: {
      orderNumber: 'FAC-2026-0002',
      type: 'INVOICE',
      status: 'PAID',
      customerId: c4.id,
      issueDate: new Date(now.getFullYear(), now.getMonth(), 5),
      dueDate: new Date(now.getFullYear(), now.getMonth() + 1, 5),
      subtotal: 2400,
      taxRate: 0.21,
      taxAmount: 504,
      discountAmount: 0,
      total: 2904,
      notes: 'Suscripción anual 2 licencias.',
      items: {
        create: [
          {
            productId: p2.id,
            description: 'Licencia CRM Cloud Anual (x2)',
            quantity: 2,
            unitPrice: 1200,
            discount: 0,
            total: 2400,
          },
        ],
      },
    },
  });

  // Quote 1 - Sent
  await prisma.saleOrder.create({
    data: {
      orderNumber: 'COT-2026-0001',
      type: 'QUOTE',
      status: 'SENT',
      customerId: c2.id,
      issueDate: new Date(now.getFullYear(), now.getMonth(), 12),
      dueDate: new Date(now.getFullYear(), now.getMonth(), 28),
      subtotal: 4500,
      taxRate: 0.21,
      taxAmount: 945,
      discountAmount: 0,
      total: 5445,
      notes: 'Cotización válida por 15 días.',
      items: {
        create: [
          {
            productId: p4.id,
            description: 'Terminal POS Inteligente Touch (10 unidades)',
            quantity: 10,
            unitPrice: 450,
            discount: 0,
            total: 4500,
          },
        ],
      },
    },
  });

  console.log('✅ Sales and Invoices created');

  // 5. Create Activities
  await prisma.activity.create({
    data: {
      type: 'CALL',
      title: 'Llamada de seguimiento con Innova Solutions',
      description: 'Revisión de requerimientos para la integración del módulo de facturación.',
      completed: true,
      customerId: c1.id,
    },
  });

  await prisma.activity.create({
    data: {
      type: 'MEETING',
      title: 'Demostración de producto con Global Retail',
      description: 'Presentación en vivo del sistema y resolución de dudas técnicas.',
      completed: false,
      dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2),
      customerId: c2.id,
    },
  });

  await prisma.activity.create({
    data: {
      type: 'TASK',
      title: 'Enviar presupuesto actualizado a Finanzas Iberia',
      description: 'Ajustar descuento por volumen solicitado en la reunión.',
      completed: false,
      dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
      customerId: c3.id,
    },
  });

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
