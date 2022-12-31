//node server
var express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const reader = require("xlsx");
const async = require("async");
const fs = require("fs");
const multer = require("multer");
const path = require("path");

//enviornment variables
require("dotenv").config();

// Instantiating Objects
const app = express();
const upload = multer({ dest: "./public/uploads" });

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.resolve(__dirname, "../client/build")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Schema Declaration
const candidateSchema = new mongoose.Schema({
	name: String,
	email: String,
	mobile: String,
	dob: String,
	work_exp: String,
	resume_title: String,
	current_location: String,
	postal_address: String,
	current_employer: String,
	current_designation: String,
});

//Model Declaration
const Candidate = mongoose.model("Candidate", candidateSchema);

//Connect to the Database
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });

mongoose.connection.on("connected", () => {
	console.log("Connected to database");
});

mongoose.connection.on("error", (err) => {
	console.log("Database error: " + err);
});

// Utility Functions

function filetojson(file) {
	const workbook = reader.readFile(file);
	const sheets = workbook.SheetNames;
	const xlData = reader.utils.sheet_to_json(workbook.Sheets[sheets[0]]);
	return xlData;
}

async function saveCandidate(data) {
	const candidate = new Candidate({
		name: data["Name of the Candidate"],
		email: data["Email"],
		mobile: data["Mobile No."],
		dob: data["Date of Birth"],
		work_exp: data["Work Experience"],
		resume_title: data["Resume Title"],
		current_location: data["Current Location"],
		postal_address: data["Postal Address"],
		current_employer: data["Current Employer"],
		current_designation: data["Current Designation"],
	});

	await candidate.save();
}

// Routes
app.get("*", (req, res) => {
	res.sendFile(path.resolve(__dirname, "../client/build", "index.html"));
});

app.get("/api", function (req, res) {
	res.json({ message: "Welcome to our api!" });
});

app.post("/api/upload", upload.single("file"), async function (req, res) {
	// Check if file is uploaded
	if (req.file === null)
		return res.status(400).json({ msg: "No file uploaded" });

	// Read file
	const xlData = filetojson(req.file.path);

	// Saving each candidate
	async.eachSeries(xlData, async (data) => {
		// Duplicate check for email
		const duplicate = await Candidate.findOne({ email: data["Email"] });
		if (duplicate) return;

		// Save candidate
		await saveCandidate(data);
	});

	// Remove file
	fs.unlink(req && req.file && req.file.path, (err) => {
		if (err) {
			console.error(err);
			return;
		}
	});

	res.json({
		message: "File uploaded successfully",
		path: req && req.file && req.file.path,
		success: true,
	});
});

// Set the port
var port = process.env.PORT || 3001;

// Start the server
app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
