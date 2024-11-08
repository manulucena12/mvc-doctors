import { Food } from "../types";

const carbohydrateRichFoods: Food[] = [
  {
    id: 1,
    name: "Brown Rice",
    calories: 111,
    nutritionFacts: {
      carbohydrates: 23,
      fiber: 1.8,
      protein: 2.6,
      fat: 0.9,
      sugars: 0,
      vitamins: ["B1", "B3", "B6"],
      minerals: [],
    },
  },
  {
    id: 2,
    name: "Sweet Potato",
    calories: 86,
    nutritionFacts: {
      carbohydrates: 20,
      fiber: 3,
      protein: 1.6,
      fat: 0.1,
      sugars: 4.2,
      vitamins: ["A", "B6", "C"],
      minerals: [],
    },
  },
  {
    id: 3,
    name: "Banana",
    calories: 89,
    nutritionFacts: {
      carbohydrates: 22.8,
      fiber: 2.6,
      protein: 1.1,
      fat: 0.3,
      sugars: 12,
      vitamins: ["C", "B6"],
      minerals: ["Potassium"],
    },
  },
  {
    id: 4,
    name: "Oats",
    calories: 389,
    nutritionFacts: {
      carbohydrates: 66,
      fiber: 10.6,
      protein: 16.9,
      fat: 6.9,
      sugars: 0,
      vitamins: ["B1", "B5"],
      minerals: ["Iron", "Magnesium"],
    },
  },
  {
    id: 5,
    name: "Quinoa",
    calories: 120,
    nutritionFacts: {
      carbohydrates: 21,
      fiber: 2.8,
      protein: 4.1,
      fat: 1.9,
      sugars: 0,
      vitamins: ["B6", "E"],
      minerals: ["Iron", "Magnesium", "Phosphorus"],
    },
  },
];

const lipidRichFoods: Food[] = [
  {
    id: 1,
    name: "Avocado",
    calories: 160,
    nutritionFacts: {
      carbohydrates: 9,
      fiber: 7,
      protein: 2,
      fat: 15,
      sugars: 0,
      vitamins: ["E", "C", "K", "B6"],
      minerals: ["Potassium", "Magnesium"],
    },
  },
  {
    id: 2,
    name: "Olive Oil",
    calories: 884,
    nutritionFacts: {
      carbohydrates: 0,
      fiber: 0,
      protein: 0,
      fat: 100,
      sugars: 0,
      vitamins: ["E", "K"],
      minerals: [],
    },
  },
  {
    id: 3,
    name: "Almonds",
    calories: 579,
    nutritionFacts: {
      carbohydrates: 22,
      fiber: 12.5,
      protein: 21,
      fat: 49,
      sugars: 0,
      vitamins: ["E", "B2"],
      minerals: ["Calcium", "Iron", "Magnesium"],
    },
  },
  {
    id: 4,
    name: "Chia Seeds",
    calories: 486,
    nutritionFacts: {
      carbohydrates: 42,
      fiber: 34,
      protein: 17,
      fat: 31,
      sugars: 0,
      vitamins: ["B1", "B2", "B3"],
      minerals: ["Calcium", "Iron", "Magnesium"],
    },
  },
  {
    id: 5,
    name: "Coconut Oil",
    calories: 862,
    nutritionFacts: {
      carbohydrates: 0,
      fiber: 0,
      protein: 0,
      fat: 100,
      sugars: 0,
      vitamins: ["E", "K"],
      minerals: [],
    },
  },
];

const proteinRichFoods: Food[] = [
  {
    id: 1,
    name: "Chicken Breast",
    calories: 165,
    nutritionFacts: {
      carbohydrates: 0,
      fiber: 0,
      protein: 31,
      fat: 3.6,
      sugars: 0,
      vitamins: ["B3", "B6"],
      minerals: ["Phosphorus", "Selenium"],
    },
  },
  {
    id: 2,
    name: "Greek Yogurt",
    calories: 59,
    nutritionFacts: {
      carbohydrates: 3.6,
      fiber: 0,
      protein: 10,
      fat: 0.4,
      sugars: 3,
      vitamins: ["B12", "B2"],
      minerals: ["Calcium", "Phosphorus"],
    },
  },
  {
    id: 3,
    name: "Lentils",
    calories: 116,
    nutritionFacts: {
      carbohydrates: 20,
      fiber: 8,
      protein: 9,
      fat: 0.4,
      sugars: 0,
      vitamins: ["B1", "B6"],
      minerals: ["Iron", "Magnesium", "Zinc"],
    },
  },
  {
    id: 4,
    name: "Eggs",
    calories: 155,
    nutritionFacts: {
      carbohydrates: 1.1,
      fiber: 0,
      protein: 13,
      fat: 11,
      sugars: 0,
      vitamins: ["B12", "B2", "D"],
      minerals: ["Iron", "Calcium", "Potassium"],
    },
  },
  {
    id: 5,
    name: "Tofu",
    calories: 76,
    nutritionFacts: {
      carbohydrates: 1.9,
      fiber: 0.3,
      protein: 8,
      fat: 4.8,
      sugars: 0,
      vitamins: ["B1", "B2"],
      minerals: ["Calcium", "Iron", "Magnesium"],
    },
  },
];

const getRandomInt = (min: number, max: number) => {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
};

export const recommender = (calories: number, type: string) => {
  let i: number;
  let loopCalories = 0;
  const recommedFoods: Food[] = [];
  const typeFood =
    type === "ch"
      ? carbohydrateRichFoods
      : type === "lipids"
        ? lipidRichFoods
        : proteinRichFoods;
  while (loopCalories < calories) {
    i = getRandomInt(1, typeFood.length + 1);
    const randomFood = typeFood.find((f) => f.id === i);
    if (!randomFood) {
      break;
    }
    const isRecommended = recommedFoods.some((f) => f.name === randomFood.name);
    if (!isRecommended) {
      recommedFoods.push(randomFood);
    }
    loopCalories = loopCalories + randomFood.calories;
  }
  return recommedFoods;
};
