import mongoose from "mongoose";
import Onboarding from "./models/onboardingModel.js"; // 👈 include .js extension

const deleteAllOnboardings = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/hrms", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const result = await Onboarding.deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} onboarding records successfully!`);
  } catch (error) {
    console.error("❌ Error deleting onboardings:", error.message);
  } finally {
    mongoose.connection.close();
  }
};

deleteAllOnboardings();
