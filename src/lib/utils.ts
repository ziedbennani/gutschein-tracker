import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const EMPLOYEE_NAMES = [
  "Claudio",
  "Sabine",
  "Anja M",
  "Anja H",
  "Nga",
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
  "Mara",
  "Paula T",
  "Paula A",
  "Lilly",
  "Marissa",
  "Steffi",
  "Lara",
  "Davide",
  "Michelle",
  "Emily",
  "Hanna",
  "Anna",
  "Sophia N",
  "Sophia S",
  "Lucy",
  "Hannah",
  "Mai Kim",
  "Kim",
  "Melina",
  "Annabelle",
  "Emma R",
  "Emma B",
  "Emelie",
  "Charlotte",
  "Svenja",
  "Joyce",
  "Laura",
  "Franzi",
  "Leonie",
  "Paul",
  "Diana J",
  "Diana K",
  "Liv",
  "Frida",
  "Selma",
  "Leni",
  "Irina",
  "Marie",
  "Emilia",
  "Tobi",
  "Esther",
  "Ingeborg",
  "Alessia",

  // Add more names as needed
];
