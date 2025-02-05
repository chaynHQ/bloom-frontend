// You can't pass the enum object down with typescript. It confused whether it is a type or an object so this is my solution
// see https://stackoverflow.com/questions/30774874/enum-as-parameter-in-typescript
export function isEnumValue(enumObject: { [key: number | string]: string | number }, value: any) {
  return Object.values(enumObject).includes(value);
}
