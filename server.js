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

if (style === "royal") {
  if (category === "human") {
    prompt = `
${identityRules}

Transform this HUMAN portrait into a majestic royal portrait.

IMPORTANT:
- keep the SAME person
- preserve the exact face identity
- preserve face shape, eyes, nose, mouth, hairstyle and expression
- do NOT create an animal
- do NOT create dog ears
- do NOT create a french bulldog

Add:
- elegant royal crown
- luxurious royal cape
- gold jewelry
- cinematic palace lighting
- baroque luxury atmosphere

Premium cinematic royal portrait.
Centered upper-body composition.
Transparent PNG background.
No text.
No frame.
No mockup.
This is a strict identity-preserving image edit.
Do not redesign the face.
Only change outfit, style and atmosphere.
`;
  } else if (category === "animal") {
    prompt = `
${identityRules}

Transform this ANIMAL into a majestic royal portrait.

IMPORTANT:
- keep the SAME animal species
- preserve the exact breed/species
- preserve ears, muzzle, fur colors, markings and expression
- do NOT transform into a french bulldog unless it already is one
- do NOT create a human face
- do NOT add human hands

Add:
- elegant royal crown adapted to the animal
- luxurious royal cape adapted to the animal body
- gold jewelry
- cinematic palace lighting
- baroque luxury atmosphere

Premium cinematic royal animal portrait.
Centered upper-body composition.
Transparent PNG background.
No text.
No frame.
No mockup.
IMPORTANT ANIMAL RULES:
- keep the REAL animal face
- keep the REAL animal anatomy
- keep paws as paws
- NEVER transform paws into human hands
- NEVER transform the animal into a human
- keep authentic fur
- keep authentic muzzle
- keep authentic ears
- keep authentic body proportions
- the animal must stay a real animal

FORBIDDEN:
- human face
- human skin
- human anatomy
- human nose
- human mouth
- human hands
- humanoid body
`;
  } else {
    prompt = `
${identityRules}

Transform this FRENCH BULLDOG into a majestic royal portrait.

IMPORTANT:
- keep the dog as a French bulldog
- preserve short muzzle
- preserve wide square head
- preserve bat ears
- preserve compact body
- preserve fur colors, markings and expression
- do NOT transform into another breed
- do NOT add human hands
- dog paws only if visible

Add:
- detailed royal crown
- luxurious red and black royal cape
- gold jewelry
- royal throne atmosphere
- dramatic cinematic palace lighting
- baroque decorations

Keep the exact muzzle shape.
Keep exact fur pattern.
Keep exact eye spacing.
Keep exact head proportions.

Ultra realistic premium royal French bulldog portrait.
Centered upper-body composition.
Transparent PNG background.
No text.
No frame.
No mockup.
`;
  }
}

else if (style === "rockstar") {

  if (category === "human") {

    if (style === "rockstar") {
  prompt = `
${identityRules}

Transform this REAL animal into a rockstar version.

IMPORTANT ANIMAL RULES:
- keep the REAL animal face
- keep the REAL animal anatomy
- keep paws as paws
- NEVER transform paws into human hands
- NEVER transform the animal into a human

The animal is a rockstar performer.

- stage lighting
- microphone nearby
- rockstar accessories

IMPORTANT:
- paws must stay paws
- no human hands
- no human fingers
- animal remains realistic
This is a strict identity-preserving image edit.
Do not redesign the face.
Only change outfit, style and atmosphere.
`;
}

  }

  else if (category === "animal") {

    prompt = `
${identityRules}

Transform this ANIMAL into a cinematic rockstar version.

IMPORTANT:
- keep the SAME animal species
- preserve exact breed/species
- preserve fur colors and expression
- do NOT transform into a french bulldog unless it already is one
- do NOT create a human face
- no human hands

Add:
- leather rockstar outfit adapted to the animal
- stylish sunglasses if natural
- microphone stand
- dramatic concert lighting
- energetic rock concert atmosphere

Premium rockstar animal portrait.
Transparent PNG background.
No text.
No frame.
No mockup.
IMPORTANT ANIMAL RULES:
- keep the REAL animal face
- keep the REAL animal anatomy
- keep paws as paws
- NEVER transform paws into human hands
- NEVER transform the animal into a human
- keep authentic fur
- keep authentic muzzle
- keep authentic ears
- keep authentic body proportions
- the animal must stay a real animal

FORBIDDEN:
- human face
- human skin
- human anatomy
- human nose
- human mouth
- human hands
- humanoid body
`;

  }

  else {

    prompt = `
${identityRules}

Transform this FRENCH BULLDOG into a cinematic rockstar French bulldog.

IMPORTANT:
- keep the dog as a French bulldog
- preserve short muzzle
- preserve bat ears
- preserve compact face
- preserve fur colors and expression
- do NOT transform into another breed
- no human hands
- only dog paws if visible

Add:
- black leather rockstar jacket adapted to dog anatomy
- stylish sunglasses
- microphone stand
- dramatic concert lighting
- energetic rock concert atmosphere

Keep the exact muzzle shape.
Keep exact fur pattern.
Keep exact eye spacing.
Keep exact head proportions.

Premium rockstar French bulldog portrait.
Transparent PNG background.
No text.
No frame.
No mockup.
`;

  }
}

if (style === "museum") {
  if (category === "human") {
    prompt = `
${identityRules}

Transform this HUMAN portrait into a renaissance museum painting.
This is an image-to-image transformation, not a new character creation.

IMPORTANT:
- keep the SAME person
- preserve exact face identity
- preserve hairstyle, eyes, mouth and expression
- do NOT create an animal
- do NOT create dog ears
- do NOT create a french bulldog

Add:
- renaissance clothing
- oil painting texture
- museum masterpiece atmosphere
- dramatic renaissance lighting
- elegant painted background

Classical renaissance portrait.
Museum-quality artwork.
Transparent PNG background.
No text.
No frame.
No mockup.
This is a strict identity-preserving image edit.
Do not redesign the face.
Only change outfit, style and atmosphere.
`;
  }

  else if (category === "animal") {
    prompt = `
${identityRules}

Transform this ANIMAL into a renaissance museum painting.

IMPORTANT:
- keep the SAME animal species
- preserve the real breed/species
- preserve fur colors and markings
- do NOT transform into a french bulldog unless it already is one
- do NOT create a human face

Add:
- renaissance noble clothing adapted to the animal
- oil painting texture
- museum masterpiece atmosphere
- dramatic renaissance lighting
- elegant painted background

Classical renaissance animal portrait.
Museum-quality artwork.
Transparent PNG background.
No text.
No frame.
No mockup.
IMPORTANT ANIMAL RULES:
- keep the REAL animal face
- keep the REAL animal anatomy
- keep paws as paws
- NEVER transform paws into human hands
- NEVER transform the animal into a human
- keep authentic fur
- keep authentic muzzle
- keep authentic ears
- keep authentic body proportions
- the animal must stay a real animal

FORBIDDEN:
- human face
- human skin
- human anatomy
- human nose
- human mouth
- human hands
- humanoid body
`;
  }

  else {
    prompt = `
${identityRules}

Transform this FRENCH BULLDOG into a renaissance museum masterpiece.

IMPORTANT:
- keep the dog as a French bulldog
- preserve short muzzle
- preserve bat ears
- preserve compact face
- preserve fur colors and expression
- do NOT transform into another breed

Add:
- renaissance royal clothing
- oil painting texture
- noble aristocratic atmosphere
- dramatic renaissance lighting
- classical museum painting style

Keep the exact muzzle shape.
Keep exact fur pattern.
Keep exact eye spacing.
Keep exact head proportions.

Museum-quality French bulldog artwork.
Transparent PNG background.
No text.
No frame.
No mockup.
`;
  }
}

else if (style === "minimal") {

  if (category === "human") {

    prompt = `
${identityRules}

Transform this HUMAN portrait into a luxury minimal fashion portrait.
This is an image-to-image transformation, not a new character creation.

IMPORTANT:
- keep the SAME person
- preserve exact face identity
- preserve hairstyle, eyes and expression
- do NOT create an animal
- do NOT create dog ears
- do NOT create a french bulldog

Add:
- luxury designer outfit
- elegant gold jewelry
- premium sunglasses if natural
- editorial fashion lighting
- beige, black and gold luxury palette
- modern luxury atmosphere

High-end fashion magazine style.
Minimal luxury aesthetic.
Transparent PNG background.
No text.
No frame.
No mockup.
This is a strict identity-preserving image edit.
Do not redesign the face.
Only change outfit, style and atmosphere.
`;

  }

  else if (category === "animal") {
  prompt = `
${identityRules}

Luxury minimalist pet portrait.

IMPORTANT ANIMAL RULES:
- keep the exact animal
- keep real animal anatomy
- keep paws as paws
- never transform paws into human hands
- no human transformation
- no humanoid body
- no human face
- realistic luxury pet photography

Add:
- elegant neutral background
- luxury lighting
- premium editorial photography style
- beige, black and gold tones

Transparent PNG background.
No text.
No frame.
No mockup.
`;
}

  

  else {

    prompt = `
${identityRules}

Transform this FRENCH BULLDOG into a luxury minimal fashion icon.

IMPORTANT:
- keep the dog as a French bulldog
- preserve short muzzle
- preserve bat ears
- preserve compact face
- preserve fur colors and expression
- do NOT transform into another breed

Add:
- luxury designer sunglasses
- thick gold necklace
- premium luxury outfit adapted to dog anatomy
- editorial fashion lighting
- beige, black and gold tones
- minimal luxury atmosphere

Keep the exact muzzle shape.
Keep exact fur pattern.
Keep exact eye spacing.
Keep exact head proportions.

High-end luxury French bulldog portrait.
Transparent PNG background.
No text.
No frame.
No mockup.
`;

  }
}

else if (style === "astronaut") {

  if (category === "human") {

    prompt = `
${identityRules}

Transform this HUMAN into a futuristic astronaut portrait.
This is an image-to-image transformation, not a new character creation.

IMPORTANT:
- keep the SAME person
- preserve exact face identity
- preserve hairstyle, eyes and expression
- do NOT create an animal
- do NOT create dog ears
- do NOT create a french bulldog

Add:
- futuristic astronaut suit
- realistic transparent astronaut helmet
- cinematic sci-fi lighting
- realistic reflections on helmet glass
- space exploration atmosphere

Premium cinematic astronaut portrait.
Transparent PNG background.
No text.
No frame.
No mockup.
This is a strict identity-preserving image edit.
Do not redesign the face.
Only change outfit, style and atmosphere.
`;

  }

  else if (category === "animal") {

    prompt = `
${identityRules}

Transform this ANIMAL into a futuristic astronaut version.

IMPORTANT:
- keep the SAME animal species
- preserve exact breed/species
- preserve ear shape exactly
- preserve fur colors and expression
- do NOT transform into a french bulldog unless it already is one
- do NOT create a human face
- no human hands

Add:
- futuristic astronaut suit adapted to the animal
- realistic transparent astronaut helmet
- ears visible inside helmet
- cinematic sci-fi lighting
- realistic glass reflections

Premium astronaut animal portrait.
Transparent PNG background.
No text.
No frame.
No mockup.
IMPORTANT ANIMAL RULES:
- keep the REAL animal face
- keep the REAL animal anatomy
- keep paws as paws
- NEVER transform paws into human hands
- NEVER transform the animal into a human
- keep authentic fur
- keep authentic muzzle
- keep authentic ears
- keep authentic body proportions
- the animal must stay a real animal

FORBIDDEN:
- human face
- human skin
- human anatomy
- human nose
- human mouth
- human hands
- humanoid body
`;

  }

  else {

    prompt = `
${identityRules}

Transform this FRENCH BULLDOG into a futuristic astronaut French bulldog.

IMPORTANT:
- keep the dog as a French bulldog
- preserve short muzzle
- preserve bat ears
- preserve compact face
- preserve fur colors and expression
- do NOT transform into another breed
- no human hands

Add:
- futuristic astronaut suit adapted to dog anatomy
- realistic transparent astronaut helmet
- bat ears visible inside helmet
- cinematic sci-fi lighting
- realistic reflections on helmet glass

Keep the exact muzzle shape.
Keep exact fur pattern.
Keep exact eye spacing.
Keep exact head proportions.

Premium astronaut French bulldog portrait.
Transparent PNG background.
No text.
No frame.
No mockup.
`;

  }
}

else if (style === "gangster") {

  if (category === "human") {

    prompt = `
${identityRules}

THIS IS A PHOTO EDIT OF THE UPLOADED HUMAN.
Do NOT create a new person.

Keep the uploaded person clearly recognizable:
- same gender
- same age
- same face shape
- same eyes
- same nose
- same mouth
- same smile/expression
- same hairstyle
- same hair color
- same skin tone

FORBIDDEN:
- changing the person
- changing gender
- adding a beard if the original person has none
- creating a male mafia boss
- replacing the face
- changing facial structure

Only edit:
- add an elegant black mafia-style outfit
- add a black fedora if it fits naturally
- add subtle noir cinematic lighting
- add luxury dark atmosphere

The final image must look like the uploaded person dressed in a classy gangster / mafia costume.
Photorealistic portrait.
Transparent PNG background.
No text.
No frame.
No mockup.
This is a strict identity-preserving image edit.
Do not redesign the face.
Only change outfit, style and atmosphere.
`;

  }

  else if (category === "animal") {

    prompt = `
${identityRules}

Transform this ANIMAL into a cinematic mafia boss version.

IMPORTANT:
- keep the SAME animal species
- preserve exact breed/species
- preserve fur colors and expression
- do NOT transform into a french bulldog unless it already is one
- do NOT create a human face
- no human hands

Add:
- black gangster hat adapted to the animal
- elegant mafia outfit adapted to the animal anatomy
- gold chain necklace
- dramatic noir lighting
- luxury mafia atmosphere

Premium gangster animal portrait.
Transparent PNG background.
No text.
No frame.
No mockup.
IMPORTANT ANIMAL RULES:
- keep the REAL animal face
- keep the REAL animal anatomy
- keep paws as paws
- NEVER transform paws into human hands
- NEVER transform the animal into a human
- keep authentic fur
- keep authentic muzzle
- keep authentic ears
- keep authentic body proportions
- the animal must stay a real animal

FORBIDDEN:
- human face
- human skin
- human anatomy
- human nose
- human mouth
- human hands
- humanoid body
`;

  }

  else {

    prompt = `
${identityRules}

Transform this FRENCH BULLDOG into a cinematic mafia boss French bulldog.

IMPORTANT:
- keep the dog as a French bulldog
- preserve short muzzle
- preserve bat ears
- preserve compact face
- preserve fur colors and expression
- do NOT transform into another breed
- no human hands
- only dog paws if visible

Add:
- black gangster fedora
- elegant black mafia suit adapted to dog anatomy
- gold chain necklace
- dramatic noir lighting
- luxury mafia movie atmosphere

Keep the exact muzzle shape.
Keep exact fur pattern.
Keep exact eye spacing.
Keep exact head proportions.

Premium gangster French bulldog portrait.
Transparent PNG background.
No text.
No frame.
No mockup.
`;

  }
}

else if (style === "viking") {

  if (category === "human") {

 prompt = `
${identityRules}

THIS IS A PHOTO EDIT.
NOT A NEW CHARACTER.

The uploaded image is a REAL HUMAN.
You must preserve the identity exactly.

STRICT RULES:
- preserve the exact face
- preserve the exact person
- preserve facial proportions
- preserve the exact eyes
- preserve the exact nose
- preserve the exact mouth
- preserve the exact smile
- preserve cheek shape
- preserve jawline
- preserve skin texture
- preserve hairstyle
- preserve hair color
- preserve gender
- preserve age

DO NOT:
- create a different person
- generate a random Viking
- add a beard
- masculinize the face
- replace the face
- change ethnicity
- change facial structure

Only add:
- realistic Viking clothes
- Nordic fur outfit
- snowy cinematic atmosphere
- Viking accessories

The uploaded human must remain immediately recognizable.

Photorealistic edit.
Transparent PNG background.
Do not beautify the face.
Do not change facial proportions.
Keep the original photo face almost unchanged.
Only edit clothing, background and atmosphere.
This is a strict identity-preserving image edit.
Do not redesign the face.
Only change outfit, style and atmosphere.
`;

  }

  else if (category === "animal") {

    if (style === "viking") {
  prompt = `
${identityRules}

Transform this REAL animal into a Viking inspired version.

IMPORTANT ANIMAL RULES:
- keep the REAL animal face
- keep the REAL animal anatomy
- keep paws as paws
- NEVER transform paws into human hands
- NEVER transform the animal into a human
- keep authentic fur
- keep authentic muzzle
- keep authentic ears
- keep authentic body proportions
- the animal must stay a real animal

The animal is wearing realistic Viking inspired accessories.

- fur cape
- leather armor
- nordic atmosphere

BUT:
- the animal remains fully animal
- four legs visible if possible
- real dog anatomy
- no wolf transformation
- no humanoid transformation
`;
}

  }

  else {

    prompt = `
${identityRules}

Transform this FRENCH BULLDOG into an epic Viking French bulldog warrior.

IMPORTANT:
- keep the dog as a French bulldog
- preserve short muzzle
- preserve bat ears
- preserve compact face
- preserve fur colors and expression
- do NOT transform into another breed
- no human hands
- only dog paws if visible

Add:
- Viking armor adapted to dog anatomy
- fur cloak
- Viking axe
- Nordic warrior atmosphere
- cinematic cold lighting
- snowy Viking environment

Keep the exact muzzle shape.
Keep exact fur pattern.
Keep exact eye spacing.
Keep exact head proportions.

Epic Viking French bulldog portrait.
Transparent PNG background.
No text.
No frame.
No mockup.
`;

  }
}

else if (style === "biker") {

  if (category === "human") {

    prompt = `
${identityRules}

Transform this HUMAN into a cinematic biker portrait.
This is an image-to-image transformation, not a new character creation.

IMPORTANT:
- keep the SAME person
- preserve exact face identity
- preserve hairstyle, eyes and expression
- do NOT create an animal
- do NOT create dog ears
- do NOT create a french bulldog

Add:
- black leather biker jacket
- motorcycle beside the subject
- cinematic road lighting
- cool rebel biker atmosphere
- optional sunglasses if natural

Premium biker movie portrait.
Transparent PNG background.
No text.
No frame.
No mockup.
This is a strict identity-preserving image edit.
Do not redesign the face.
Only change outfit, style and atmosphere.
`;

  }

  else if (category === "animal") {

    if (style === "biker") {
  prompt = `
${identityRules}

Transform this REAL animal into a biker version.

IMPORTANT ANIMAL RULES:
- keep the REAL animal face
- keep the REAL animal anatomy
- keep paws as paws
- NEVER transform paws into human hands
- NEVER transform the animal into a human

The animal is a biker companion.

- leather jacket adapted for animal anatomy
- motorcycle nearby
- cinematic biker atmosphere

IMPORTANT:
- keep the animal on 4 legs or natural sitting position
- no human torso
- no humanoid posture
`;
}

  }

  else {

    prompt = `
${identityRules}

Transform this FRENCH BULLDOG into a cinematic biker French bulldog.

IMPORTANT:
- keep the dog as a French bulldog
- preserve short muzzle
- preserve bat ears
- preserve compact face
- preserve fur colors and expression
- do NOT transform into another breed
- no human hands
- only dog paws if visible

Add:
- black leather biker jacket adapted to dog anatomy
- realistic motorcycle beside the dog
- cinematic biker lighting
- rebel biker atmosphere
- optional sunglasses if natural

Keep the exact muzzle shape.
Keep exact fur pattern.
Keep exact eye spacing.
Keep exact head proportions.

Premium biker French bulldog portrait.
Transparent PNG background.
No text.
No frame.
No mockup.
`;

  }
}

else if (style === "superhero") {

  if (category === "human") {

    prompt = `
${identityRules}

Transform this HUMAN into an epic superhero portrait.
This is an image-to-image transformation, not a new character creation.

IMPORTANT:
- keep the SAME person
- preserve exact face identity
- preserve hairstyle, eyes and expression
- do NOT create an animal
- do NOT create dog ears
- do NOT create a french bulldog

Add:
- cinematic superhero suit
- superhero cape
- futuristic city atmosphere
- energy lighting effects
- dramatic action movie lighting
- powerful heroic pose

Epic superhero movie portrait.
Transparent PNG background.
No text.
No frame.
No mockup.
This is a strict identity-preserving image edit.
Do not redesign the face.
Only change outfit, style and atmosphere.
`;

  }

  else if (category === "animal") {

    if (style === "superhero") {
  prompt = `
${identityRules}

Transform this REAL animal into a superhero version.

IMPORTANT ANIMAL RULES:
- keep the REAL animal face
- keep the REAL animal anatomy
- keep paws as paws
- NEVER transform paws into human hands
- NEVER transform the animal into a human

The animal wears a superhero inspired costume adapted for animals.

IMPORTANT:
- keep real animal anatomy
- no muscular human chest
- no humanoid superhero body
- animal remains realistic
- costume fitted naturally on animal body
`;
}

  }

  else {

    prompt = `
${identityRules}

Transform this FRENCH BULLDOG into an epic superhero French bulldog.

IMPORTANT:
- keep the dog as a French bulldog
- preserve short muzzle
- preserve bat ears
- preserve compact face
- preserve fur colors and expression
- do NOT transform into another breed
- no human hands
- only dog paws if visible

Add:
- superhero costume adapted to dog anatomy
- superhero cape
- futuristic city atmosphere
- energy lighting effects
- dramatic cinematic action lighting

Keep the exact muzzle shape.
Keep exact fur pattern.
Keep exact eye spacing.
Keep exact head proportions.

Epic superhero French bulldog portrait.
Transparent PNG background.
No text.
No frame.
No mockup.
`;

  }
}

else if (style === "anime") {

  if (category === "human") {

    prompt = `
${identityRules}

Transform the uploaded HUMAN into a realistic Japanese anime character while preserving identity.

IMPORTANT:
- keep the SAME person
- keep the SAME gender
- keep the SAME hairstyle
- keep the SAME hair color
- keep the SAME smile/expression
- keep the SAME face proportions
- keep the SAME facial structure

FORBIDDEN:
- cat ears
- animal ears
- fox ears
- neko girl
- chibi style
- fantasy creature
- mascot style
- overly exaggerated anime eyes
- changing ethnicity
- changing gender

Style:
- realistic modern Japanese anime
- Makoto Shinkai inspired
- cinematic anime portrait
- soft anime shading
- elegant detailed line art
- realistic proportions
- subtle anime eyes
- natural beauty

The uploaded person must remain recognizable.

Transparent PNG background.
No text.
No frame.
No mockup.
This is a strict identity-preserving image edit.
Do not redesign the face.
Only change outfit, style and atmosphere.
`;

  }

  else if (category === "animal") {

    prompt = `
${identityRules}

Transform this ANIMAL into a premium Japanese anime animal.

IMPORTANT:
- keep the SAME animal species
- preserve exact breed/species
- preserve fur colors and expression
- do NOT transform into a french bulldog unless it already is one
- do NOT create a human face

Add:
- expressive anime eyes
- premium Japanese anime rendering
- soft cinematic anime lighting
- animated movie atmosphere
- cute anime style

Premium anime animal portrait.
Transparent PNG background.
No text.
No frame.
No mockup.
IMPORTANT ANIMAL RULES:
- keep the REAL animal face
- keep the REAL animal anatomy
- keep paws as paws
- NEVER transform paws into human hands
- NEVER transform the animal into a human
- keep authentic fur
- keep authentic muzzle
- keep authentic ears
- keep authentic body proportions
- the animal must stay a real animal

FORBIDDEN:
- human face
- human skin
- human anatomy
- human nose
- human mouth
- human hands
- humanoid body
`;

  }

  else {

    prompt = `
${identityRules}

Transform this FRENCH BULLDOG into a premium Japanese anime French bulldog.

IMPORTANT:
- keep the dog as a French bulldog
- preserve short muzzle
- preserve bat ears
- preserve compact face
- preserve fur colors and expression
- do NOT transform into another breed

Add:
- expressive anime dog eyes
- premium Japanese anime rendering
- soft cinematic anime lighting
- animated movie atmosphere
- cute anime French bulldog style

Keep the exact muzzle shape.
Keep exact fur pattern.
Keep exact eye spacing.
Keep exact head proportions.

Premium anime French bulldog portrait.
Transparent PNG background.
No text.
No frame.
No mockup.
`;

  }
}

else if (style === "cartoon") {

if (category === "human") {

prompt = `
Transform this HUMAN portrait into a cute cartoon illustration.
This is an image-to-image transformation, not a new character creation.

IMPORTANT:
- keep the SAME person
- preserve face structure
- preserve hairstyle
- preserve eyes
- preserve human anatomy
- do NOT create a dog
- do NOT create animal ears
- do NOT create a french bulldog

Cute Pixar cartoon style.
This is a strict identity-preserving image edit.
Do not redesign the face.
Only change outfit, style and atmosphere.
`;

}

else if (category === "animal") {

prompt = `
Transform this ANIMAL into a cute cartoon version.

IMPORTANT:
- keep the SAME animal species
- preserve the real breed/species
- do NOT transform into a french bulldog unless it already is one

Cute cartoon style.
`;

}

else {

prompt = `
${identityRules}

Transform the uploaded French bulldog into a premium 3D cartoon French bulldog.

Keep French bulldog features:
- short muzzle
- bat ears
- compact head

Cute animated style.
Transparent PNG background.
IMPORTANT ANIMAL RULES:
- keep the REAL animal face
- keep the REAL animal anatomy
- keep paws as paws
- NEVER transform paws into human hands
- NEVER transform the animal into a human
- keep authentic fur
- keep authentic muzzle
- keep authentic ears
- keep authentic body proportions
- the animal must stay a real animal

Keep the exact muzzle shape.
Keep exact fur pattern.
Keep exact eye spacing.
Keep exact head proportions.

FORBIDDEN:
- human face
- human skin
- human anatomy
- human nose
- human mouth
- human hands
- humanoid body
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

if (category === "frenchie") {
  guidanceScale = 1;
  strengthValue = 0.4;
}

if (category === "human") {
  guidanceScale = 1;
  strengthValue = 0.10;
}

if (category === "animal") {
  guidanceScale = 1;
  strengthValue = 0.4;
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