const express = require("express");
const cors = require("cors");
const multer = require("multer");
const mongoose = require("mongoose"); // <-- ADDED: MongoDB
const Joi = require("joi");
const app = express();

app.use(cors({ origin: "*" }));
app.use(express.static("public"));
app.use(express.json());
app.set("json spaces", 2);

//mongo connect
mongoose.connect("mongodb+srv://talankinard:Koolaid0820@pixelport.yo9qhg0.mongodb.net/?appName=PixelPort")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB Error:", err));


//image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/images/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });


//validation schedma
const contactSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  message: Joi.string().min(3).max(500).required(),
});

const feedbackSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  feedback: Joi.string().min(10).max(300).required(),
});

//joi schema
const popularItemSchemaJoi = Joi.object({
  name: Joi.string().required(),
  price: Joi.string().required(),
  description: Joi.string().required(),
  rating: Joi.string().required(),
  reviews: Joi.array().items(Joi.string()),
});


//mongo schema
const popularItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  img: { type: String, required: true },
  price: { type: String, required: true },
  description: { type: String, required: true },
  rating: { type: String, required: true },
  reviews: { type: [String], default: [] },
});

const PopularItem = mongoose.model("PopularItem", popularItemSchema);


app.get("/api/popularItems", async (req, res) => {
  const items = await PopularItem.find();
  res.json(items);
});


app.get("/api/popularItems/:id", async (req, res) => {
  const item = await PopularItem.findById(req.params.id);
  res.json(item);
});

//post create
app.post("/api/popularItems", upload.single("img"), async (req, res) => {
  const { error, value } = popularItemSchemaJoi.validate(req.body);
  if (error)
    return res.status(400).json({ success: false, error: error.details[0].message });

  const newItem = new PopularItem({
    ...value,
    img: req.file ? req.file.filename : "placeholder.png",
  });

  const saved = await newItem.save();
  res.status(201).json({ success: true, data: saved });
});

//put update
app.put("/api/popularItems/:id", upload.single("img"), async (req, res) => {
  const { error, value } = popularItemSchemaJoi.validate(req.body);
  if (error)
    return res.status(400).json({ success: false, error: error.details[0].message });

  const updateData = { ...value };
  if (req.file) updateData.img = req.file.filename;

  const updated = await PopularItem.findByIdAndUpdate(req.params.id, updateData, { new: true });
  res.json({ success: true, data: updated });
});

//delete an item
app.delete("/api/popularItems/:id", async (req, res) => {
  await PopularItem.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Item deleted!" });
});

//contact
let contactSubmissions = [];

app.post("/api/contact", (req, res) => {
  const { error, value } = contactSchema.validate(req.body);
  if (error)
    return res.status(400).json({ success: false, error: error.details[0].message });

  contactSubmissions.push(value);
  res.json({
    success: true,
    message: "Message received successfully!",
    data: value,
  });
});

app.get("/api/contact", (req, res) => {
  res.json(contactSubmissions);
});


//feedback
let feedbackSubmissions = [];
let nextId = 1;

app.post("/api/feedback", (req, res) => {
  const { error, value } = feedbackSchema.validate(req.body);
  if (error)
    return res.status(400).json({ success: false, error: error.details[0].message });

  const newFeedback = { id: nextId++, ...value };
  feedbackSubmissions.push(newFeedback);
  res.status(201).json({ success: true, message: "Feedback added!", data: newFeedback });
});

app.get("/api/feedback", (req, res) => {
  res.json(feedbackSubmissions);
});

app.put("/api/feedback/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = feedbackSubmissions.findIndex((f) => f.id === id);
  if (index === -1)
    return res.status(404).json({ success: false, message: "Feedback not found." });

  const { error, value } = feedbackSchema.validate(req.body);
  if (error)
    return res.status(400).json({ success: false, error: error.details[0].message });

  feedbackSubmissions[index] = { id, ...value };
  res.status(200).json({
    success: true,
    message: "Feedback updated!",
    data: feedbackSubmissions[index],
  });
});

app.delete("/api/feedback/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = feedbackSubmissions.findIndex((f) => f.id === id);
  if (index === -1)
    return res.status(404).json({ success: false, message: "Feedback not found." });

  feedbackSubmissions.splice(index, 1);
  res.status(200).json({ success: true, message: "Feedback has been deleted." });
});


//server start
app.listen(3001, () => {
  console.log("Server is up and running");
});
