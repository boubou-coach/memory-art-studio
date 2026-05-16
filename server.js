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
    console.log("STYLE REÇU :", style);

    if (!image) {
      return res.status(400).json({ error: "Image manquante" });
    }

    let prompt = "";

    const identityRules = `
CRITICAL RULES:
The uploaded subject must remain the same subject.

If it is a dog:
- keep it as a dog
- keep the exact breed
- if it is a French bulldog, it MUST remain a French bulldog
- short muzzle
- wide square head
- compact body
- bat ears
- same fur colors and markings
- same eye color
- same expression as much as possible

NEVER transform the dog into a cat.
NEVER transform the dog into a human.
NEVER add human hands.
NEVER add human fingers.
NEVER add human arms.
If paws are visible, they must be dog paws only.

Create a clean isolated subject.
No rectangular background.
No scene background.
No white background.
No black background.
No frame.
No text.
No mockup.
Transparent PNG background.
`;

if (style === "royal") {
  prompt = `
${identityRules}
Transform the uploaded subject into a majestic royal portrait.

Keep EXACTLY the same identity from the uploaded photo.
For a person: same face, eyes, nose, mouth, hair and expression.
For an animal: same breed, muzzle, eyes, ears, fur colors and expression.

Do not create another subject.
Do not modify identity.

Add:
detailed royal crown,
luxurious red and black royal cape,
gold jewelry,
royal throne,
dramatic cinematic palace lighting,
baroque decorations,
luxury royal atmosphere.

Ultra realistic.
Premium cinematic portrait.
Centered composition.
Transparent PNG background.
No text. No frame. No mockup.
The royal outfit must fit the dog body.
If paws are visible, they must be dog paws, not human hands.
Keep the full bust visible, including cape and outfit.
- centered portrait composition
- upper body only
- no transparent fabric
- solid velvet royal cape
- clean silhouette
- no smoke
- no blur around body
No fading edges.
No transparent clothing.
Fully opaque subject.
`;
}

else if (style === "rockstar") {
  prompt = `
${identityRules}

Transform the uploaded French bulldog into a rockstar dog.

Add:
- black leather jacket
- black sunglasses
- silver chain necklace
- microphone on a microphone stand in front of the dog
- rock concert lighting

Composition:
- upper body portrait
- centered subject
- only head, chest and dog paws visible

Important:
The dog must remain a French bulldog.
Dog anatomy only.
No human hands.
No human fingers.
No human arms.
No hand holding microphone.
No blue bubble.
No colored circle.
No random floating object.
No background artifact.
Fully opaque subject.
Transparent PNG background.
- no floating objects
- no pink artifacts
- realistic dog paws only
- no human hands
- no objects behind the ears
`;
}

else if (style === "museum") {
  prompt = `
${identityRules}
Transform the uploaded subject into a renaissance museum masterpiece.

Keep EXACTLY the same identity from the uploaded photo.
Do not create another subject.

Add:
renaissance noble clothing,
old royal museum collar,
oil painting texture,
majestic pose,
historical renaissance atmosphere,
museum masterpiece style,
dramatic renaissance lighting,
classical artistic details.

Look like a real museum painting masterpiece.
Ultra detailed.
Transparent PNG background.
No text. No frame. No mockup.
`;
}

else if (style === "minimal") {
  prompt = `
${identityRules}
Transform the uploaded subject into a luxury minimal fashion icon.

Keep EXACTLY the same identity from the uploaded photo.
Do not modify identity.

Add:
luxury designer sunglasses,
thick gold necklace,
premium luxury clothes,
editorial fashion lighting,
minimal luxury atmosphere,
high-end fashion magazine style,
beige, black and gold tones.

Ultra realistic luxury portrait.
Transparent PNG background.
No text. No frame. No mockup.
`;
}

else if (style === "astronaut") {
  prompt = `
${identityRules}

Transform the uploaded dog into a futuristic astronaut version.

IMPORTANT:
The original dog breed must stay unchanged.
Do not transform the dog into another breed.

The ear shape must remain EXACTLY the same as in the uploaded photo.
If the dog has floppy ears, keep floppy ears.
If the dog has upright ears, keep upright ears.

Forbidden:
- changing ear shape
- changing breed
- adding french bulldog ears to non-french bulldogs
- adding floppy ears to upright-ear dogs

Add:
- large transparent astronaut helmet
- ears fully visible INSIDE the helmet
- no holes for ears
- futuristic sci-fi dog suit
- cinematic blue lighting
- realistic reflections on glass

No human body.
No human hands.
`;
}

else if (style === "gangster") {
  prompt = `
${identityRules}

Transform the uploaded French bulldog into a dark cinematic mafia boss dog.

Add:
- black gangster fedora
- black mafia suit adapted to dog body
- gold chain around the neck
- serious boss expression
- dramatic noir lighting
- luxury gangster movie vibe

Important:
No cigar in the mouth.
No human hands.
No human body.
Only dog paws if visible.
The dog must look like a real French bulldog mafia boss.
`;
}

else if (style === "anime") {
  prompt = `
${identityRules}

Transform the uploaded French bulldog into a premium Japanese anime French bulldog.

Important:
It must NOT look like a cat.
It must keep French bulldog features:
short muzzle, wide head, bat ears, compact face, same fur markings.

Add:
- expressive anime dog eyes
- soft Japanese anime rendering
- cherry blossom inspired accessories
- cute premium anime movie style

No cat face.
No long cat muzzle.
No feline features.
`;
}

else if (style === "viking") {
  prompt = `
${identityRules}
Transform the uploaded subject into a powerful Viking warrior.

Keep EXACTLY the same identity from the uploaded photo.
Do not modify the face identity.

Add:
fur armor,
Viking axe,
snow environment,
warrior armor,
Nordic atmosphere,
cinematic cold lighting,
epic warrior aesthetic.

Ultra realistic Viking portrait.
Transparent PNG background.
No text. No frame. No mockup.
`;
}

else if (style === "biker") {
  prompt = `
${identityRules}

Transform the uploaded dog into a realistic biker dog.

IMPORTANT:
Keep the ORIGINAL dog breed unchanged.

The ears must remain EXACTLY the same as in the uploaded photo.

If the dog has floppy ears:
- keep floppy ears
- ears must hang naturally

If the dog has upright ears:
- keep upright ears

Forbidden:
- changing ear shape
- pointy ears on floppy-ear dogs
- french bulldog ears
- corgi ears
- wolf ears

Add:
- black leather biker jacket adapted to dog anatomy
- realistic motorcycle beside the dog
- cool cinematic lighting
- sunglasses if they fit naturally
- realistic fur details

No human body.
No human hands.
`;
}

else if (style === "superhero") {
  prompt = `
${identityRules}
Transform the uploaded subject into an epic superhero.

Keep EXACTLY the same identity from the uploaded photo.
Do not change identity.

Add:
superhero cape,
hero costume,
futuristic city,
energy lights,
epic superhero pose,
cinematic action lighting,
powerful atmosphere.

Ultra realistic superhero movie style.
Transparent PNG background.
No text. No frame. No mockup.
`;
}

else if (style === "cartoon") {
  prompt = `
${identityRules}

Transform the uploaded French bulldog into a premium 3D cartoon French bulldog.

Important:
It must NOT look like a cat.
It must keep French bulldog features:
short muzzle, wide head, bat ears, compact face, same fur markings.

Add:
- big expressive cartoon dog eyes
- cute French bulldog face
- soft premium animation rendering
- warm animated movie lighting

No cat face.
No feline features.
`;
}

if (!prompt) {
  prompt = `
Transform the uploaded subject into a premium portrait.

Keep EXACTLY the same identity from the uploaded photo.

Transparent PNG background.
No text. No frame. No mockup.
`;
}

    const output = await replicate.run("black-forest-labs/flux-kontext-pro", {
      input: {
  image: image,
  prompt: prompt,
  negative_prompt: `
  extra ears,
  extra objects,
  floating objects,
  pink artifacts,
  background artifacts,
  deformed accessories,
  human hands,
  extra limbs,
  mutated anatomy,
  glitches,
  weird shapes behind head,
  duplicate elements
`,
      },
    });

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