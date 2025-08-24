type ClassValue = string | number | boolean | null | undefined | {
    [key: string]: any;
} | ClassValue[];
declare function className(...inputs: ClassValue[]): string;
export { className };
export type { ClassValue };
