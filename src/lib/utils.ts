import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const EMPLOYEE_NAMES = [
  "Claudio",
  "Sabine",
  "Anja",
  "Zied",
  "Nassime",
  "Maher",
  "Lea L",
  "Lea G",
  "Julena",
  "Nadine",
  "Natascha",
  "Amelie",
  "Fernanda",
  "Joudi",
  "Joseph",
  "Jiejie",
  "Maja",
  "Paula",
  "Lilly",
  "Marissa",
  "Steffi",
  "Lara",
  "Davide",
  "Michelle",
  "Emily",
  "Hanna",
  "Anna",
  "Sophia",
  "Lucy",
  "Hannah",
  "Mai Kim",
  "Kim",
  "Melina",
  "Annabelle",
  "Emma",
  "Emelie",
  "Charlotte",
  "Svenja",
  "Joyce",
  "Laura",

  // Add more names as needed
];
