const fs = require("fs");
const path = require("path");

// Load template once at cold start
const referenceBase64 = fs.readFileSync(
  path.join(__dirname, "../../template.png"),
  { encoding: "base64" }
);
const REFERENCE_IMAGE_DATA = `data:image/png;base64,${referenceBase64}`;

const STYLE_PROMPTS = {
  neon:   "black Formula 1 racing suit with neon cyan, hot pink, and yellow accents, clean sponsor-style patches, bold racing decals",
  red:    "sleek red and black Formula 1 racing suit with gold accents, clean sponsor-style patches, premium racing decals",
  ice:    "icy white and blue Formula 1 racing suit with glowing blue accents, clean sponsor-style patches, premium racing decals",
  street: "black street-racing Formula 1 suit with colorful graffiti decals, sponsor-style patches, cyan pink yellow details",
};

function buildPrompt(style) {
  const suitStyle = STYLE_PROMPTS[style] || STYLE_PROMPTS.neon;
  return `
Edit the uploaded profile picture into a high-quality racecar NFT reveal-style artwork.

IMAGE ROLES:
The FIRST image is the user's profile picture (face/identity).
The SECOND image is the reference template.

STRICT TEMPLATE RULE (VERY IMPORTANT):
- Copy the SECOND image EXACTLY for:
  - body, pose, proportions, lighting, camera distance, crop, arm position, framing
- The body must remain IDENTICAL to the template
- Do NOT modify body shape, pose, or proportions
- Do NOT change composition

SUIT RULE (IMPORTANT):
- Keep the SAME suit structure, folds, fit, and placement as the template
- BUT apply the selected suit style and colors: ${suitStyle}
- Only change colors, materials, and decals
- Do NOT change suit shape or proportions

FACE REPLACEMENT:
- Replace ONLY the head/face area with the user's face from the FIRST image
- Face must sit exactly in the template head position
- Face must align with the center zipper line
- No left/right shift, no scaling mismatch

STYLE MATCH:
- Repaint the face to match the template style: same shading, lighting, outline thickness, color grading
- Face must look like part of the same artwork, not pasted

POSE LOCK: Head must be perfectly front-facing. No tilt. No side angle.

BACKGROUND: Keep the SAME background as the template. Do NOT generate a new background.

STRICT CONSISTENCY LOCK:
- Output must match the reference template EXACTLY in structure and proportions
- Treat the template as a fixed base, not inspiration

REMOVE: original background, UI elements, watermarks, helmet, full body

FINAL OUTPUT: 1:1 square image. Identical body as template. Only face replaced. Perfect alignment.
`.trim();
}

exports.handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  // CORS headers so the browser can call this from any origin
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  try {
    if (!process.env.OPENAI_API_KEY) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "OPENAI_API_KEY is not set in Netlify environment variables." }),
      };
    }

    const { imageDataUrl, style = "neon" } = JSON.parse(event.body || "{}");

    if (!imageDataUrl || !imageDataUrl.startsWith("data:image/")) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Please upload a valid image." }),
      };
    }

    const response = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        images: [
          { image_url: imageDataUrl },
          { image_url: REFERENCE_IMAGE_DATA },
        ],
        prompt: buildPrompt(style),
        size: "1024x1024",
        n: 1,
        output_format: "png",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: data?.error?.message || "OpenAI generation failed." }),
      };
    }

    const b64 = data?.data?.[0]?.b64_json;
    const url = data?.data?.[0]?.url;

    if (b64) return { statusCode: 200, headers, body: JSON.stringify({ image: `data:image/png;base64,${b64}` }) };
    if (url) return { statusCode: 200, headers, body: JSON.stringify({ image: url }) };

    return { statusCode: 500, headers, body: JSON.stringify({ error: "No image returned by API." }) };

  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message || "Server error." }),
    };
  }
};
