import mongoose from "mongoose";
import Category from "../../../models/Category.js";
import Skill from "../../../models/Skill.js";

const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const toSlug = (value) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/**
 * List all official categories with the number of skills in each.
 */
export const getCategories = async () => {
  const [categories, counts] = await Promise.all([
    Category.find().sort({ name: 1 }).lean(),
    Skill.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]),
  ]);

  const countMap = new Map(counts.map((c) => [c._id, c.count]));

  return categories.map((cat) => ({
    ...cat,
    skillsCount: countMap.get(cat.name) || 0,
  }));
};

/**
 * Create a new official skill category.
 */
export const createCategory = async ({ name, description = "" }) => {
  if (!name || typeof name !== "string" || !name.trim()) {
    throw createHttpError(400, "Category name is required.");
  }

  const cleanName = name.trim();
  const slug = toSlug(cleanName);
  if (!slug) {
    throw createHttpError(400, "Category name must contain alphanumeric characters.");
  }

  const existing = await Category.findOne({
    $or: [
      { name: new RegExp(`^${escapeRegex(cleanName)}$`, "i") },
      { slug },
    ],
  });

  if (existing) {
    throw createHttpError(409, "Category already exists.");
  }

  const category = await Category.create({
    name: cleanName,
    slug,
    description: typeof description === "string" ? description.trim() : "",
  });

  return category;
};

/**
 * Edit an official skill category and sync matching Skill.category strings.
 */
export const updateCategory = async ({ categoryId, name, description, isActive }) => {
  if (!mongoose.Types.ObjectId.isValid(categoryId)) {
    throw createHttpError(400, "Invalid category ID.");
  }

  const category = await Category.findById(categoryId);
  if (!category) {
    throw createHttpError(404, "Category not found.");
  }

  const oldName = category.name;

  if (name !== undefined) {
    if (typeof name !== "string" || !name.trim()) {
      throw createHttpError(400, "Category name cannot be empty.");
    }

    const cleanName = name.trim();
    const newSlug = toSlug(cleanName);
    if (!newSlug) {
      throw createHttpError(400, "Category name must contain alphanumeric characters.");
    }

    const duplicate = await Category.findOne({
      _id: { $ne: category._id },
      $or: [
        { name: new RegExp(`^${escapeRegex(cleanName)}$`, "i") },
        { slug: newSlug },
      ],
    });

    if (duplicate) {
      throw createHttpError(409, "Another category with that name already exists.");
    }

    category.name = cleanName;
    category.slug = newSlug;
  }

  if (description !== undefined) {
    if (typeof description !== "string") {
      throw createHttpError(400, "Description must be a string.");
    }
    category.description = description.trim();
  }

  if (isActive !== undefined) {
    if (typeof isActive !== "boolean") {
      throw createHttpError(400, "isActive must be a boolean.");
    }
    category.isActive = isActive;
  }

  await category.save();

  // Keep existing Skill documents aligned when a category is renamed
  if (category.name !== oldName) {
    await Skill.updateMany(
      { category: oldName },
      { $set: { category: category.name } }
    );
  }

  return category;
};

/**
 * List and search skill listings with optional category/active filters and pagination.
 */
export const getSkills = async ({ search, category, isActive, page = 1, limit = 20 }) => {
  const safePage = Math.max(1, Number.parseInt(page, 10) || 1);
  const safeLimit = Math.min(100, Math.max(1, Number.parseInt(limit, 10) || 20));
  const skip = (safePage - 1) * safeLimit;

  const filter = {};

  if (search && typeof search === "string" && search.trim()) {
    const regex = new RegExp(escapeRegex(search.trim()), "i");
    filter.$or = [{ name: regex }, { description: regex }];
  }

  if (category && typeof category === "string" && category.trim()) {
    filter.category = category.trim();
  }

  if (isActive === "true") {
    filter.isActive = true;
  } else if (isActive === "false") {
    filter.isActive = false;
  }

  const [items, total] = await Promise.all([
    Skill.find(filter).sort({ createdAt: -1 }).skip(skip).limit(safeLimit),
    Skill.countDocuments(filter),
  ]);

  return {
    items,
    total,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.ceil(total / safeLimit) || 1,
  };
};

/**
 * Remove a spam or invalid skill listing.
 */
export const deleteSkill = async ({ skillId }) => {
  if (!mongoose.Types.ObjectId.isValid(skillId)) {
    throw createHttpError(400, "Invalid skill ID.");
  }

  const deleted = await Skill.findByIdAndDelete(skillId);
  if (!deleted) {
    throw createHttpError(404, "Skill not found.");
  }
};
