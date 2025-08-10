import { Request, Response } from "express";
import { Product } from "../models/product.model";
import { BaseQueryType, NewProductBody, SearchProductsQuery } from "../types/types";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { deleteImage } from "../utils/cloudinary";
import { faker } from "@faker-js/faker";
// import { faker } from "@faker-js/faker";


export const getLatestProducts = asyncHandler(
    async (req: Request, res: Response, next) => {

        const products = await Product.find().sort({ createdAt: -1 }).limit(5);

        return res.status(200).json({
            success: true,
            products
        });
    }
)

export const getAllCategories = asyncHandler(
    async (req: Request, res: Response, next) => {

        const categories = await Product.distinct('category');

        return res.status(200).json({
            success: true,
            categories
        });

    }
);

export const getAllProducts = asyncHandler(async (req: Request, res: Response, next) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 8;
    const skip = (page - 1) * limit;

    const sortBy = req.query.sortBy ? JSON.parse(req.query.sortBy as string) : { id: '', desc: false };
    let sort: any = {};

    if (sortBy.id) {
        sort[sortBy.id] = sortBy.desc ? -1 : 1;
    }

    const totalProducts = await Product.countDocuments();
    const products = await Product.find().sort(sort).skip(skip).limit(limit);

    return res.status(200).json({
        success: true,
        products,
        totalProducts,
        totalPages: Math.ceil(totalProducts / limit),
        currentPage: page
    });
});


export const getProductDetails = asyncHandler(
    async (req: Request, res: Response, next) => {

        const product = await Product.findById(req.params.id);

        if (!product) {
            return next(new ApiError(404, "Product not found"));
        }

        return res.status(200).json({
            success: true,
            product
        });
    }
);

export const createNewProduct = asyncHandler(
    async (req: Request<{}, {}, NewProductBody>, res: Response, next) => {

        const { name, category, price, stock, description } = req.body;
        console.log(req.body);

        if (!name || !category || !price || !stock || !description) {
            return next(new ApiError(400, "Please fill all fields"));
        }

        const file = req.file;

        if (!file) {
            return next(new ApiError(400, "Please upload a photo"));
        }

        const product = await Product.create({
            name,
            category: category.toLowerCase(),
            description,
            price,
            stock,
            photo: file.path,
            photoPublicId: file.filename
        });

        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            product
        });
    }
);

export const updateProduct = asyncHandler(
    async (req: Request, res: Response, next) => {
        const id = req.params.id;
        const { name, category, price, stock, description } = req.body;

        const product = await Product.findById(id);

        if (!product) {
            return next(new ApiError(404, "Product not found"));
        }

        const file = req.file;

        if (file) {
            // Delete the old image from Cloudinary
            if (product.photoPublicId) {
                await deleteImage(product.photoPublicId);
            }

            // Update the product with new image data
            product.photo = file.path;
            product.photoPublicId = file.filename;
        }

        if (name) product.name = name;
        if (category) product.category = category.toLowerCase();
        if (price) product.price = price;
        if (stock) product.stock = stock;
        if (description) product.description = description;

        const updatedProduct = await product.save();

        return res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product: updatedProduct
        });
    }
);

export const searchProducts = asyncHandler(
    async (req: Request<{}, {}, {}, SearchProductsQuery>, res: Response, next) => {
        const { search, category, sort, price, page = '1' } = req.query;

        const limit = Number(process.env.PRODUCTS_PER_PAGE) || 6;
        const skip = (Number(page) - 1) * limit;

        const baseQuery: BaseQueryType = {};

        if (search) {
            baseQuery.name = { $regex: search, $options: 'i' };
        }

        if (category) {
            baseQuery.category = category;
        }

        if (price) {
            const [min, max] = price.split(',').map(Number);
            baseQuery.price = {};
            if (min !== undefined) baseQuery.price.$gte = min;
            if (max !== undefined) baseQuery.price.$lte = max;
        }

        let sortOption: { [key: string]: 1 | -1 } = {};
        if (sort && sort !== 'relevance') {
            sortOption.price = sort === 'asc' ? 1 : -1;
        }

        const [products, totalProducts] = await Promise.all([
            Product.find(baseQuery).sort(sortOption).limit(limit).skip(skip),
            Product.countDocuments(baseQuery),
        ]);

        const totalPage = Math.ceil(totalProducts / limit);

        return res.status(200).json({
            success: true,
            products,
            totalPage,
        });
    }
);

export const deleteProduct = asyncHandler(
    async (req: Request, res: Response, next) => {

        const id = req.params.id;

        const product = await Product.findById(id);

        if (!product) {
            return next(new ApiError(404, "Product not found"));
        }

        // delete the photo from cloudinary
        await deleteImage(product.photoPublicId);

        await product.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });
    }
);

export const toggleFeaturedStatus = asyncHandler(
    async (req: Request, res: Response, next) => {
        const { id } = req.params;

        const product = await Product.findById(id);

        if (!product) {
            return next(new ApiError(404, "Product not found"));
        }

        // Toggle the featured status
        product.featured = !product.featured;
        await product.save();

        return res.status(200).json({
            success: true,
            message: "Product featured status updated successfully",
            product,
        });
    }
);

// Controller to get all featured products
export const getFeaturedProducts = asyncHandler(
    async (req: Request, res: Response) => {
        const products = await Product.find({ featured: true });

        return res.status(200).json({
            success: true,
            products,
        });
    }
);