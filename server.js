import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Replicate from "replicate";
import Stripe from "stripe";
import { removeBackground } from "@imgly/background-removal-node";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(cors());
app.use(express.json({ limit: "25mb" }));

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

app.post("/api/generate", async (req, res) => {
  try {
    const { image, style, category } = req.body;
    console.log("CATEGORY REÇUE :", category);

    if (!image) {
      return res.status(400).json({ error: "Image manquante" });
    }

    let prompt = "";

    const identityRules = `
CRITICAL IDENTITY RULES:
Use the uploaded image as the main reference.

The generated image must represent the SAME subject from the uploaded photo.
Do NOT invent a new person.
Do NOT change gender.
Do NOT change age.
Do NOT change facial identity.
Do NOT replace the face with another face.

Preserve:
- face shape
- eyes
- nose
- mouth
- smile/expression
- hairstyle
- hair color
- skin tone
- general proportions

The result must look like a stylized version of the uploaded subject, not a different person.
`;

const humanRules = `
This is a strict image-to-image edit.

Keep the exact same person.
Preserve identity, face, hairstyle, expression and proportions.

Do not generate a new person.
Only change clothing, accessories, lighting and atmosphere.

Transparent PNG background.
No text.
No frame.
No mockup.
`;

const animalRules = `
This is a strict image-to-image edit.

Keep the exact same animal.
Preserve anatomy, muzzle, fur, ears and proportions.

Do not humanize the animal.
Keep paws as paws.

Transparent PNG background.
No text.
No frame.
No mockup.
`;

const frenchieRules = `
This is a strict image-to-image edit.

Keep the exact same French bulldog.
Preserve short muzzle, bat ears, fur colors and compact face.

Do not transform into another breed.
Do not humanize the dog.

Transparent PNG background.
No text.
No frame.
No mockup.
`;

if (style === "royal") {

  if (category === "human") {

    prompt = `
${humanRules}

Transform into a majestic royal portrait.

Add:
- royal crown
- luxury cape
- gold jewelry
- cinematic palace lighting
- baroque atmosphere
`;

  } else if (category === "animal") {

    prompt = `
${animalRules}

Transform into a majestic royal animal portrait.

Add:
- royal crown
- luxury cape
- palace lighting
- baroque atmosphere
`;

  } else {

    prompt = `
${frenchieRules}

Transform into a majestic royal French bulldog portrait.

IMPORTANT:
- keep real dog anatomy
- keep paws as paws
- NEVER create human hands
- NEVER create human arms
- NEVER humanize the dog
- keep the dog on 4 legs or natural dog posture

Add:
- royal crown
- luxury royal cape
- throne atmosphere
- cinematic palace lighting

Ultra realistic royal French bulldog portrait.
`;
  }
}

else if (style === "museum") {

  if (category === "human") {

    prompt = `
${humanRules}

Transform into a renaissance museum portrait.

Add:
- renaissance clothing
- oil painting texture
- dramatic renaissance lighting
- museum masterpiece atmosphere
`;

  } else if (category === "animal") {

    prompt = `
${animalRules}

Transform into a renaissance animal painting.

Add:
- renaissance noble clothing
- oil painting texture
- museum atmosphere
`;

  prompt = `
Create a dramatic renaissance oil painting portrait of the uploaded French bulldog.

The final result must look like a classical museum painting, not a photo.

Style must be:
- renaissance oil painting
- visible brush texture
- baroque dark background
- royal clothing adapted to dog anatomy
- golden details
- dramatic chiaroscuro lighting
- antique museum atmosphere

Keep the same French bulldog recognizable:
- same muzzle
- same ears
- same fur colors
- same expression

Never create human hands.
Never humanize the dog.

Renaissance masterpiece French bulldog portrait.
`;
  }
}
 
else if (style === "minimal") {

  if (category === "human") {

    prompt = `
${humanRules}

Transform into a luxury minimal fashion portrait.

Add:
- luxury designer outfit
- gold jewelry
- editorial lighting
- beige and black luxury palette
`;

  } else if (category === "animal") {

    prompt = `
${animalRules}

Transform into a luxury minimalist pet portrait.

Add:
- luxury lighting
- editorial photography style
- beige and gold atmosphere
`;

  } else {

    prompt = `
${frenchieRules}

Transform into a luxury French bulldog fashion portrait.

Add:
- gold necklace
- luxury sunglasses
- editorial lighting
- beige and gold atmosphere
`;
  }
}

else if (style === "astronaut") {

  if (category === "human") {

    prompt = `
${humanRules}

Transform into a futuristic astronaut portrait.

Add:
- astronaut suit
- transparent helmet
- cinematic sci-fi lighting
- space atmosphere
`;

  } else if (category === "animal") {

    prompt = `
${animalRules}

Transform into a futuristic astronaut animal portrait.

Add:
- astronaut suit adapted to the animal
- transparent helmet
- cinematic sci-fi atmosphere
`;

  } else {

    prompt = `
${frenchieRules}

Transform into a futuristic astronaut French bulldog.

Add:
- astronaut suit
- transparent helmet
- cinematic space atmosphere
`;
  }
}

else if (style === "gangster") {

  if (category === "human") {

    prompt = `
${humanRules}

Transform into a cinematic gangster portrait.

Add:
- elegant black mafia outfit
- fedora hat
- noir cinematic lighting
- luxury mafia atmosphere
`;

  } else if (category === "animal") {

    prompt = `
${animalRules}

Transform into a gangster animal portrait.

Add:
- mafia outfit adapted to the animal
- fedora hat
- noir cinematic lighting
`;

  } else {

    prompt = `
${frenchieRules}

Transform into a gangster French bulldog portrait.

Add:
- mafia outfit
- fedora hat
- gold chain
- noir cinematic lighting
`;
  }
}

else if (style === "viking") {

  if (category === "human") {

    prompt = `
${humanRules}

Transform into an epic Viking portrait.

Add:
- Viking armor
- fur cape
- Nordic atmosphere
- snowy cinematic lighting
`;

  } else if (category === "animal") {

    prompt = `
${animalRules}

Transform into a Viking animal portrait.

Add:
- fur cape
- leather armor
- Nordic atmosphere
`;

  } else {

    prompt = `
${frenchieRules}

Transform into an epic Viking French bulldog.

Add:
- Viking armor
- fur cloak
- Nordic atmosphere
- snowy lighting
`;
  }
}

else if (style === "biker") {

  if (category === "human") {

    prompt = `
${humanRules}

Transform into a cinematic biker portrait.

Add:
- leather biker jacket
- motorcycle
- rebel biker atmosphere
- cinematic road lighting
`;

  } else if (category === "animal") {

    prompt = `
${animalRules}

Transform into a biker animal portrait.

Add:
- leather biker jacket
- motorcycle nearby
- biker atmosphere
`;

  } else {

    prompt = `
${frenchieRules}

Transform into a biker French bulldog portrait.

Add:
- leather biker jacket
- motorcycle
- rebel biker atmosphere
`;
  }
}

else if (style === "superhero") {

  if (category === "human") {

    prompt = `
${humanRules}

Transform into an epic superhero portrait.

IMPORTANT:
- fully replace original clothes
- remove original shirt completely
- remove original outfit completely
- generate a full superhero costume
- preserve the exact face and identity

Add:
- cinematic superhero suit
- cape
- futuristic city atmosphere
- dramatic action lighting

Photorealistic superhero movie portrait.
`;

  } else if (category === "animal") {

    prompt = `
${animalRules}

Transform into a superhero animal portrait.

Add:
- superhero costume adapted to the animal
- heroic atmosphere
- cinematic action lighting
`;

  } else {

    prompt = `
${frenchieRules}

Transform into an epic superhero French bulldog.

Add:
- superhero costume
- cape
- futuristic city atmosphere
`;
  }
}

else if (style === "rockstar") {

  if (category === "human") {

    prompt = `
${humanRules}

Transform into a cinematic rockstar portrait.

Add:
- leather rockstar outfit
- microphone
- stage lighting
- concert atmosphere
`;

  } else if (category === "animal") {

    prompt = `
${animalRules}

Transform into a rockstar animal portrait.

Add:
- leather outfit
- microphone
- concert lighting
`;

  } else {

    prompt = `
${frenchieRules}

Transform into a rockstar French bulldog portrait.

Add:
- leather jacket
- sunglasses
- microphone
- concert atmosphere
`;
  }
}

else if (style === "anime") {

  if (category === "human") {

    prompt = `
${humanRules}

Transform into a realistic Japanese anime portrait.

Style:
- cinematic anime
- Makoto Shinkai inspired
- elegant anime shading
- realistic proportions
`;

  } else if (category === "animal") {

    prompt = `
${animalRules}

Transform into a premium Japanese anime animal.

Add:
- cinematic anime lighting
- anime rendering
- animated movie atmosphere
`;

  } else {

    prompt = `
${frenchieRules}

Transform into a Japanese anime French bulldog.

Add:
- anime rendering
- cinematic anime lighting
- animated movie atmosphere
`;
  }
}

else if (style === "cartoon") {

  if (category === "human") {

    prompt = `
${humanRules}

Transform into a cute Pixar-style cartoon portrait.
`;

  } else if (category === "animal") {

    prompt = `
${animalRules}

Transform into a cute cartoon animal.
`;

  } else {

    prompt = `
${frenchieRules}

Transform into a premium 3D cartoon French bulldog.
`;
  }
}

if (!prompt) {
  prompt = `
Transform the uploaded subject into a premium portrait.

Keep EXACTLY the same identity from the uploaded photo.

Transparent PNG background.
No text. No frame. No mockup.
`;
}

let guidanceScale = 1;
let strengthValue = 0.04;

if (category === "human") {
  guidanceScale = 0.8;
  strengthValue = 0.03;
}

if (category === "animal") {
  guidanceScale = 0.8;
  strengthValue = 0.03;
}

if (category === "frenchie") {
  guidanceScale = 0.7;
  strengthValue = 0.02;
}

if (style === "museum") {
  guidanceScale = 4;
  strengthValue = 0.45;
}

const output = await replicate.run(
  "black-forest-labs/flux-kontext-pro",
  {
    input: {
      prompt: prompt,
      input_image: image,

      guidance_scale: guidanceScale,
      strength: strengthValue,
    },
  }
);

    console.log("OUTPUT REPLICATE :", output);

    console.log("OUTPUT REPLICATE :", output);

    const firstOutput = Array.isArray(output) ? output[0] : output;

    const imageUrl =
      typeof firstOutput === "string"
        ? firstOutput
        : firstOutput?.url
        ? firstOutput.url().toString()
        : null;

    console.log("IMAGE URL :", imageUrl);

    if (!imageUrl) {
      return res.status(500).json({
        error: "Aucune image retournée par Replicate",
        raw: output,
      });
    }

    res.json({ output: imageUrl });
  } catch (error) {
    console.log("ERREUR COMPLETE :", error);
    res.status(500).json({ error: "Erreur génération IA" });
  }
});


app.post("/api/create-checkout-session", async (req, res) => {
  try {
    console.log("Stripe route appelée :", req.body);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],

      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `${req.body.product} - ${req.body.style}`,
            },
            unit_amount: 2990,
          },
          quantity: 1,
        },
      ],

      success_url: `${process.env.FRONTEND_URL}?success=true`,
      cancel_url: `${process.env.FRONTEND_URL}?canceled=true`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Erreur Stripe :", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/test-stripe", (req, res) => {
  res.send("Stripe OK");
});

app.post("/api/remove-background", async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: "Image manquante" });
    }

    const response = await fetch(image);
    const imageBlob = await response.blob();

    const outputBlob = await removeBackground(imageBlob);

    const arrayBuffer = await outputBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const base64 = buffer.toString("base64");
    const transparentImage = `data:image/png;base64,${base64}`;

    res.json({ output: transparentImage });
  } catch (error) {
    console.error("Erreur remove background serveur :", error);
    res.status(500).json({ error: "Erreur détourage serveur" });
  }
});

app.listen(3001, "0.0.0.0", () => {
  console.log("API lancée sur http://localhost:3001");
});