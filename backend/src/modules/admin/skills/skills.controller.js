import {
  getCategories,
  createCategory,
  updateCategory,
  getSkills,
  deleteSkill,
} from "./skills.service.js";

/**
 * GET /api/admin/skills/categories
 */
export const listCategories = async (req, res, next) => {
  try {
    const categories = await getCategories();
    res.status(200).json({ items: categories });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/skills/categories
 */
export const addCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body || {};
    const category = await createCategory({ name, description });
    res.status(201).json({
      message: "Category created successfully.",
      category,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/skills/categories/:categoryId
 */
export const editCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const { name, description, isActive } = req.body || {};
    const category = await updateCategory({
      categoryId,
      name,
      description,
      isActive,
    });
    res.status(200).json({
      message: "Category updated successfully.",
      category,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/skills
 */
export const listSkills = async (req, res, next) => {
  try {
    const { search, category, isActive, page, limit } = req.query;
    const result = await getSkills({ search, category, isActive, page, limit });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/skills/:skillId
 */
export const removeSkill = async (req, res, next) => {
  try {
    const { skillId } = req.params;
    await deleteSkill({ skillId });
    res.status(200).json({
      message: "Skill removed successfully.",
    });
  } catch (error) {
    next(error);
  }
};
