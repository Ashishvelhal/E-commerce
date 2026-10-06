import { Request, Response } from 'express';
import { Product } from '../models/Product';
import { Category } from '../models/Category';

// Helper to escape regex special characters
const escapeRegex = (text: string) => {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};

// Helper to create a slug
const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
};

// @desc    Get all products with filters, search, pagination, and sorting
// @route   GET /api/products
// @access  Public
export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      keyword,
      category,
      minPrice,
      maxPrice,
      has3D,
      featured,
      trending,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    const query: any = {};

    // Keyword search across title, description, and category with regex safety
    if (keyword && typeof keyword === 'string' && keyword.trim() !== '') {
      const safeTerm = escapeRegex(keyword.trim());
      query.$or = [
        { title: { $regex: safeTerm, $options: 'i' } },
        { description: { $regex: safeTerm, $options: 'i' } },
        { category: { $regex: safeTerm, $options: 'i' } },
        { brand: { $regex: safeTerm, $options: 'i' } },
      ];
    }

    // Category filter
    if (category && typeof category === 'string' && category.toLowerCase() !== 'all') {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // 3D Model filter
    if (has3D === 'true') {
      query['model3d.url'] = { $exists: true, $ne: null };
    }

    // Featured / Trending filter
    if (featured === 'true') query.isFeatured = true;
    if (trending === 'true') query.isTrending = true;

    // Sorting
    let sortOption: any = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    else if (sort === 'price_desc') sortOption = { price: -1 };
    else if (sort === 'rating') sortOption = { ratingsAverage: -1 };
    else if (sort === 'popular') sortOption = { ratingsCount: -1 };

    const pageNumber = Math.max(1, Number(page));
    const pageSize = Math.max(1, Number(limit));
    const skip = (pageNumber - 1) * pageSize;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(pageSize);

    res.json({
      success: true,
      data: products,
      pagination: {
        total,
        page: pageNumber,
        pages: Math.ceil(total / pageSize),
        limit: pageSize,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Get featured & trending products
// @route   GET /api/products/featured
// @access  Public
export const getFeaturedProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const featured = await Product.find({ isFeatured: true }).limit(8);
    const trending = await Product.find({ isTrending: true }).limit(8);
    const with3D = await Product.find({ 'model3d.url': { $exists: true, $ne: null } }).limit(6);

    res.json({
      success: true,
      data: {
        featured,
        trending,
        with3D,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Get single product by slug or ID
// @route   GET /api/products/:identifier
// @access  Public
export const getProductByIdentifier = async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier } = req.params;
    let product;

    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(identifier);
    } else {
      product = await Product.findOne({ slug: identifier });
    }

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Create a product (Admin only)
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      title,
      description,
      richDetails,
      price,
      discountPrice,
      category,
      brand,
      stock,
      images,
      thumbnail,
      model3d,
      specifications,
      isFeatured,
      isTrending,
    } = req.body;

    let slug = slugify(title);
    // Check if slug exists, make unique
    const existing = await Product.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const product = await Product.create({
      title,
      slug,
      description,
      richDetails,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : undefined,
      category,
      brand: brand || 'AeroCraft',
      stock: Number(stock),
      images: Array.isArray(images) && images.length > 0 ? images : [thumbnail || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=60'],
      thumbnail: thumbnail || (images && images[0]) || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=60',
      model3d: model3d && model3d.url ? model3d : null,
      specifications: specifications || [],
      isFeatured: Boolean(isFeatured),
      isTrending: Boolean(isTrending),
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Update a product (Admin only)
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    let product = await Product.findById(id);

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    if (req.body.title && req.body.title !== product.title) {
      req.body.slug = `${slugify(req.body.title)}-${Date.now().toString().slice(-4)}`;
    }

    product = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Delete a product (Admin only)
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    await Product.findByIdAndDelete(id);

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Get all categories
// @route   GET /api/products/categories
// @access  Public
export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    const productCategories = await Product.distinct('category');

    res.json({
      success: true,
      data: {
        all: categories,
        names: productCategories,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Create category (Admin only)
// @route   POST /api/products/categories
// @access  Private/Admin
export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, image, icon } = req.body;
    if (!name) {
      res.status(400).json({ success: false, message: 'Category name is required' });
      return;
    }

    const slug = slugify(name);
    const existing = await Category.findOne({ slug });
    if (existing) {
      res.status(400).json({ success: false, message: 'Category with this name already exists' });
      return;
    }

    const category = await Category.create({
      name,
      slug,
      description: description || '',
      image: image || '',
      icon: icon || 'Tag',
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Update category (Admin only)
// @route   PUT /api/products/categories/:id
// @access  Private/Admin
export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (req.body.name) {
      req.body.slug = slugify(req.body.name);
    }

    const category = await Category.findByIdAndUpdate(id, req.body, { new: true });
    if (!category) {
      res.status(404).json({ success: false, message: 'Category not found' });
      return;
    }

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: category,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Delete category (Admin only)
// @route   DELETE /api/products/categories/:id
// @access  Private/Admin
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      res.status(404).json({ success: false, message: 'Category not found' });
      return;
    }

    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

// @desc    Get frequently bought together products
// @route   GET /api/products/:productId/frequently-bought-together
// @access  Public
export const getFrequentlyBoughtTogether = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const current = await Product.findById(productId);
    if (!current) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    let recommendations = await Product.find({
      _id: { $ne: current._id },
      category: current.category,
    }).limit(2);

    if (recommendations.length < 2) {
      const needed = 2 - recommendations.length;
      const additional = await Product.find({
        _id: { $ne: current._id, $nin: recommendations.map((p) => p._id) },
      }).limit(needed);
      recommendations = [...recommendations, ...additional];
    }

    const currentFormatted = {
      id: current._id.toString(),
      title: current.title,
      imageUrl: current.thumbnail,
      priceInMinorUnit: Math.round((current.discountPrice || current.price) * 100),
      currency: 'INR',
      isCurrentProduct: true,
      originalPriceInMinorUnit: current.discountPrice ? Math.round(current.price * 100) : undefined,
    };

    const recommendationsFormatted = recommendations.map((p) => ({
      id: p._id.toString(),
      title: p.title,
      imageUrl: p.thumbnail,
      priceInMinorUnit: Math.round((p.discountPrice || p.price) * 100),
      currency: 'INR',
      isCurrentProduct: false,
      originalPriceInMinorUnit: p.discountPrice ? Math.round(p.price * 100) : undefined,
    }));

    res.json({
      success: true,
      data: {
        currentProduct: currentFormatted,
        recommendations: recommendationsFormatted,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

