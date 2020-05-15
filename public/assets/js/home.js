let dropzone = document.getElementById('dropzone');
let toUploadGridDiv = document.getElementById('toUploadGridDiv');
let toUploadGrid = document.getElementById('toUploadGrid');
let S3ImagesGridDiv = document.getElementById('S3ImagesGridDiv');
let S3ImagesGrid = document.getElementById('S3ImagesGrid');
let uploadBtn = document.getElementById('uploadBtn');
let imagesToUpload = [];
let imagesFromS3 = [];

const lightbox = document.createElement('div');
lightbox.id = 'lightbox';
document.body.appendChild(lightbox);

document.getElementsByTagName("body")[0].onload = () => {
	if (sessionStorage.getItem("token") == null)
		window.location.href = "/";
}

(function () {
	let upload = function (files) {
		for (const file of files) {
			if (!file.type.includes('image')) continue;
			let reader = new FileReader();
			reader.onload = function (e) {
				imagesToUpload.push({ name: file.name, base64: e.target.result });
				const image = document.createElement('img');
				image.src = e.target.result;

				toUploadGrid.appendChild(image);
			};

			reader.readAsDataURL(file);
		}

		toUploadGridDiv.className = toUploadGridDiv.className.replace(
			'inactive',
			''
		);
		dropzone.className += ' inactive';
		uploadBtn.className = uploadBtn.className.replace('inactive', '');
	};

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
})();

let uploadImagesToS3 = async function () {
	toUploadGridDiv.className += 'inactive';
	toUploadGrid.innerHTML = '';
	dropzone.className = dropzone.className.replace('inactive', '');
	uploadBtn.className += ' inactive';
	console.log(imagesToUpload);
	if (imagesToUpload.length > 0) {
		// Upload to database
		for (const imageToUpload of imagesToUpload) {
			let xhr = new XMLHttpRequest();
			xhr.open('POST', '/s3/post');
			xhr.setRequestHeader('Content-Type', 'application/json');
			const body = {
				base64: imageToUpload.base64,
				key: imageToUpload.name
			};

			xhr.send(JSON.stringify(body));
		}

		imagesFromS3.push(imagesToUpload);
		imagesFromS3 = imagesFromS3.flat(Infinity);
		imagesToUpload = [];
		showS3Images();
	}
};

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