import { products } from './products';
import type { AdminOrder, AdminOrderItem, OrderStatus } from '../types/catalog';
import { getDiscountedPrice } from '../utils/format';

export const orderStatuses: OrderStatus[] = [
  'جديد',
  'تم التأكيد',
  'قيد التجهيز',
  'مكتمل',
  'ملغي',
];

const cashOnDeliveryMethod = 'الدفع عند الاستلام';

function getProduct(productId: string) {
  const product = products.find((item) => item.id === productId);

  if (!product) {
    throw new Error(`Missing order product: ${productId}`);
  }

  return product;
}

function orderItem(productId: string, quantity: number): AdminOrderItem {
  const product = getProduct(productId);
  const unitPrice = getDiscountedPrice(product);

  return {
    productId: product.id,
    name: product.name,
    image: product.images[0],
    quantity,
    unitPrice,
    lineTotal: unitPrice * quantity,
  };
}

interface CreateOrderInput {
  orderNumber: string;
  customerName: string;
  phone: string;
  address: string;
  notes?: string;
  status: OrderStatus;
  createdAt: string;
  items: AdminOrderItem[];
}

function createOrder(input: CreateOrderInput): AdminOrder {
  const subtotal = input.items.reduce((sum, item) => sum + item.lineTotal, 0);

  return {
    id: input.orderNumber,
    orderNumber: input.orderNumber,
    customerName: input.customerName,
    phone: input.phone,
    address: input.address,
    notes: input.notes,
    items: input.items,
    subtotal,
    total: subtotal,
    status: input.status,
    createdAt: input.createdAt,
    paymentMethod: cashOnDeliveryMethod,
  };
}

export const orders: AdminOrder[] = [
  createOrder({
    orderNumber: 'NVQ-1059',
    customerName: 'ليان عابد',
    phone: '053-910-4545',
    address: 'تل أبيب، شارع ديزنغوف 112، الطابق 4',
    notes: 'يرجى الاتصال قبل الوصول.',
    status: 'جديد',
    createdAt: '2026-09-03T11:40:00.000Z',
    items: [orderItem('prd-boss-001', 1), orderItem('prd-curren-002', 1)],
  }),
  createOrder({
    orderNumber: 'NVQ-1058',
    customerName: 'أحمد منصور',
    phone: '052-441-9801',
    address: 'القدس، بيت حنينا، شارع النخيل 18',
    notes: '',
    status: 'قيد التجهيز',
    createdAt: '2026-09-03T10:20:00.000Z',
    items: [orderItem('prd-rolex-001', 1)],
  }),
  createOrder({
    orderNumber: 'NVQ-1057',
    customerName: 'ريم خليل',
    phone: '054-881-2200',
    address: 'حيفا، وادي النسناس، مبنى 7',
    notes: 'تغليف هدية بسيط.',
    status: 'تم التأكيد',
    createdAt: '2026-09-03T09:45:00.000Z',
    items: [orderItem('prd-curren-001', 1), orderItem('prd-boss-002', 1)],
  }),
  createOrder({
    orderNumber: 'NVQ-1056',
    customerName: 'سامي بدر',
    phone: '050-701-3331',
    address: 'الناصرة، الحي الشرقي، قرب دوار المدينة',
    notes: '',
    status: 'مكتمل',
    createdAt: '2026-09-02T16:10:00.000Z',
    items: [orderItem('prd-rolex-002', 1), orderItem('prd-rolex-003', 1)],
  }),
  createOrder({
    orderNumber: 'NVQ-1055',
    customerName: 'نور عيسى',
    phone: '052-777-4412',
    address: 'يافا، شارع ييفت 61',
    notes: 'العميل طلب التسليم مساءً.',
    status: 'ملغي',
    createdAt: '2026-09-02T12:30:00.000Z',
    items: [orderItem('prd-curren-002', 1)],
  }),
  createOrder({
    orderNumber: 'NVQ-1054',
    customerName: 'كريم حداد',
    phone: '058-334-7710',
    address: 'رام الله، المصيون، بناية الندى',
    notes: '',
    status: 'جديد',
    createdAt: '2026-09-01T17:05:00.000Z',
    items: [orderItem('prd-boss-003', 2)],
  }),
  createOrder({
    orderNumber: 'NVQ-1053',
    customerName: 'هبة مرعي',
    phone: '054-228-6114',
    address: 'عكا، البلدة القديمة، قرب الميناء',
    notes: 'لا توجد ملاحظات خاصة.',
    status: 'تم التأكيد',
    createdAt: '2026-08-31T15:35:00.000Z',
    items: [orderItem('prd-curren-001', 2)],
  }),
  createOrder({
    orderNumber: 'NVQ-1052',
    customerName: 'مازن طه',
    phone: '050-889-1402',
    address: 'بئر السبع، شارع رغر 44',
    notes: '',
    status: 'قيد التجهيز',
    createdAt: '2026-08-30T13:25:00.000Z',
    items: [orderItem('prd-boss-001', 1), orderItem('prd-boss-002', 1), orderItem('prd-boss-003', 1)],
  }),
  createOrder({
    orderNumber: 'NVQ-1051',
    customerName: 'دينا يوسف',
    phone: '052-119-9088',
    address: 'حيفا، الكرمل، شارع موريا 20',
    notes: 'التسليم إلى مكتب الاستقبال.',
    status: 'مكتمل',
    createdAt: '2026-08-28T10:15:00.000Z',
    items: [orderItem('prd-rolex-003', 1)],
  }),
  createOrder({
    orderNumber: 'NVQ-1050',
    customerName: 'جواد سليمان',
    phone: '053-606-8812',
    address: 'اللد، شارع هرتسل 9',
    notes: '',
    status: 'ملغي',
    createdAt: '2026-08-26T18:05:00.000Z',
    items: [orderItem('prd-curren-001', 1)],
  }),
  createOrder({
    orderNumber: 'NVQ-1049',
    customerName: 'رنا ناصر',
    phone: '054-730-5520',
    address: 'القدس، شعفاط، شارع المدارس 5',
    notes: 'يفضل التسليم قبل الظهر.',
    status: 'مكتمل',
    createdAt: '2026-08-21T08:45:00.000Z',
    items: [orderItem('prd-boss-002', 2), orderItem('prd-curren-002', 1)],
  }),
  createOrder({
    orderNumber: 'NVQ-1048',
    customerName: 'طارق أبو زيد',
    phone: '050-440-2167',
    address: 'يافا، شارع القدس 32',
    notes: '',
    status: 'قيد التجهيز',
    createdAt: '2026-08-15T14:20:00.000Z',
    items: [orderItem('prd-rolex-001', 1), orderItem('prd-boss-001', 1)],
  }),
];
