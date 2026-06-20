/**
 * Standardizes pagination logic for Mongoose models.
 *
 * @param {import('mongoose').Model} model - The Mongoose model to query.
 * @param {Object} filter - The filter criteria.
 * @param {Object} options - Pagination options.
 * @param {number} options.page - Current page (1-based).
 * @param {number} options.limit - Items per page.
 * @param {Object} [options.sort] - Sort criteria.
 * @param {string|Object} [options.populate] - Populate criteria.
 * @returns {Promise<Object>} Paginated data and metadata.
 */
const paginate = async (model, filter = {}, { page = 1, limit = 10, sort = { createdAt: -1 }, populate = "" }) => {
  const skip = (page - 1) * limit;

  const [data, totalItems] = await Promise.all([
    model.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate(populate),
    model.countDocuments(filter)
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return {
    data,
    pagination: {
      totalItems,
      totalPages,
      currentPage: Number(page),
      limit: Number(limit),
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  };
};

module.exports = {
  paginate
};
