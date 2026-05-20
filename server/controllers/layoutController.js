const Layout = require("../models/Layout");
const Table = require("../models/Table");

// GET current layout
exports.getLayout = async (req, res) => {
  try {
    let layout = await Layout.findOne().sort({ updatedAt: -1 });
    if (!layout) {
      // Create default empty layout
      layout = await Layout.create({
        name: "Main Floor",
        tables: []
      });
    }
    res.json(layout);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

// SAVE / UPDATE layout (Admin only)
exports.saveLayout = async (req, res) => {
  try {
    const { name, gridSize, zoom, backgroundColor, tables } = req.body;

    let layout = await Layout.findOne();
    if (!layout) {
      layout = await Layout.create({
        name,
        gridSize,
        zoom,
        backgroundColor,
        tables,
        createdBy: req.user._id
      });
    } else {
      layout.name = name ?? layout.name;
      layout.gridSize = gridSize ?? layout.gridSize;
      layout.zoom = zoom ?? layout.zoom;
      layout.backgroundColor = backgroundColor ?? layout.backgroundColor;
      layout.tables = tables ?? layout.tables;
      layout.createdBy = req.user._id;
      await layout.save();
    }

    // Emit realtime to all clients
    const io = req.app.get("io");
    io.emit("layout:updated", layout);

    res.json(layout);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};