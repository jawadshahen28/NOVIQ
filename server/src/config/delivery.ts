export const DELIVERY_REGION_CODES = ['WEST_BANK', 'JERUSALEM', 'INSIDE_48'] as const;
export const LEGACY_DELIVERY_REGION_CODES = ['JERUSALEM_AND_48'] as const;

export type DeliveryRegionCode = (typeof DELIVERY_REGION_CODES)[number];
export type LegacyDeliveryRegionCode = (typeof LEGACY_DELIVERY_REGION_CODES)[number];
export type StoredDeliveryRegionCode = DeliveryRegionCode | LegacyDeliveryRegionCode;

interface DeliveryRegionConfig<TCode extends string = DeliveryRegionCode> {
  code: TCode;
  label: string;
  fee: number;
}

export const DELIVERY_REGIONS: Record<DeliveryRegionCode, DeliveryRegionConfig> = {
  WEST_BANK: {
    code: 'WEST_BANK',
    label: 'الضفة الغربية',
    fee: 20,
  },
  JERUSALEM: {
    code: 'JERUSALEM',
    label: 'القدس',
    fee: 30,
  },
  INSIDE_48: {
    code: 'INSIDE_48',
    label: 'الداخل',
    fee: 60,
  },
};

export const STORED_DELIVERY_REGION_CODES = [
  ...DELIVERY_REGION_CODES,
  ...LEGACY_DELIVERY_REGION_CODES,
] as const;

const LEGACY_DELIVERY_REGIONS: Record<
  LegacyDeliveryRegionCode,
  DeliveryRegionConfig<LegacyDeliveryRegionCode>
> = {
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
  return (
    DELIVERY_REGIONS[value as DeliveryRegionCode] ??
    LEGACY_DELIVERY_REGIONS[value as LegacyDeliveryRegionCode]
  );
}
