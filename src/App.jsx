import { removeBackground } from "@imgly/background-removal";
import React, { useState, useEffect } from "react";
import "./index.css";

const API_URL = import.meta.env.VITE_API_URL;
const styles = [
  { id: "original", name: "📸 Portrait classique" },
  { id: "royal", name: "👑 Royal" },
  { id: "museum", name: "🖼️ Musée / Renaissance" },
  { id: "astronaut", name: "🚀 Astronaute" },
  { id: "gangster", name: "🕶️ Élégant" },
  { id: "anime", name: "🌸 Anime japonais" },
  { id: "viking", name: "🪓 Viking" },
  { id: "biker", name: "🏍️ Biker" },
  { id: "superhero", name: "⚡ Super-héros" },
  { id: "cartoon", name: "🎨 Cartoon" },
  { id: "rockstar", name: "🎸 Rockstar" },
    { id: "pilote", name: "🌸 Pilote" },
        { id: "une", name: "🖼️ Une" },
        { id: "millionnaire", name: "👑 Millionnaire" },
        { id: "agent", name: "🏍️ Agent Secret" },
        { id: "dj", name: "🎨 DJ" },
        { id: "vampire", name: "📸 Vampire" },

];

const products = [
  { id: "poster", name: "Affiche" },
  { id: "mug", name: "Mug" },

  { id: "thomme", name: "Tee-shirt Homme (noir)" },
  { id: "thommeblanc", name: "Tee-shirt Homme (blanc)" },

  { id: "tfemme", name: "Tee-shirt Femme (noir)" },
  { id: "tfemmeblanc", name: "Tee-shirt Femme (blanc)" },
  { id: "tfemmerose", name: "Tee-shirt Femme (rose)" },

  { id: "casquette", name: "Casquette" },
  { id: "totebag", name: "Tote bag" },
];

const categories = [
  { id: "frenchie", name: "🐶 Bouledogue français" },
  { id: "animal", name: "🐾 Animal" },
  { id: "human", name: "👤 Humain" },
];

export default function App() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiImage, setAiImage] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState("original");
  const [customText, setCustomText] = useState("")
  const [bottomText, setBottomText] = useState("")
  const [textColor, setTextColor] = useState("#111111")
  const [circleColor, setCircleColor] = useState("#c79b2c")
  const [selectedProduct, setSelectedProduct] = useState("poster");
  const [generated, setGenerated] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("frenchie");
  const [uploadLoading, setUploadLoading] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
const [loadingMessage, setLoadingMessage] = useState("Analyse de votre photo...");
const [userEmail, setUserEmail] = useState("");

useEffect(() => {
  const handler = (e) => {
    e.preventDefault();
    setDeferredPrompt(e);
  };

  window.addEventListener("beforeinstallprompt", handler);

  return () => {
    window.removeEventListener("beforeinstallprompt", handler);
  };
}, []);

const handleImage = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  setUploadLoading(true);

  await new Promise((resolve) => setTimeout(resolve, 100));

  try {
    const isIPad =
      /iPad|Macintosh/.test(navigator.userAgent) &&
      navigator.maxTouchPoints > 1;

    if (isIPad) {
      const reader = new FileReader();

      reader.onloadend = () => {
        setImage(reader.result);
        setAiImage(null);
        setGenerated(false);
        setUploadLoading(false);
      };

      reader.readAsDataURL(file);
      return;
    }

    const blob = await removeBackground(file);
    const url = URL.createObjectURL(blob);

    setImage(url);
    setAiImage(null);
    setGenerated(false);
    setUploadLoading(false);
  } catch (err) {
    console.error(err);
    alert("Erreur upload image : " + err.message);
    setUploadLoading(false);
  }
};
const resizeImage = (base64, maxSize = 900, quality = 0.8) => {
  return new Promise((resolve) => {
    const img = new Image();

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > height && width > maxSize) {
        height = Math.round((height * maxSize) / width);
        width = maxSize;
      }

      if (height >= width && height > maxSize) {
        width = Math.round((width * maxSize) / height);
        height = maxSize;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      resolve(canvas.toDataURL("image/jpeg", quality));
    };

    img.src = base64;
  });
};
const testAI = async () => {
  setLoadingMessage("Analyse de votre photo...");
  console.log("BOUTON GENERER CLIQUÉ");

  if (!userEmail) {
  alert("Veuillez entrer votre email");
  return;

    setAiLoading(true);

}
const checkResponse = await fetch(`${API_URL}/api/check-credits`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    email: userEmail,
  }),
});

const checkData = await checkResponse.json();

console.log("checkData :", checkData);

if (!checkData) {
  alert("Erreur crédits : aucune donnée reçue");
  return;
}

if (
  (checkData.credits || 0) <= 0 &&
  (checkData.free_generations || 0) <= 0
) {
  alert("Vous n'avez plus de crédits disponibles");
  return;
}

setTimeout(() => {
  setLoadingMessage("Création du style IA...");
}, 3000);

setTimeout(() => {
  setLoadingMessage("Ajout des détails premium...");
}, 7000);

setTimeout(() => {
  setLoadingMessage("Finalisation du rendu...");
}, 12000);
  if (!image) {
    alert("Ajoute d'abord une photo");
    return;
  }

  if (selectedStyle === "original") {
    setAiImage(image);
    setGenerated(false);
    return;
  }


  try {
    const res = await fetch(image);
    const blob = await res.blob();

    const reader = new FileReader();

    reader.onloadend = async () => {
      const base64Image = await resizeImage(reader.result);

      const response = await fetch(`${API_URL}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: base64Image,
          style: selectedStyle,
          category: selectedCategory,
        }),
      });

      const data = await response.json();

      if (!data.output) {
  alert("Erreur IA : aucun visuel généré.");
  setAiLoading(false);
  setLoading(false);
  return;
}

await fetch(`${API_URL}/api/use-credit`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    email: userEmail,
  }),
});

      setAiImage(data.output);
      setGenerated(false);
      setLoading(false);
      setAiLoading(false);
    };
 
    reader.readAsDataURL(blob);
  } catch (error) {
    console.error(error);
    alert("Erreur pendant la génération IA");
    setLoading(false);
  }
};

  return (
    <div className="app">
      <aside className="sidebar">
        <h1>👑 Memory Art Studio </h1>
        <p>Transformez vos photos en créations uniques</p>
        <button
  className="installBtn"
  onClick={async () => {
    if (!deferredPrompt) {
      alert(
        "Sur iPhone/iPad : utilisez 'Ajouter à l’écran d’accueil' dans Safari."
      );
      return;
    }

    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("PWA installée");
    }

    setDeferredPrompt(null);
  }}
>
  📲 Installer l’application
</button>
<h3 className="stepTitle">1 — Choisis ta photo</h3>
        <label className="uploadBox">
  {image ? <img src={image} alt="upload" /> : <span>Importer une photo</span>}
  <input type="file" accept="image/*" onChange={handleImage} />
</label>

<h3 className="stepTitle">2 — Choisis le type de photo</h3>
       <div className="categoryGrid">
  {categories.map((category) => (
    <button
      key={category.id}
      className={
        selectedCategory === category.id
          ? "category active"
          : "category"
      }
      onClick={() => setSelectedCategory(category.id)}
    >
      {category.name}
    </button>
  ))}
</div>
<h3 className="stepTitle">3 — Choisis ton style</h3>
        <div className="styleGrid">
  {styles
    .filter((style) => {
      if (selectedCategory === "human") {
        return [
          "original",
          "anime",
          "cartoon",
          "superhero",
          "pilote",
          "une",
          "millionnaire",
          "agent",
          "dj",
          "vampire"
        ].includes(style.id);
      }

      if (selectedCategory === "animal") {
  return [
    "original",
    "royal",
    "museum",
    "astronaut",
    "gangster",
    "anime",
    "viking",
    "biker",
    "gangster",
    "superheros",
    "cartoon",
    "pilote",
    "millionnaire",
    "dj",
  ].includes(style.id);
}

if (selectedCategory === "frenchie") {
  return [
    "original",
    "royal",
    "museum",
    "astronaut",
    "gangster",
    "anime",
    "viking",
    "biker",
    "gangster",
    "superheros",
    "cartoon",
    "pilote",
    "millionnaire",
    "dj",
  ].includes(style.id);
}

      return true;
    })
    .map((style) => (
      <button
        key={style.id}
        className={
          selectedStyle === style.id
            ? "style active"
            : "style"
        }
        onClick={() => setSelectedStyle(style.id)}
      >
        {style.name}
      </button>
    ))}
</div>

<input
  type="email"
  placeholder="Votre email"
  value={userEmail}
  onChange={(e) => setUserEmail(e.target.value)}
  className="emailInput"
/>
<button
  className="aiBtn"
  onClick={testAI}
  disabled={aiLoading}
>
  {aiLoading ? "Génération IA..." : "Générer mon visuel IA"}
</button>

    <h3 className="stepTitle">5 — Personnalise ton produit</h3>

{(selectedProduct === "poster" || selectedProduct === "mug") && (
  <div className="textOptions">

  <label className="optionLabel">
    Choisissez le texte de votre produit pour affiche ou mug
  </label>

    <input
      className="customTextInput"
      type="text"
      placeholder="Texte en haut"
      value={customText}
      onChange={(e) => setCustomText(e.target.value)}
    />

    <input
      className="customTextInput"
      type="text"
      placeholder="Texte en bas"
      value={bottomText}
      onChange={(e) => setBottomText(e.target.value)}
    />
<label className="optionLabel">
  Sélectionnez la couleur de votre texte
</label>
    <input
      className="colorPicker"
      type="color"
      value={textColor}
      onChange={(e) => setTextColor(e.target.value)}
    />

  <label className="optionLabel">
  Sélectionnez la couleur du cercle
</label>

<input
  className="colorPicker"
  type="color"
  value={circleColor}
  onChange={(e) => setCircleColor(e.target.value)}
/>
  </div>
)}
        <button className="generateBtn" onClick={() => setGenerated(true)}>
  Voir l’aperçu sur produit
</button>

        <div className="productGrid">
  {products.map((product) => (
    <button
      key={product.id}
      className={selectedProduct === product.id ? "product active" : "product"}
      onClick={() => setSelectedProduct(product.id)}
    >
      {product.name}
    </button>
  ))}
</div>
      </aside>

      <main className="preview">
        {aiImage && !generated ? (
  <div className="singleAIResult">
    <img src={aiImage} alt="Résultat IA" />
  </div>
) : !generated ? (
  <div className="emptyPreview">
            <h2>Votre visuel apparaîtra ici</h2>
            <p>Importez une photo puis choisissez un style.</p>
          </div>
                ) : (
                  
          <div className={`productPreview ${selectedProduct}`}>
  <img
    className="mockupBase"
    src={
  selectedProduct === "mug"
    ? "/mockups/mug.png"
    : selectedProduct === "thomme"
    ? "/mockups/thomme.png"
    : selectedProduct === "thommeblanc"
    ? "/mockups/thommeblanc.png"
    : selectedProduct === "tfemme"
    ? "/mockups/tfemme.png"
    : selectedProduct === "tfemmeblanc"
    ? "/mockups/tfemmeblanc.png"
    : selectedProduct === "tfemmerose"
    ? "/mockups/tfemmerose.png"
    : selectedProduct === "casquette"
    ? "/mockups/casquette.png"
    : selectedProduct === "totebag"
    ? "/mockups/totebag.png"
    : "/mockups/affiche.png"
}
    alt=""
  />

  <div className="mockupDesign">
    <div className={`poster ${selectedStyle}`}>
  {aiImage ? (
    <img
  className="finalAIImage"
  src={aiImage}
  alt=""
  style={{
    borderColor: circleColor,
  }}
/>
  ) : image ? (
    <img
  className="dogCutout"
  src={image}
  alt=""
  style={{
    borderColor: circleColor,
  }}
/>
  ) : null}

{(selectedProduct === "poster" || selectedProduct === "mug") && customText && (  <div
    className="posterText top"
    style={{ color: textColor }}
  >
    {customText.replace(/ /g, "\n")}
  </div>
)}

{(selectedProduct === "poster" || selectedProduct === "mug") && bottomText && (  <div
    className="posterText bottom"
    style={{ color: textColor }}
  >
    {bottomText.replace(/ /g, "\n")}
  </div>
)}
</div>
  </div>
</div>
)}

{generated && !showOrderForm && (
  <button
    className="floatingOrderBtn"
    onClick={() => setShowOrderForm(true)}
  >
    ✨ Passer commande  
  </button>
)}
{showOrderForm && (
  <div className="modalOverlay">
    <div className="orderModal">
      <h2>Finaliser la commande</h2>
  
       

      <div className="summary">
        <p>
          Produit :
          <strong>
            {" "}
            {products.find((p) => p.id === selectedProduct)?.name}
          </strong>
        </p>

        <p>
          Style :
          <strong>
            {" "}
            {styles.find((s) => s.id === selectedStyle)?.name}
          </strong>
        </p>
      </div>

{(
  selectedProduct === "thomme" ||
  selectedProduct === "thommeblanc" ||
  selectedProduct === "tfemme" ||
  selectedProduct === "tfemmeblanc" ||
  selectedProduct === "tfemmerose"
) && (
  <select
    className="sizeSelect"
    value={selectedSize}
    onChange={(e) => setSelectedSize(e.target.value)}
  >
    <option value="">Choisir une taille</option>
    <option value="S">S</option>
    <option value="M">M</option>
    <option value="L">L</option>
    <option value="XL">XL</option>
    <option value="XXL">XXL</option>
  </select>
)}

      <button
  className="payBtn"
  onClick={async () => {
    try {
      const response = await fetch(`${API_URL}/api/create-checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product: selectedProduct,
          style: selectedStyle,
          category: selectedCategory,
          size: selectedSize,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
alert(JSON.stringify(data));
}
    } catch (error) {
      alert("Erreur Stripe : " + error.message);
    }
  }}
>
  Continuer vers le paiement   
</button>  

      <button
        className="closeBtn"
        onClick={() => setShowOrderForm(false)}
      >
        Fermer
      </button>
    </div>
  </div>
)}

{(loading || uploadLoading) && (
  <div className="loadingOverlay">
    <div className="loadingBox">
      <div className="spinner"></div>

      <h2>
        {uploadLoading
          ? "Préparation de votre photo..."
          : "Création de votre visuel IA..."}
      </h2>

      <p>
        {uploadLoading
          ? "Détourage et optimisation de l’image en cours..."
          : loadingMessage}
      </p>
    </div>
  </div>
)}
      </main>
    </div>
    );
}
