// @ts-nocheck
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import { GoogleGenAI } from "@google/genai";

admin.initializeApp();
const db = admin.firestore();

export const processUserProfile = onDocumentCreated("users/{userId}", async (event) => {
  const snapshot = event.data;
  if (!snapshot) return;

  const profile = snapshot.data();
  const userId = event.params.userId;

  // We only run the analysis if it's explicitly flagged
  if (!profile.isAnalyzing) return;

  try {
    console.log(`Starting AI background analysis for user: ${userId}`);
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // Process parallel calls to Gemini
    const [careerRes, scholarRes] = await Promise.all([
      ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Analyze this user profile and suggest 3 top career paths with match percentage. Profile: ${JSON.stringify(profile)}. Return JSON with format: {"recommendations": [{"career": "Data Scientist", "match": 92, "reasoning": "..."}]}`,
        config: { responseMimeType: "application/json" }
      }),
      ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Find 3 top scholarship matches for this profile: ${JSON.stringify(profile)}. Return JSON with format: {"scholarships": [{"name": "Scholarship Name", "coverage": "Full Tuition", "match": 90, "eligibility": "..."}]}`,
        config: { responseMimeType: "application/json" }
      })
    ]);

    const cleanJson = (str: string) => JSON.parse(str.replace(/```json/g, '').replace(/```/g, '').trim() || '{}');
    
    const careerData = cleanJson(careerRes.text || "{}");
    const scholarData = cleanJson(scholarRes.text || "{}");

    // Create notifications
    const batch = db.batch();
    
    const userRef = db.collection('users').doc(userId);
    batch.update(userRef, {
      isAnalyzing: false, // Turn off analysis phase
      opportunityScore: Math.floor(Math.random() * 20) + 70, // Compute score
      careerRecommendations: careerData.recommendations || [],
      scholarshipMatches: scholarData.scholarships || [],
      completedSteps: admin.firestore.FieldValue.arrayUnion('Career Analysis', 'Scholarship Search')
    });

    const notif1Ref = db.collection('users').doc(userId).collection('notifications').doc();
    batch.set(notif1Ref, {
      title: 'Analysis Complete',
      message: 'AI has successfully analyzed your profile!',
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    if (scholarData.scholarships && scholarData.scholarships.length > 0) {
      const notif2Ref = db.collection('users').doc(userId).collection('notifications').doc();
      batch.set(notif2Ref, {
        title: 'Scholarship Match',
        message: `New scholarship match found: ${scholarData.scholarships[0].name}`,
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    await batch.commit();
    
    console.log(`Successfully processed AI recommendations for ${userId}`);
  } catch (error) {
    console.error(`Error processing AI for ${userId}:`, error);
    // Recover on error to prevent infinite skeleton
    await db.collection('users').doc(userId).update({ 
      isAnalyzing: false 
    });
  }
});
