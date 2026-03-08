import PlatformSettings from '../models/PlatformSettings.js';

const getSettings = async () => {
  let settings = await PlatformSettings.findOne();
  if (!settings) {
    // No row yet — create with model defaultValues (no .env reads)
    settings = await PlatformSettings.create({});
  }
  return settings;
};

// Get platform settings 
const getPlatformSettings = async (req, res) => {
  try {
    let settings = await PlatformSettings.findOne();

    if (!settings) {
      // Initialize default settings if not present
      settings = await PlatformSettings.create({});
    }

    res.json({ settings });
  } catch (err) {
    console.error("Get Platform Settings Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update platform settings 
const updatePlatformSettings = async (req, res) => {
  try {
    const updates = req.body;

    let settings = await PlatformSettings.findOne();
    if (!settings) {
      settings = await PlatformSettings.create({});
    }

    // Update only the fields provided
    await settings.update(updates);

    res.json({ message: "Platform settings updated successfully", settings });
  } catch (err) {
    console.error("Update Platform Settings Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export { getSettings, getPlatformSettings, updatePlatformSettings };