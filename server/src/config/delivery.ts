export const DELIVERY_REGION_CODES = ['WEST_BANK', 'JERUSALEM_AND_48'] as const;

export type DeliveryRegionCode = (typeof DELIVERY_REGION_CODES)[number];

interface DeliveryRegionConfig {
  code: DeliveryRegionCode;
  label: string;
  fee: number;
}

export const DELIVERY_REGIONS: Record<DeliveryRegionCode, DeliveryRegionConfig> = {
  WEST_BANK: {
    code: 'WEST_BANK',
    label: 'الضفة الغربية',
    fee: 20,
  },
  JERUSALEM_AND_48: {
    code: 'JERUSALEM_AND_48',
    label: 'القدس والداخل',
    fee: 60,
  },
};

export function getDeliveryRegionConfig(deliveryRegion: DeliveryRegionCode) {
  return DELIVERY_REGIONS[deliveryRegion];
}

export function resolveDeliveryRegionConfig(value: string | undefined) {
  return DELIVERY_REGION_CODES.includes(value as DeliveryRegionCode)
    ? DELIVERY_REGIONS[value as DeliveryRegionCode]
    : undefined;
}
