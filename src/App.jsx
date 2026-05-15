import React, { useState } from "react";
import "./index.css";
const API_URL = import.meta.env.VITE_API_URL;
const styles = [
  { id: "original", name: "📸 Portrait classique" },
  { id: "royal", name: "👑 Royal" },
  { id: "museum", name: "🖼️ Musée / Renaissance" },
  { id: "minimal", name: "✨ Minimal luxe" },
  { id: "astronaut", name: "🚀 Astronaute" },
  { id: "gangster", name: "🕶️ angster" },
  { id: "anime", name: "🌸 Anime japonais" },
  { id: "viking", name: "🪓 Viking" },
  { id: "biker", name: "🏍️ Biker" },
  { id: "superhero", name: "⚡ Super-héros" },
  { id: "cartoon", name: "🎨 Cartoon" },
  { id: "rockstar", name: "🎸 Rockstar" }
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

export default function App() {
  const [image, setImage] = useState(null);
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

const handleImage = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    const reader = new FileReader();

    reader.onloadend = async () => {
      const base64Image = reader.result;

      const response = await fetch(`${API_URL}/api/remove-background`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: base64Image }),
      });

      const data = await response.json();

      console.log("Réponse détourage :", data);

      if (!response.ok || !data.output) {
        alert("Erreur détourage : " + (data.error || "serveur"));
        return;
      }

      setImage(data.output);
      setAiImage(null);
      setGenerated(false);
    };

    reader.readAsDataURL(file);
  } catch (err) {
    console.error("Erreur upload complète :", err);
    alert("Erreur upload image : " + err.message);
  }
};
  console.log("handleImage lancé");

  try {
    const reader = new FileReader();

    reader.onloadend = async () => {
      const base64Image = reader.result;

      const response = await fetch(`${API_URL}/api/remove-background`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: base64Image,
        }),
      });

      const data = await response.json();

      if (!data.output) {
        alert("Erreur détourage image");
        return;
      }

      setImage(data.output);
      setAiImage(null);
      setGenerated(false);
    };

    reader.readAsDataURL(file);
  } catch (err) {
    console.error(err);
    alert("Erreur upload image");
  }
};
 

const testAI = async () => {
  if (!image) {
    alert("Ajoute d'abord une photo");
    return;
  }

  if (selectedStyle === "original") {
    setAiImage(image);
    setGenerated(false);
    return;
  }

  setAiLoading(true);

  try {
    const res = await fetch(image);
    const blob = await res.blob();

    const reader = new FileReader();

    reader.onloadend = async () => {
      const base64Image = reader.result;

      const response = await fetch(`${API_URL}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: base64Image,
          style: selectedStyle,
        }),
      });

      const data = await response.json();

      if (!data.output) {
        alert("Erreur IA : aucun visuel généré.");
        setAiLoading(false);
        return;
      }

      setAiImage(data.output);
      setGenerated(false);
      setAiLoading(false);
    };

    reader.readAsDataURL(blob);
  } catch (error) {
    console.error(error);
    alert("Erreur pendant la génération IA");
    setAiLoading(false);
  }
};

  return (
    <div className="app">
      <aside className="sidebar">
        <h1>👑 Memory Art Studio </h1>
        <p>Transformez vos photos en créations uniques</p>

        <div className="uploadBox">
  {image ? <img src={image} alt="upload" /> : <span>Importer une photo</span>}
</div>

<input
  className="realFileInput"
  type="file"
  accept="image/*"
  onChange={handleImage}
/>

       

        <div className="styleGrid">
          {styles.map((style) => (
            <button
              key={style.id}
              className={selectedStyle === style.id ? "style active" : "style"}
              onClick={() => setSelectedStyle(style.id)}
            >
              {style.name}
            </button>
          ))}
        </div>
{(selectedProduct === "poster" || selectedProduct === "mug") && (
  <div className="textOptions">

  
  <label className="optionLabel">
  Sélectionnez la couleur du cercle
</label>

<input
  className="colorPicker"
  type="color"
  value={circleColor}
  onChange={(e) => setCircleColor(e.target.value)}
/>

<label className="optionLabel">
    Choisissez le texte de votre produit
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

  </div>
)}
        <button className="generateBtn" onClick={() => setGenerated(true)}>
  Voir l’aperçu sur produit
</button>

<button
  className="aiBtn"
  onClick={testAI}
  disabled={aiLoading}
>
  {aiLoading ? "Génération IA..." : "Générer mon visuel IA"}
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
    {customText}
  </div>
)}

{(selectedProduct === "poster" || selectedProduct === "mug") && bottomText && (  <div
    className="posterText bottom"
    style={{ color: textColor }}
  >
    {bottomText}
  </div>
)}
</div>
  </div>
</div>
)}

{generated && !showOrderForm && (
  <div className="orderBox">
    <h3>Commander cette création</h3>
    <p>
      Produit choisi :{" "}
      <strong>
        {products.find((p) => p.id === selectedProduct)?.name}
      </strong>
    </p>
    <p>
      Style choisi :{" "}
      <strong>
        {styles.find((s) => s.id === selectedStyle)?.name}
      </strong>
    </p>

    <button
  className="orderBtn"
  onClick={() => setShowOrderForm(true)}
>
  Commander ce visuel
</button>
  </div>
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

      <button
  className="payBtn"
  onClick={async () => {
    console.log("Bouton paiement cliqué");

    const response = await fetch(`${API_URL}/api/create-checkout-session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
  product: products.find((p) => p.id === selectedProduct)?.name,
  style: styles.find((s) => s.id === selectedStyle)?.name,
}),
    });

    const data = await response.json();

    console.log("Réponse Stripe :", data);

    if (data.url) {
      window.location.href = data.url;
    } else {
      alert("Erreur : aucune URL Stripe reçue");
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
      </main>
    </div>
    );
}
