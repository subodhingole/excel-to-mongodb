import React, { useState, useEffect } from "react";
import axios from "axios";
import logo from "./logo.svg";
import "./App.css";

function App() {
	const [file, setFile] = useState<File | null>(null);
	const [success, setSuccess] = useState(false);

	// HANDLE FILE UPLOAD
	function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
		if (e.target.files && e.target.files.length > 0) {
			setFile(e.target.files[0]);
		}
	}

	// HANDLE FILE SUBMIT
	async function handleFileSubmit() {
		const formData = new FormData();
		formData.append("file", file!, "file");
		await axios
			.post("/api/upload", formData)
			.then((res) => {
				if (res.data.success) {
					setFile(null);
					setSuccess(true);
				}
			})
			.catch((err) => {
				console.log(err);
			});
	}

	return (
		<div className="App">
			<h1>Add Candidates to the Database</h1>
			{/* File upload */}
			<input
				className="file-input"
				onChange={handleFileUpload}
				disabled={success}
				type="file"
			/>
			{
				// If file is present, show Submit button
				// <h2>{  file.name }</h2>
				file && (
					<>
						<p className="file-name"> {file.name} </p>
						<button
							className="submit-button"
							onClick={handleFileSubmit}
						>
							Submit
						</button>
					</>
				)
			}

			{success && (
				<div className="success">
					<p className="success-message">ThankYou!</p>
					<p>
						<span className="check-mark">
							{/* checkmark green */}
							&#10004;
						</span>
						File Uploaded Successfully.
					</p>
					<p> Your Records will be updated shortly.</p>
				</div>
			)}
		</div>
	);
}

export default App;
