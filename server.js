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
STRICT IDENTITY PRESERVATION.

Keep the exact same person.
Keep the exact same age.
Keep the exact same face.
Keep the exact same skin texture.
Keep the exact same wrinkles level.
Keep the exact same hairstyle.

IMPORTANT:
- DO NOT make the person older
- DO NOT add wrinkles
- DO NOT add realistic aging
- DO NOT mature the face
- DO NOT change facial proportions
- DO NOT generate a different person

The output must look like the SAME uploaded person with improved lighting only.
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

const strictAnimalRules = `
IMPORTANT:
- keep real animal anatomy
- keep the animal on four legs or in a natural sitting animal pose
- paws must stay paws
- paws must be simple animal paws without fingers
- NEVER create human hands
- NEVER create human fingers
- NEVER create human arms
- NEVER create a humanoid body
- NEVER humanize the animal
- keep authentic animal muzzle, ears, fur and proportions
- avoid showing front paws if they become hands
`;
   
if (style === "royal") {

  if (category === "human") {

    prompt = `
IMPORTANT:
Keep the original uploaded face EXACTLY identical.

Do not modify:
- eyes
- nose
- mouth
- smile
- facial proportions
- age
- skin texture
- hairstyle

Only add:
- royal crown
- royal clothes
- elegant royal background

The face must remain unchanged.
Only the outfit and environment can change.
`;

  } else if (category === "animal") {

    prompt = `
${strictAnimalRules}

Transform the uploaded animal into a luxury royal animal portrait.

IMPORTANT:
- keep real animal anatomy
- keep paws as real paws
- no human hands
- no human arms
- no humanoid body
- animal must stay on four legs or natural sitting pose

Add:
- royal king outfit adapted for animal anatomy
- luxury royal cape
- elegant golden details
- cinematic royal lighting
- dark royal background
- realistic animal portrait style

The animal must remain fully animal-like.
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

Enhance a renaissance museum portrait.
Works for solo portraits, couples, families and group photos.

Add:
- renaissance clothing
- oil painting texture
- dramatic renaissance lighting
- museum masterpiece atmosphere
`;

  } else if (category === "animal") {

    prompt = `
${strictAnimalRules}

Transform the uploaded animal into a renaissance oil painting portrait.

Add:
- renaissance outfit adapted to animal anatomy
- museum frame
- sepia tones
- dramatic renaissance lighting
- classical oil painting texture

Luxury renaissance animal portrait.
The animal must not hold objects.
`;

} else {

    prompt = `
${frenchieRules}
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
Keep the original face unchanged.

Create a luxury minimalist editorial portrait.

Add:
- beige luxury background
- soft premium studio lighting
- elegant shadows
- luxury magazine atmosphere
- clean aesthetic

Do not alter the face or age.
`;

  } else if (category === "animal") {

    prompt = `
${strictAnimalRules}

Create a luxury minimalist animal portrait.

Add:
- luxury neutral background
- premium editorial lighting
- elegant luxury atmosphere
- soft beige and black palette

High-end luxury pet photography.
The animal must not hold objects.
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
Keep the original face EXACTLY unchanged.

Only add:
- realistic astronaut helmet
- futuristic space suit
- subtle sci-fi lighting
- space background

Do not modify:
- age
- skin
- facial proportions
- expression

The face must remain identical to the uploaded photo.
`;

  } else if (category === "animal") {

    prompt = `
${animalRules}

Transform into a futuristic astronaut animal portrait.

Add:
- astronaut suit adapted to the animal
- transparent helmet
- cinematic sci-fi atmosphere
The animal must not hold objects.
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

Enhance a cinematic gangster portrait.
Works for solo portraits, couples, families and group photos.

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
The animal must not hold objects.
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

Enhance an epic Viking portrait.
Works for solo portraits, couples, families and group photos.

Add:
- Viking armor
- fur cape
- Nordic atmosphere
- snowy cinematic lighting
`;

  } else if (category === "animal") {

    prompt = `
${strictAnimalRules}

Transform the uploaded animal into a Viking portrait.

Add:
- Viking armor adapted to animal anatomy
- fur cape
- nordic atmosphere
- snowy cinematic lighting

Realistic Viking animal portrait.
The animal must not hold objects.
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

Enhance a cinematic biker portrait.
Works for solo portraits, couples, families and group photos.

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
The animal must not hold objects.
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

Enhance an epic superhero portrait.
Works for solo portraits, couples, families and group photos.

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
${strictAnimalRules}

Transform the uploaded animal into a superhero.

Add:
- superhero costume adapted to animal anatomy
- cinematic superhero lighting
- futuristic atmosphere

Epic realistic superhero animal portrait.
The animal must not hold objects.
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

Transform this person into a rockstar person.
Works for solo portraits, couples, families and group photos.

Add:
- leather rockstar outfit
- microphone
- stage lighting
- concert atmosphere
`;

  } else if (category === "animal") {

    prompt = `
${strictAnimalRules}

Transform the uploaded animal into a rockstar portrait.

Add:
- rockstar outfit adapted to animal anatomy
- stage lighting
- concert atmosphere
- stylish accessories

Realistic rockstar animal portrait.
The animal must not hold objects.
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
Transform this person into high quality Japanese anime style.

Add:
- beautiful anime illustration
- soft anime lighting
- detailed anime eyes
- cinematic anime atmosphere

Keep the hairstyle, expression and identity recognizable.
`;

  } else if (category === "animal") {

    prompt = `
${strictAnimalRules}

Transform the uploaded animal into beautiful Japanese anime style.

IMPORTANT:
- keep real animal anatomy
- keep paws as paws
- no human hands
- no human body
- keep authentic animal proportions

Add:
- high quality anime illustration
- Studio Ghibli inspired atmosphere
- soft anime lighting
- cute expressive eyes
- vibrant anime colors
- detailed fur
- cinematic anime background

The result must look like a real anime animal character.
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
Transform this person into premium cartoon illustration style.

Add:
- clean cartoon rendering
- soft vibrant colors
- Pixar-inspired atmosphere
- smooth illustration details

Keep the same hairstyle and expression recognizable.
`;

  } else if (category === "animal") {

    prompt = `
${strictAnimalRules}

Transform the uploaded animal into a premium 3D animated character.

Style:
- Pixar style
- Disney style
- clean 3D render
- expressive eyes
- soft cinematic lighting

Keep the real animal recognizable.

High quality animated movie character.
The animal must not hold objects.
`;

  } else {

    prompt = `
${frenchieRules}

Transform into a premium 3D cartoon French bulldog.
`;
  }


} else if (style === "actor") {

 

}


else if (style === "dj") {

    prompt = `
Keep the original face unchanged.

Create a luxury festival DJ portrait.

Add:
- giant festival stage lights
- neon atmosphere
- headphones around neck
- energetic music festival vibe
- premium nightlife aesthetic

Keep facial identity intact.
`;


}

else if (style === "pilote") {

    prompt = `
Keep the original face EXACTLY unchanged.

Transform the person into a Formula 1 driver portrait.

Add:
- racing suit
- luxury paddock atmosphere
- cinematic race lighting
- realistic motorsport aesthetic

Do not modify the face.
`;

}

else if (style === "une") {

    prompt = `
Keep the original face EXACTLY unchanged.

Transform the person into the cover star of a luxury magazine.

Add:
- fashion magazine atmosphere
- editorial lighting
- stylish outfit
- luxury background
- realistic magazine photoshoot aesthetic

The face must remain identical.
`;

}

else if (style === "millionnaire") {

    prompt = `
Keep the original face unchanged.

Create a luxury Monaco millionaire portrait.

Add:
- yacht club atmosphere
- elegant white outfit
- luxury sunglasses
- expensive lifestyle aesthetic
- mediterranean luxury lighting

Keep identity untouched.
`;


}

else if (style === "agent") {

    prompt = `
Keep the original face identical.

Transform the person into a stylish secret agent.

Add:
- elegant black suit
- cinematic spy lighting
- luxury watch
- dark classy atmosphere
- action movie aesthetic

Do not redesign the face.
`;


}

else if (style === "vampire") {

    prompt = `
Keep the original face unchanged.

Create an elegant gothic vampire portrait.

Add:
- luxury gothic outfit
- dark castle atmosphere
- dramatic candle lighting
- classy vampire aesthetic
- subtle gothic makeup

Keep identity untouched.
`;

}

let guidanceScale = 1;
let strengthValue = 0.04;

if (category === "human") {
  guidanceScale = 0.2;
strengthValue = 0.005;
}
   
if (category === "animal") {
  guidanceScale = 0.8;
  strengthValue = 0.03;
}

if (category === "frenchie") {
  guidanceScale = 0.7;
  strengthValue = 0.02;
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

    const { product, style, size } = req.body;
    console.log("Produit reçu :", product);
    let priceId = "";

if (product === "poster" || product === "affiche") {
  priceId = "price_1TYw1GP4HAanNIKrxtPh6irM";
    } else if (product === "mug") {
      priceId = "price_1TYw3XP4HAanNIKr85xfYdJz";
    } else if (product === "thomme") {
  priceId = "price_1TYw7EP4HAanNIKrfJdWzuOb";

} else if (product === "thommeblanc") {
  priceId = "price_1TYw6fP4HAanNIKrmepTTtxw";

} else if (product === "tfemme") {
  priceId = "price_1TYw9kP4HAanNIKrsrXN5xDo";

} else if (product === "tfemmeblanc") {
  priceId = "price_1TYw8hP4HAanNIKrEGyKsSJS";

} else if (product === "tfemmerose") {
  priceId = "price_1TYw85P4HAanNIKr882BAvZ9";
} else if (product === "casquette") {
      priceId = "price_1TYwBmP4HAanNIKrsyYJapqq";
    } else if (product === "totebag") {
      priceId = "price_1TYwDGP4HAanNIKrVQ6bkUAu";
    }

    if (!priceId) {
      return res.status(400).json({ error: "Produit inconnu" });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],

      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],

      metadata: {
        product,
        style,
        size: size || "",
      },

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




import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

app.post("/api/check-credits", async (req, res) => {
  const { email } = req.body;

  let { data } = await supabase
    .from("users_credits")
    .select("*")
    .eq("email", email)
    .single();

  if (!data) {
    const { data: newUser } = await supabase
      .from("users_credits")
      .insert([
        {
          email,
          credits: 0,
          free_generations: 3,
        },
      ])
      .select()
      .single();

    data = newUser;
  }

  res.json(data);
});

app.post("/api/use-credit", async (req, res) => {
  const { email } = req.body;

  const { data } = await supabase
    .from("users_credits")
    .select("*")
    .eq("email", email)
    .single();

  if (!data) {
    return res.status(400).json({
      error: "Utilisateur introuvable",
    });
  }

  if (data.credits > 0) {
    await supabase
      .from("users_credits")
      .update({
        credits: data.credits - 1,
      })
      .eq("email", email);

    return res.json({
      success: true,
    });
  }

  if (data.free_generations > 0) {
    await supabase
      .from("users_credits")
      .update({
        free_generations: data.free_generations - 1,
      })
      .eq("email", email);

    return res.json({
      success: true,
    });
  }

  return res.status(400).json({
    error: "Plus de crédits",
  });
});

app.listen(3001, "0.0.0.0", () => {
  console.log("API lancée sur http://localhost:3001");
});