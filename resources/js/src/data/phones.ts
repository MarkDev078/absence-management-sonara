import type { Phone } from './demoDb.ts'

/** Contacts that contain at least one digit; blank legacy entries are ignored. */
export function displayPhones(phones?: Phone[]): Phone[] {
  return Array.isArray(phones)
    ? phones.filter(phone => typeof phone?.digits === 'string' && /\d/.test(phone.digits))
    : []
}
