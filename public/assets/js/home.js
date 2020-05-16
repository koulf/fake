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
			for (let url of JSON.parse(xhr.response).urls) {
				img = document.createElement("img");
				img.src = url;
				S3ImagesGrid.appendChild(img);
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

	// toUploadGridDiv.className = toUploadGridDiv.className.replace(
	// 	'inactive',
	// 	''
	// );
	// dropzone.className += ' inactive';
	// uploadBtn.className = uploadBtn.className.replace('inactive', '');
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
				console.log("res: " + res);
			}

			console.log("Ready to save metadata");

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

let showS3Images = function () {
	if (imagesFromS3.length > 0) {
		S3ImagesGridDiv.className = S3ImagesGridDiv.className.replace(
			'inactive',
			''
		);
		S3ImagesGrid.innerHTML = '';
		for (const file of imagesFromS3) {
			const image = document.createElement('img');
			image.src = file.base64;
			S3ImagesGrid.appendChild(image);
		}
		const allImages = document.querySelectorAll('img');
		allImages.forEach(async (image, index) => {
			image.addEventListener('click', async e => {
				lightbox.classList.add('active');
				const img = document.createElement('img');
				const par0 = document.createElement('h3');

				img.src = image.src;
				while (lightbox.firstChild) {
					lightbox.removeChild(lightbox.firstChild);
				}
				const info = await (
					await fetch('/rek/analysis', {
						method: 'POST', // or 'PUT'
						body: JSON.stringify({ key: imagesFromS3[index - 1].name }), // data can be `string` or {object}!
						headers: {
							'Content-Type': 'application/json'
						}
					})
				).json();

				par0.innerHTML = `${info.Gender.Value} ${info.AgeRange.Low}-${info.AgeRange.High} years old.`;
				par0.classList.add('text-light');
				lightbox.appendChild(img);
				lightbox.appendChild(par0);

			});
		});

		lightbox.addEventListener('click', e => {
			if (e.target !== e.currentTarget) return;
			lightbox.classList.remove('active');
		});
	}
};

document.getElementById("logout").onclick = () => {
	window.sessionStorage.removeItem("token");
}