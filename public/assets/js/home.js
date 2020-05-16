if (sessionStorage.getItem("token") == null)
	window.location.href = "/";


let dropzone = document.getElementById('dropzone');

let toUploadGridDiv = document.getElementById('toUploadGridDiv');
let toUploadGrid = document.getElementById('toUploadGrid');

let S3ImagesGridDiv = document.getElementById('S3ImagesGridDiv');
let S3ImagesGrid = document.getElementById('S3ImagesGrid');

let uploadBtn = document.getElementById('uploadBtn');
let message = document.getElementById("message");


let imagesToUpload = [];
let imagesFromS3 = [];

let readyToUpload = false;
let index;

const lightbox = document.createElement('div');
lightbox.id = 'lightbox';
document.body.appendChild(lightbox);

(function () {
	let xhr = new XMLHttpRequest();
	xhr.open("GET", '/getMyImages');
	xhr.setRequestHeader("token", window.sessionStorage.getItem("token"));
	xhr.onload = () => {
		if (xhr.status == 200) {
			let img;
			let count = 0;
			for (let url of JSON.parse(xhr.response).urls) {
				img = document.createElement("img");
				img.src = url[1];
				img.id = count;
				img.setAttribute('data-toggle', "modal");
				img.setAttribute('data-target', "#modelId");
				img.onclick = (event) => {
					index = event.target.id;
					document.getElementById("modalTitle").innerText = imagesFromS3[index].replace(window.sessionStorage.getItem("token") + "-", "");

				};
				S3ImagesGrid.appendChild(img);
				imagesFromS3.push(url[0]);
				count++;
			}
		}
		else {
			message.removeAttribute("hidden");
			S3ImagesGridDiv.setAttribute("hidden", "");
		}
	}
	xhr.send();
})();



function upload(files) {
	for (const file of files) {
		let reader = new FileReader();
		if (!file.type.includes('image'))
			continue;
		reader.onload = function (e) {
			imagesToUpload.push({ name: file.name, base64: e.target.result });
			const image = document.createElement('img');
			image.src = e.target.result;

			toUploadGrid.appendChild(image);
		};
		reader.readAsDataURL(file);
	}

	toUploadGridDiv.removeAttribute("hidden");
	dropzone.setAttribute("hidden", "");
}

dropzone.ondrop = function (e) {
	e.preventDefault();
	this.className = 'dropzone';
	upload(e.dataTransfer.files);
};

dropzone.ondragover = function () {
	this.className = 'dropzone dragover';
	return false;
};

dropzone.ondragleave = function () {
	this.className = 'dropzone';
	return false;
};

function makeRequest(method, url, body) {
	return new Promise(function (resolve, reject) {
		var xhr = new XMLHttpRequest();
		xhr.open(method, url);
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.setRequestHeader("token", window.sessionStorage.getItem('token'));
		xhr.onload = function () {
			if (this.status == 200) {
				resolve(xhr.response);
			} else {
				reject({
					status: this.status,
					statusText: xhr.statusText
				});
			}
		};
		xhr.onerror = function () {
			reject({
				status: this.status,
				statusText: xhr.statusText
			});
		};
		xhr.send(JSON.stringify(body));
	});
}

let uploadImagesToS3 = async function () {

	if (readyToUpload) {
		if (imagesToUpload.length > 0) {
			for (const imageToUpload of imagesToUpload) {
				const body = {
					base64: imageToUpload.base64,
					key: imageToUpload.name
				};
				let res = await makeRequest('POST', '/s3/post', body)
				// console.log("res: " + res);
			}
			// console.log("Ready to save metadata");

			xhr = new XMLHttpRequest();
			xhr.open('POST', '/images/saved');
			xhr.setRequestHeader("token", window.sessionStorage.getItem('token'));
			xhr.onload = () => {
				if (xhr.status == 200)
					alert("Upload complete");
				else if (xhr.status == 201)
					alert("Nothing to upload");
				else if (xhr.status == 400)
					alert("No items found");
				else if (xhr.status == 402)
					alert(xhr.responseText);
				else
					alert("Unknown error");
				window.location.reload();
			}
			xhr.send();
			cancel();
			// imagesFromS3.push(imagesToUpload);
			// imagesFromS3 = imagesFromS3.flat(Infinity);
			// showS3Images();
		}
	}
	else {
		uploadBtn.innerText = "Upload now";
		uploadBtn.classList.remove("btn-primary");
		uploadBtn.classList.add("btn-success");
		readyToUpload = true;
		dropzone.removeAttribute("hidden");
	}
};

function cancel() {
	toUploadGrid.textContent = '';
	toUploadGridDiv.setAttribute("hidden", "");
	imagesToUpload = [];
	clear();
}

function clear() {
	uploadBtn.innerText = "Upload images";
	uploadBtn.classList.add("btn-primary");
	uploadBtn.classList.remove("btn-success");
	dropzone.setAttribute("hidden", "");
	readyToUpload = false;
}

function clearData() {
	document.getElementsByClassName("modal-body")[0].innerHTML = "";
}

function faceAnalysis() {
	if (index < imagesFromS3.length) {
		let xhr = new XMLHttpRequest();
		xhr.open('POST', "/rek/analysis");
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.onload = () => {
			if (xhr.status == 200) {
				let modalBody = document.getElementsByClassName("modal-body")[0];
				modalBody.innerHTML = "";
				let result = JSON.parse(xhr.response);
				for (let key of Object.keys(result)){
					let newRow = document.createElement("div");
					newRow.classList.add("container-fluid");
					newRow.innerText = key + ": " + result[key];
					modalBody.appendChild(newRow);
				}
			}
			else if (xhr.status == 401)
				alert("Hey, there are no faces in the pic");
			else
				alert("Just a person per pic, please");
		};
		xhr.send(JSON.stringify({ key: imagesFromS3[index] }));
	}
	else
		console.log("Failed to load keys");
};

document.getElementById("logout").onclick = () => {
	window.sessionStorage.removeItem("token");
}