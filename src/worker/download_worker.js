onmessage = async (e) => {
	const { canvas, pageHeight, pageWidth, pageIndex } = e.data;
	const off = new OffscreenCanvas(pageWidth, pageHeight);
	const ctx = off.getContext("2d");

	// draw the part of the main canvas for this page
	ctx.drawImage(canvas, 0, pageIndex * pageHeight, pageWidth, pageHeight, 0, 0, pageWidth, pageHeight);
	// convert cropped page into a Blob
	const blob = await canvas.convertToBlob({ type: "image/png" });

	const reader = new FileReader();

	reader.onload = () => {
		postMessage({ dataUrl: reader.result });
	};
	reader.readAsDataURL(blob);
};
