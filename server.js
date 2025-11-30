const express = require("express");
const cors = require("cors");
const multer = require("multer");
const app = express();
const Joi = require("joi");


app.use(cors({ origin: "*" }));
app.use(express.static("public"));
app.use(express.json());
app.set('json spaces', 2);

const contactSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  message: Joi.string().min(3).max(500).required(),
});


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "./public/images/");
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  });
  
const upload = multer({ storage: storage });

let popularItems = [
    {
        "_id":1,
        "name": "HellDivers 2",
        "img":"helldivers2.png",
        "price":"$49.99",
        "description": "A third-person shooter where the HellDivers, an elite faction of soldiers must spread managed Democracy across the galaxy",
        "rating":"4.2",
        "reviews":
        [
            "Very fun game!","Super hard but great concept!","Too hard for all audiences"
        ]
    },
    {
        "_id":2,
        "name":"Marvel Rivals",
        "img":"marvelrivals.png",
        "price":"$0.00",
        "description": "A free-to-play, team-based, third-person hero shooter where players assemble squads of iconic Marvel Super Heroes and Villains to battle in objective-based PVP combat",
        "rating":"4.5",
        "reviews":
        [
            "Awesome implementation of Marvel characters!","Great multiplayer game for all ages"
        ]
    },
    {
        "_id":3,
        "name": "Steel Series Gaming Headset",
        "img":"headset.webp",
        "price":"$129.99",
        "description": "A comfortable designed microphone with fabric ear cushions, high-quality, and detailed audio.",
        "rating":"3.9",
        "reviews":
        [
            "Comfortable headset","Breaks easily.","A little pricey, but worth the price."
        ]
    },
    {
        "_id":4,
        "name":"NVIDIA RTX-4090 GPU",
        "img":"gpu.png",
        "price":"$1599.99",
        "description": "A high-end NVIDIA GeForce GPU, part of the Ada Lovelace architecture, featuring a massive number of CUDA cores (over 16,000), 24GB of GDDR6X memory, and a 384-bit memory bus",
        "rating":"4.5",
        "reviews":
        [
            "Made my pc insanely good!","Super pricey but great piece!"
        ]
    },
    {
        "_id":5,
        "name":"Oculus Quest",
        "img":"oculus.png",
        "price":"$399.99",
        "description": "A device worn over the eyes to immerse users in digital environments for gaming, entertainment, and social experiences.",
        "rating":"3.7",
        "reviews":
        [
            "Super cool!","Can cause headaches...","I had a lot of fun but I can't play it for hours straight."
        ]
    },
    {
        "_id":6,
        "name":"Nintendo Switch 2",
        "img":"switch2.png",
        "price":"$499.99",
        "description": "A hybrid video game console that serves as a successor to the original Nintendo Switch.",
        "rating":"4.7",
        "reviews":
        [
            "So much fun!","A bit pricey but totally worth it!"
        ]
    },
    {
        "_id":7,
        "name":"Hallow Knight Silksong",
        "img":"hallowknightsilk.webp",
        "price":"$19.99",
        "description": "An action-adventure Metroidvania, the sequel to Hollow Knight, where players control Hornet on a journey through the unfamiliar land of Pharloom",
        "rating":"4.9",
        "reviews":
        [
            "GOTY!"
        ]
    },
    {
        "_id":8,
        "name":"Expedition 33",
        "img":"clairobscurexp33.webp",
        "price":"$49.99",
        "description": "A 2025 turn-based RPG developed by Sandfall Interactive, set in a dark fantasy Belle Époque world where the Paintress erases people at an ever-decreasing age.",
        "rating":"4.9",
        "reviews":
        [
            "Best story out of any game, made me cry!","Insane twists and story, goty for sure."
        ]
    },
    {
        "_id":9,
        "name":"Elgato Stream Deck",
        "img":"streamdeck.png",
        "price":"$119.99",
        "description": "A programmable desktop controller, most notably from Elgato, that features physical, customizable LCD keys to trigger actions and control various applications and accessories.",
        "rating":"4.0",
        "reviews":
        [
            "Very helpful for streaming, buggy sometimes."
        ]
    }
]

let contactSubmissions = [

]; 

app.get("/api/popularItems", (req, res) => {
    res.setHeader("Content-Type", "application/json"); 
    res.send(JSON.stringify(popularItems));
});

app.get("/api/popularItems/:id", (req, res) => {
    const popularItem = popularItems.find(item => item._id === parseInt(req.params.id));
    res.json(popularItem);
});

app.post("/api/contact", (req, res) => {
  const { error, value } = contactSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ 
      success: false, 
      error: error.details[0].message 
    });
  }

  contactSubmissions.push(value);
  res.json({ 
    success: true, 
    message: "Message received successfully!",
    data: value 
  });
});

app.get("/api/contact", (req, res) => {
  res.json(contactSubmissions);
});

//feedback board edit/delete
const feedbackSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  feedback: Joi.string().min(10).max(300).required(),
});

let feedbackSubmissions = [];
let nextId = 1;

// Add  feedback
app.post("/api/feedback", (req, res) => {
  const { error, value } = feedbackSchema.validate(req.body);
  if (error)
    return res.status(400).json({ success: false, error: error.details[0].message });

  const newFeedback = { id: nextId++, ...value };
  feedbackSubmissions.push(newFeedback);
  res.status(201).json({ success: true, message: "Feedback added!", data: newFeedback });
});

// Get feedback
app.get("/api/feedback", (req, res) => {
  res.json(feedbackSubmissions);
});

// Edit feedback
app.put("/api/feedback/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = feedbackSubmissions.findIndex((f) => f.id === id);
  if (index === -1)
    return res.status(404).json({ success: false, message: "Feedback not found." });

  const { error, value } = feedbackSchema.validate(req.body);
  if (error)
    return res.status(400).json({ success: false, error: error.details[0].message });

  feedbackSubmissions[index] = { id, ...value };
  res.status(200).json({ success: true, message: "Feedback updated!", data: feedbackSubmissions[index] });
});

// Delete feedback
app.delete("/api/feedback/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = feedbackSubmissions.findIndex((f) => f.id === id);
  if (index === -1)
    return res.status(404).json({ success: false, message: "Feedback not found." });

  feedbackSubmissions.splice(index, 1);
  res.status(200).json({ success: true, message: "Feedback deleted!" });
});


app.listen(3001, () => {
    console.log("Server is up and running");
});