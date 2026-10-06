//controller for enhancing a resume's professional summary
//POST: /api/ai/enhance-pro-sum

import { response } from "express";
import Resume from "../models/Resume.js";
import ai from "../configs/ai.js";

 const createAICompletion = async (options, retries = 3) => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await ai.chat.completions.create(options);
    } catch (error) {
      console.log(
        `AI attempt ${attempt + 1} failed:`,
        error.status,
        error.message
      );

      // Retry only temporary server errors
      if (error.status !== 503 || attempt === retries) {
        throw error;
      }

      const delay = 2000 * Math.pow(2, attempt);

      console.log(`Retrying in ${delay / 1000} seconds...`);

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

export const enhanceProfessionalSummary = async (req, res) => {
 
  try {
    const { userContent } = req.body;

    if (!userContent) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const response = await createAICompletion({
      model: process.env.OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are an expert in resume writing. Your task is to inhance the professional summary of a resume. The summary should be 1-2 sentences also highlighting key skills, experience, and career objectives. Make it compelling and ATS-friendly. and only return text no options or anything else.",
        },
        {
          role: "user",
          content: userContent,
        },
      ],
    });

    const enhancedContent = response.choices[0].message.content;
    return res.status(200).json({ enhancedContent });
  } catch (error) {
  console.error("Enhance Summary Error:", error);
  return res.status(error.status || 500).json({
    message: error.message || "AI service error"
  });
}
};

//controller for enhancing a resume's job description
//POST: /api/enhance/api/ai/enhance-job-desc

export const enhanceJobDescription = async (req, res) => {
  try {
    const { userContent } = req.body;

    if (!userContent) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const response = await ai.chat.completions.create({
      model: process.env.OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are expert in resume writing. Your task is to enhance the job description of a resume. The job description should be only in 1-2 sencence also highlighting key responsibilities and achievement. Use action verb and quantifiable results where possible. Make it ATS-frinedly. and only return text no option or anything else.",
        },
        {
          role: "user",
          content: userContent,
        },
      ],
    });

    const enhancedContent = response.choices[0].message.content;
    return res.status(200).json({ enhancedContent });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

//controller for uploading a resume to the database
//POST : /api/ai/upload-resume

export const uploadResume = async (req, res) => {
  try {
    const { resumeText, title } = req.body;
    const userId = req.userId;

    if (!resumeText) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const systemPrompt =
      "You are an expert AI Agent to extract data from resume.";

    const userPrompt = `extract data from this : resume : ${resumeText} 
        
        Provide data in the following JSON format with no additonal text before or after :

        {
            professional_summary: {type: String, default: ""},
            skills: [{type: String}],
            personal_info :{
                image: {type: String, default: ''},
                full_name: {type: String, default: ''},
                profession: {type: String, default: ''},
                email: {type: String, default: ''},
                phone: {type: String, default: ''},
                location: {type: String, default: ''},
                linkedin: {type: String, default: ''},
                website: {type: String, default: ''},
            },
          experience: [
            {
                company: {type : String},
                type: {type : String},
                start_date: {type : String},
                end_date: {type : String},
                description: {type : String},
                is_current: {type : Boolean},
            }
          ],
          project: [
                {
                name: {type : String},
                type: {type : String},
                description: {type : String},
            }
          ],

          education: [
            {
                institution: {type : String},
                degree: {type : String},
                field: {type : String},
                graduation_date: {type : String},
                gpa: {type : String},
            }
          ],
          
        }
        `;

    const response = await createAICompletion({
  model: process.env.OPENAI_MODEL,

  reasoning_effort: "low",

  messages: [
    {
      role: "system",
      content: systemPrompt,
    },
    {
      role: "user",
      content: userPrompt,
    },
  ],

  response_format: {
    type: "json_object",
  },
});

    const extractedData = response.choices[0].message.content;
    const parseData = JSON.parse(extractedData);
    const newResume = await Resume.create({ userId, title, ...parseData });

    res.json({ resumeId: newResume._id });
  } catch (error) {
    console.error("AI Upload Error:", error);
    
    return res.status(error.status || 500).json({
        message: error.message || "AI service error"
    });
  }
};
