export const DELIVERY_REGION_OPTIONS = [
  {
    value: 'WEST_BANK',
    label: 'الضفة الغربية',
    fee: 20,
  },
  {
    value: 'JERUSALEM_AND_48',
    label: 'القدس والداخل',
    fee: 60,
  },
] as const;

export type DeliveryRegionCode = (typeof DELIVERY_REGION_OPTIONS)[number]['value'];

export function getDeliveryRegionOption(value: string | undefined) {
  return DELIVERY_REGION_OPTIONS.find((option) => option.value === value);
}
