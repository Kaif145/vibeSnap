import express from "express";
import { createServer as createViteServer } from "vite";
import axios from "axios";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { GoogleGenAI, Type } from "@google/genai";
import { User } from "./models/User.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-vibe-snap-key-2026";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // MongoDB Connection
  const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://kaifurrahaman145_db_user:YOUR_PASSWORD@cluster0.isbqz5q.mongodb.net/myDatabase";
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB Atlas successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  app.use(cookieParser());

  // Spotify Config
  const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || "df827e99f9cb45ed8b6a80e8bbdafb24";
  const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
  const SCOPES = "user-read-private user-read-email user-library-read user-library-modify";

  let clientAccessToken = "";
  let tokenExpiry = 0;

  const getClientAccessToken = async () => {
    if (clientAccessToken && Date.now() < tokenExpiry) {
      return clientAccessToken;
    }

    if (!SPOTIFY_CLIENT_SECRET) {
      console.warn("SPOTIFY_CLIENT_SECRET is not defined. Spotify search might fail.");
      return null;
    }

    try {
      const response = await axios.post(
        "https://accounts.spotify.com/api/token",
        new URLSearchParams({ grant_type: "client_credentials" }).toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${Buffer.from(
              `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
            ).toString("base64")}`,
          },
        }
      );

      clientAccessToken = response.data.access_token;
      tokenExpiry = Date.now() + response.data.expires_in * 1000 - 60000; // Subtract 1 min for safety
      return clientAccessToken;
    } catch (err: any) {
      console.error("Failed to get Spotify Client Access Token:", err.response?.data || err.message);
      return null;
    }
  };

  // Spotify Search Endpoint
  app.get("/api/spotify/search", async (req, res) => {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: "Query required" });

    const token = await getClientAccessToken();
    if (!token) return res.status(500).json({ error: "Spotify authentication failed" });

    try {
      const response = await axios.get("https://api.spotify.com/v1/search", {
        params: {
          q: q as string,
          type: "track",
          limit: 10,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const tracks = response.data.tracks.items
        .map((item: any) => ({
          id: item.id,
          title: item.name,
          artist: item.artists[0].name,
          album: item.album.name,
          coverUrl: item.album.images[0]?.url,
          previewUrl: item.preview_url,
          spotifyUrl: item.external_urls.spotify,
        }))
        .sort((a: any, b: any) => {
          // Prioritize tracks with previews
          if (a.previewUrl && !b.previewUrl) return -1;
          if (!a.previewUrl && b.previewUrl) return 1;
          return 0;
        })
        .slice(0, 5);

      res.json({ tracks });
    } catch (err: any) {
      console.error("Spotify Search Error:", err.response?.data || err.message);
      res.status(500).json({ error: "Search failed" });
    }
  });

  // 1. Get Spotify Auth URL
  const getRedirectUri = (req: express.Request) => {
    // In this environment, we should use the APP_URL if provided, 
    // otherwise fallback to the request host
    const appUrl = process.env.APP_URL;
    if (appUrl) {
      return `${appUrl.replace(/\/$/, "")}/callback`;
    }
    const protocol = req.headers["x-forwarded-proto"] || "http";
    const host = req.headers.host;
    return `${protocol}://${host}/callback`;
  };

  // 1. Get Spotify Auth URL
  app.get("/api/auth/spotify/url", (req, res) => {
    const redirectUri = getRedirectUri(req);
    const params = new URLSearchParams({
      client_id: SPOTIFY_CLIENT_ID,
      response_type: "code",
      redirect_uri: redirectUri,
      scope: SCOPES,
      show_dialog: "true",
    });

    res.json({ url: `https://accounts.spotify.com/authorize?${params.toString()}` });
  });

  // 2. Callback Handler
  app.get("/callback", async (req, res) => {
    const { code, error } = req.query;

    if (error) {
      return res.send(`
        <html>
          <body>
            <script>
              window.opener.postMessage({ type: "SPOTIFY_AUTH_ERROR", error: "${error}" }, "*");
              window.close();
            </script>
          </body>
        </html>
      `);
    }

    if (!code) {
      return res.status(400).send("No code provided");
    }

    try {
      const redirectUri = getRedirectUri(req);
      
      const tokenResponse = await axios.post(
        "https://accounts.spotify.com/api/token",
        new URLSearchParams({
          grant_type: "authorization_code",
          code: code as string,
          redirect_uri: redirectUri,
        }).toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${Buffer.from(
              `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
            ).toString("base64")}`,
          },
        }
      );

      const { access_token, refresh_token, expires_in } = tokenResponse.data;

      // Send tokens back to the frontend via postMessage
      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ 
                  type: "SPOTIFY_AUTH_SUCCESS", 
                  payload: { 
                    accessToken: "${access_token}", 
                    refreshToken: "${refresh_token}",
                    expiresIn: ${expires_in}
                  } 
                }, "*");
                window.close();
              } else {
                window.location.href = "/";
              }
            </script>
            <p>Authentication successful! You can close this window.</p>
          </body>
        </html>
      `);
    } catch (err: any) {
      console.error("Spotify Token Exchange Error:", err.response?.data || err.message);
      res.status(500).send("Failed to exchange token");
    }
  });

  // Auth Routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { name, email, password } = req.body;
      
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: "Email already in use" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const role = email.toLowerCase().includes('admin') ? 'admin' : 'user';

      const user = new User({
        name,
        email,
        password: hashedPassword,
        role,
        savedSongs: [],
        likedSongs: []
      });

      await user.save();

      const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
      
      res.status(201).json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          savedSongs: user.savedSongs,
          likedSongs: user.likedSongs
        }
      });
    } catch (err) {
      console.error("Signup error:", err);
      res.status(500).json({ error: "Failed to create account" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
      
      res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          savedSongs: user.savedSongs,
          likedSongs: user.likedSongs
        }
      });
    } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({ error: "Failed to login" });
    }
  });

  // Middleware to verify JWT
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: "Unauthorized" });

    jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
      if (err) return res.status(403).json({ error: "Forbidden" });
      req.userId = decoded.userId;
      next();
    });
  };

  // Sync user data
  app.post("/api/user/sync", authenticateToken, async (req: any, res: any) => {
    try {
      const { savedSongs, likedSongs, spotifyToken } = req.body;
      
      const updateData: any = {};
      if (savedSongs) updateData.savedSongs = savedSongs;
      if (likedSongs) updateData.likedSongs = likedSongs;
      if (spotifyToken) updateData.spotifyToken = spotifyToken;

      const user = await User.findByIdAndUpdate(
        req.userId,
        { $set: updateData },
        { new: true }
      );

      if (!user) return res.status(404).json({ error: "User not found" });

      res.json({ success: true });
    } catch (err) {
      console.error("Sync error:", err);
      res.status(500).json({ error: "Failed to sync data" });
    }
  });

  app.get("/api/user/me", authenticateToken, async (req: any, res: any) => {
    try {
      const user = await User.findById(req.userId);
      if (!user) return res.status(404).json({ error: "User not found" });

      res.json({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          savedSongs: user.savedSongs,
          likedSongs: user.likedSongs,
          spotifyToken: user.spotifyToken
        }
      });
    } catch (err) {
      console.error("Fetch user error:", err);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Gemini AI Endpoints
  const getAI = () => {
    const rawKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    const apiKey = rawKey ? rawKey.trim() : "";
    
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in the environment.");
    }
    
    // Basic validation to catch common copy-paste errors
    if (apiKey.startsWith('"') || apiKey.startsWith("'")) {
      console.warn("Warning: GEMINI_API_KEY starts with a quote. It should be the raw key.");
    }
    
    return new GoogleGenAI({ apiKey });
  };

  app.post("/api/analyze-mood", async (req, res) => {
    try {
      const { moodText, language = 'English' } = req.body;
      const ai = getAI();

      let languageSpecificInstructions = "";
      if (language === 'Hindi') {
        languageSpecificInstructions = `
        - For Hindi: Do NOT just suggest romantic songs. Match the actual vibe of the description (e.g., if it's energetic, give high-energy tracks; if it's travel, give travel anthems).
        - You can include 1-2 popular Punjabi tracks that are currently trending in the Hindi music scene as they are often paired.
        - Focus on current trending artists like Arijit Singh, Jubin Nautiyal, King, Badshah, and indie artists like Anuv Jain.`;
      } else if (language === 'Bengali') {
        languageSpecificInstructions = `
        - For Bengali: Focus on a mix of modern hits and aesthetic indie/folk-pop.
        - Prioritize artists like Anupam Roy, Shreya Ghoshal, Fossils, and Sahana Bajpaie.
        - Ensure the songs match the specific 'aesthetic' or 'mood' of the description.`;
      } else if (language === 'Punjabi') {
        languageSpecificInstructions = `
        - For Punjabi: Focus on current trending hits from artists like AP Dhillon, Talwiinder, Shubh, and Diljit Dosanjh.`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `You are a world-class music curator. Analyze the following mood description and curate a list of 10 tracks that perfectly capture this emotional landscape. Think like someone choosing the absolute best suitable song for an Instagram Story or Status.
        
        Mood: "${moodText}"
        Preferred Language: "${language}"
        
        CRITICAL: You MUST ONLY provide tracks that are in the "${language}" language. If the language is "Mix", you can provide a variety, but limit Punjabi songs to only 1 or 2.
        
        ${languageSpecificInstructions}
        
        1. Identify a primary "vibe" keyword.
        2. Provide 10 real, popular, and trending tracks strictly in the "${language}" language that are the "best suitable" for this mood.
        3. For each track, write a compelling 1-sentence explanation of how it complements the specific emotions or setting in the user's description.
        4. Include 2-3 specific tags per song (e.g., "Mellow", "High Energy", "Lyrical").
        5. Provide a "30-second main lyric snippet" (the most iconic or relevant lines) for each song.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              vibe: { type: Type.STRING },
              suggestedTags: { type: Type.ARRAY, items: { type: Type.STRING } },
              description: { type: Type.STRING },
              recommendedTracks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    artist: { type: Type.STRING },
                    whyMatch: { type: Type.STRING },
                    tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                    spotifyId: { type: Type.STRING, description: "Spotify Track ID" },
                    lyricsSnippet: { type: Type.STRING, description: "30-second main lyric snippet" }
                  },
                  required: ["title", "artist", "whyMatch", "tags", "lyricsSnippet"]
                }
              }
            },
            required: ["vibe", "suggestedTags", "description", "recommendedTracks"]
          }
        }
      });

      let responseText = response.text || "{}";
      // Strip markdown code blocks if present
      responseText = responseText.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
      
      res.json(JSON.parse(responseText));
    } catch (err: any) {
      console.error("Analyze Mood Error:", err.message);
      
      if (err.message?.includes("API key not valid") || err.message?.includes("API_KEY_INVALID")) {
        return res.status(400).json({ error: "Invalid Gemini API Key. Please check your Render environment variables." });
      }
      if (err.message?.includes("GEMINI_API_KEY is not defined")) {
        return res.status(400).json({ error: "GEMINI_API_KEY is missing in Render environment variables." });
      }
      
      res.status(500).json({ error: err.message || "Failed to analyze mood" });
    }
  });

  app.post("/api/analyze-photo", async (req, res) => {
    try {
      const { base64Image, language = 'English' } = req.body;
      const ai = getAI();

      let languageSpecificInstructions = "";
      if (language === 'Hindi') {
        languageSpecificInstructions = `
        - For Hindi: Do NOT just suggest romantic songs. Match the actual visual vibe of the photo (e.g., if it's a party photo, give party songs; if it's a nature photo, give soulful/travel tracks).
        - You can include 1-2 popular Punjabi tracks that are currently trending in the Hindi music scene.
        - Focus on current trending artists like Arijit Singh, Jubin Nautiyal, King, Badshah, and indie artists like Anuv Jain.`;
      } else if (language === 'Bengali') {
        languageSpecificInstructions = `
        - For Bengali: Focus on a mix of modern hits and aesthetic indie/folk-pop.
        - Prioritize artists like Anupam Roy, Shreya Ghoshal, Fossils, and Sahana Bajpaie.
        - Ensure the songs match the specific 'aesthetic' or 'mood' of the photo.`;
      } else if (language === 'Punjabi') {
        languageSpecificInstructions = `
        - For Punjabi: Focus on current trending hits from artists like AP Dhillon, Talwiinder, Shubh, and Diljit Dosanjh.`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { mimeType: "image/jpeg", data: base64Image.split(',')[1] } },
            { text: `As a visual-to-audio expert, analyze the lighting, composition, and 'feel' of this photo. 
            CRITICAL: Suggest 10 real, popular, and trending songs STRICTLY in the "${language}" language that act as the perfect, "best suitable" soundtrack for this visual aesthetic. 
            If the language is "Mix", limit Punjabi songs to only 1 or 2.
            
            ${languageSpecificInstructions}
            
            Think like someone choosing the perfect song for an Instagram Story or Status that makes the photo truly come alive.
            For each, explain the visual-audio connection, provide relevant tags, and include a '30-second main lyric snippet' (the most iconic lines).` }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              vibe: { type: Type.STRING },
              suggestedTags: { type: Type.ARRAY, items: { type: Type.STRING } },
              description: { type: Type.STRING },
              recommendedTracks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    artist: { type: Type.STRING },
                    whyMatch: { type: Type.STRING },
                    tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                    spotifyId: { type: Type.STRING, description: "Spotify Track ID" },
                    lyricsSnippet: { type: Type.STRING, description: "30-second main lyric snippet" }
                  },
                  required: ["title", "artist", "whyMatch", "tags", "lyricsSnippet"]
                }
              }
            },
            required: ["vibe", "suggestedTags", "description", "recommendedTracks"]
          }
        }
      });

      let responseText = response.text || "{}";
      // Strip markdown code blocks if present
      responseText = responseText.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
      
      res.json(JSON.parse(responseText));
    } catch (err: any) {
      console.error("Analyze Photo Error:", err.message);
      
      if (err.message?.includes("API key not valid") || err.message?.includes("API_KEY_INVALID")) {
        return res.status(400).json({ error: "Invalid Gemini API Key. Please check your Render environment variables." });
      }
      if (err.message?.includes("GEMINI_API_KEY is not defined")) {
        return res.status(400).json({ error: "GEMINI_API_KEY is missing in Render environment variables." });
      }
      
      res.status(500).json({ error: err.message || "Failed to analyze photo" });
    }
  });

  // Vite middleware for development
  const isProduction = process.env.NODE_ENV === "production" || process.env.RENDER === "true";
  
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
