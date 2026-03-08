import { seedTransactions } from "./seedDatabase.js";

seedTransactions()
  .then(() => {
    console.log("Seed ejecutado correctamente");
    process.exit();
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });