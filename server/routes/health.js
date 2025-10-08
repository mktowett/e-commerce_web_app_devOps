const router = require("express").Router();

/**
 * @route GET /api/health
 * @desc Health check endpoint
 * @access Public
 */
router.get("/", (req, res) => {
  res.status(200).json({ status: "ok" });
});

module.exports = router;
