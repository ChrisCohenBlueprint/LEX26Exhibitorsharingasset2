(function() {
    const canvas = document.getElementById('editor-canvas');
    const ctx = canvas.getContext('2d');
    const fileInput = document.getElementById('file-input');
    const zoomSlider = document.getElementById('zoom-slider');
    
    // Text Inputs
    const nameInput = document.getElementById('name-input');
    const companyInput = document.getElementById('company-input');
    
    const downloadBtn = document.getElementById('download-btn');
    const linkedinBtn = document.getElementById('linkedin-btn');
    const emailBtn = document.getElementById('email-btn');
    const resetBtn = document.getElementById('reset-btn');
    const placeholder = document.getElementById('placeholder');

    const FRAME_PATH = 'frame.png'; 

    let frameImage = new Image();
    let userImage = null, userImgX = 0, userImgY = 0, userImgScale = 1;
    let isDragging = false, startX, startY;

    // Portrait Resolution
    canvas.width = 800; 
    canvas.height = 1000;

    frameImage.crossOrigin = "anonymous";
    frameImage.src = FRAME_PATH;
    frameImage.onload = () => render();

    // Re-render instantly as users type details
    nameInput.oninput = () => render();
    companyInput.oninput = () => render();

    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 1. Base clear canvas background
        ctx.fillStyle = "#ffffff"; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 2. Render Avatar Photo Underneath Frame Window Hole
        if (userImage) {
            ctx.save();
            
            // Adjusted viewport coordinates for vertical template circular hole
            const circleX = 400; // Center horizontally
            const circleY = 620; // Lower placement center
            const radius = 265;  // Frame viewport match radius
            
            ctx.beginPath(); 
            ctx.arc(circleX, circleY, radius, 0, Math.PI * 2); 
            ctx.clip();
            
            const dw = userImage.width * userImgScale;
            const dh = userImage.height * userImgScale;
            
            ctx.drawImage(userImage, circleX + userImgX - dw / 2, circleY + userImgY - dh / 2, dw, dh);
            ctx.restore();
        }

        // 3. Render Overlay Frame Template
        if (frameImage.complete && frameImage.naturalWidth !== 0) {
            ctx.drawImage(frameImage, 0, 0, canvas.width, canvas.height);
        }

        // 4. Draw Custom Inline Strings Dynamic Layout
        const regularText = nameInput.value.trim() ? nameInput.value : "Your Name, Title, ";
        const boldText = companyInput.value.trim() ? companyInput.value : "Company Name";

        const fontSize = "24px";
        const fontName = "CustomSpeakerFont, 'Inter', sans-serif";

        ctx.font = `300 ${fontSize} ${fontName}`;
        const regularWidth = ctx.measureText(regularText).width;

        ctx.font = `700 ${fontSize} ${fontName}`;
        const boldWidth = ctx.measureText(boldText).width;

        const totalWidth = regularWidth + boldWidth;
        
        let currentX = (canvas.width - totalWidth) / 2;
        const textBaselineY = 910; 

        // Render part 1: Light string segment
        ctx.fillStyle = "#ffffff";
        ctx.font = `300 ${fontSize} ${fontName}`;
        ctx.textBaseline = "middle";
        ctx.textAlign = "left";
        ctx.fillText(regularText, currentX, textBaselineY);

        // Render part 2: Bold inline text segment beside it
        currentX += regularWidth;
        ctx.font = `700 ${fontSize} ${fontName}`;
        ctx.fillText(boldText, currentX, textBaselineY);
    }

    // Input handlers
    document.getElementById('drop-zone').onclick = (e) => {
        if(e.target.tagName !== 'INPUT') fileInput.click();
    };

    fileInput.onchange = (e) => {
        if (!e.target.files[0]) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
                userImage = img;
                userImgScale = 530 / Math.min(img.width, img.height);
                zoomSlider.value = userImgScale;
                userImgX = 0; 
                userImgY = 0;
                
                placeholder.style.setProperty('display', 'none', 'important');
                [zoomSlider, downloadBtn, linkedinBtn, emailBtn].forEach(b => b.disabled = false);
                render();
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(e.target.files[0]);
    };

    // Tracking Interactions
    canvas.onmousedown = (e) => {
        if (!userImage) return; 
        isDragging = true;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        startX = (e.clientX - rect.left) * scaleX - userImgX;
        startY = (e.clientY - rect.top) * scaleY - userImgY;
    };

    window.onmousemove = (e) => {
        if (!isDragging) return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        userImgX = (e.clientX - rect.left) * scaleX - startX;
        userImgY = (e.clientY - rect.top) * scaleY - startY;
        render();
    };

    window.onmouseup = () => isDragging = false;
    zoomSlider.oninput = (e) => { userImgScale = parseFloat(e.target.value); render(); };

    downloadBtn.onclick = (e) => {
        e.stopPropagation();
        const link = document.createElement('a');
        link.download = 'lex26-speaker-badge.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    };
    
    linkedinBtn.onclick = (e) => { 
        e.stopPropagation();
        downloadBtn.click(); 
        window.open('https://www.linkedin.com/feed/?shareActive=true', '_blank'); 
    };
    
    emailBtn.onclick = (e) => { 
        e.stopPropagation();
        downloadBtn.click(); 
        window.location.href = `mailto:?subject=I'm speaking at Lubricant Expo Europe 2026!`; 
    };
    
    resetBtn.onclick = (e) => { e.stopPropagation(); location.reload(); };
})();
