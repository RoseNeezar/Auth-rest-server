import { body } from "express-validator";

export const registerRule = (() => {
  return [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password")
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage("Must be between 4 and 20"),
  ];
})();
