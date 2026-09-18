import { Request, Response } from "express";
import { generateProductDescriptionService } from "./ai.service";

export const generateDescription = async (req: Request, res: Response) => {
  try {
    const { title, category, keywords, language } = req.body;
    // console.log(req.body);
    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Product title is required to generate description.",
      });
    }

    // language প্যারামিটারটি সার্ভিস লেয়ারে পাস করা হচ্ছে
    const result = await generateProductDescriptionService(
      title,
      category,
      keywords,
      language,
    );
    // console.log(result);
    return res.status(200).json({
      success: true,
      message: "AI product description generated successfully.",
      data: result,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Error generating AI content.",
    });
  }
};
