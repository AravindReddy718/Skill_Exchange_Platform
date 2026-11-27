import express from "express";
import authMiddleware from "../../../middleware/authMiddleware.js";
import roleMiddleware from "../../../middleware/roleMiddleware.js";
import {
  listCategories,
  addCategory,
  editCategory,
  listSkills,
  removeSkill,
} from "./skills.controller.js";

const router = express.Router();

// Protect all category & skill routes: must be logged in AND have role === "admin"
router.use(authMiddleware, roleMiddleware("admin"));

// Categories
router.get("/categories", listCategories);
router.post("/categories", addCategory);
router.patch("/categories/:categoryId", editCategory);

// Skills
router.get("/", listSkills);
router.delete("/:skillId", removeSkill);

export default router;
