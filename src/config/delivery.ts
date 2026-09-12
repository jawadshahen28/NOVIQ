export const DELIVERY_REGION_OPTIONS = [
  {
    value: 'WEST_BANK',
    label: 'الضفة الغربية',
    fee: 20,
  },
  {
    value: 'JERUSALEM',
    label: 'القدس',
    fee: 30,
  },
  {
    value: 'INSIDE_48',
    label: 'الداخل',
    fee: 60,
  },
] as const;

const LEGACY_DELIVERY_REGION_OPTIONS = [
  {
    value: 'JERUSALEM_AND_48',
    label: 'القدس والداخل',
    fee: 60,
  },
] as const;

export type DeliveryRegionCode = (typeof DELIVERY_REGION_OPTIONS)[number]['value'];
export type LegacyDeliveryRegionCode =
  (typeof LEGACY_DELIVERY_REGION_OPTIONS)[number]['value'];
export type StoredDeliveryRegionCode = DeliveryRegionCode | LegacyDeliveryRegionCode;

export function getDeliveryRegionOption(value: string | undefined) {
  return DELIVERY_REGION_OPTIONS.find((option) => option.value === value);
}

export function resolveDeliveryRegionOption(value: string | undefined) {
  return (
    getDeliveryRegionOption(value) ??
    LEGACY_DELIVERY_REGION_OPTIONS.find((option) => option.value === value)
  );
}
