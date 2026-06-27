import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars from server root
dotenv.config({ path: path.join(__dirname, "../.env") });

const exportData = async () => {
  try {
    console.log("🚀 Starting database export to seed files...");
    
    await connectDB();

    const modelsDir = path.join(__dirname, "../models");
    const exportDir = path.join(__dirname, "data/exported");

    // Create export directory if it doesn't exist
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
      console.log(`📁 Created directory: ${exportDir}`);
    }

    const modelFiles = fs.readdirSync(modelsDir).filter(file => file.endsWith(".js"));

    console.log(`📂 Found ${modelFiles.length} models in models directory.`);

    let exportedCount = 0;

    for (const file of modelFiles) {
      try {
        const modelPath = `file://${path.join(modelsDir, file)}`;
        const modelModule = await import(modelPath);
        const Model = modelModule.default;

        // Verify it's a Mongoose model
        if (!Model || !Model.modelName) {
          continue;
        }

        const modelName = Model.modelName;
        const collectionName = Model.collection.name;

        const data = await Model.find({}).lean();
        
        if (data && data.length > 0) {
          // Clean data (remove __v and other internal fields if necessary, but keep _id for seeding)
          const cleanedData = data.map(doc => {
            const { __v, ...rest } = doc;
            return rest;
          });

          const filePath = path.join(exportDir, `${collectionName}.js`);
          const variableName = collectionName.replace(/[^a-zA-Z0-9]/g, '_');
          const content = `export const ${variableName} = ${JSON.stringify(cleanedData, null, 2)};\n`;
          
          fs.writeFileSync(filePath, content);
          console.log(`✅ Exported ${data.length} records from ${modelName} to ${collectionName}.js`);
          exportedCount++;
        } else {
          console.log(`ℹ️  No data found for ${modelName}, skipping.`);
        }
      } catch (err) {
        console.error(`❌ Error exporting ${file}: ${err.message}`);
      }
    }

    console.log(`\n✨ Export complete! ${exportedCount} collections exported to seeders/data/exported/`);
    process.exit(0);
  } catch (error) {
    console.error(`\n❌ Fatal Export Error: ${error.message}`);
    process.exit(1);
  }
};

exportData();
