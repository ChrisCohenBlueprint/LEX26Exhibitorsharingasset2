(function() {
    const canvas = document.getElementById('editor-canvas');
    const ctx = canvas.getContext('2d');
    const fileInput = document.getElementById('file-input');
    const zoomSlider = document.getElementById('zoom-slider');
    
    // Text Inputs
    const boothInput = document.getElementById('booth-input');
    
    const downloadBtn = document.getElementById('download-btn');
    const linkedinBtn = document.getElementById('linkedin-btn');
    const emailBtn = document.getElementById('email-btn');
    const resetBtn = document.getElementById('reset-btn');
    const placeholder = document.getElementById('placeholder');

    // Modal UI Elements
    const customModal = document.getElementById('custom-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    const FRAME_PATH = 'frame.png'; 

    let frameImage = new Image();
    let userImage = null, userImgX = 0, userImgY = 0, userImgScale = 1;
    let isDragging = false, startX, startY;

    // Landscape Canvas Resolution standard
    canvas.width = 1024; 
    canvas.height = 535;

    frameImage.crossOrigin = "anonymous";
    frameImage.src = FRAME_PATH;
    frameImage.onload = () => render();

    boothInput.oninput = () => render();

    function render() {
        // ALWAYS start the frame layout with a fresh structural state reset
        ctx.restore(); 
        ctx.save();
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 1. Draw Clean Canvas White Underlay Base
        ctx.fillStyle = "#ffffff"; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 2. Render Overlay Frame Template BEFORE User Image
        if (frameImage.complete && frameImage.naturalWidth !== 0) {
            ctx.drawImage(frameImage, 0, 0, canvas.width, canvas.height);
        }

        // 3. Render User Image Logo (free floating)
        if (userImage) {
            ctx.save();
            const dw = userImage.width * userImgScale;
            const dh = userImage.height * userImgScale;
            
            // Default center around the white area on the right (approx X:750, Y:250)
            const imgCenterX = 750 + userImgX;
            const imgCenterY = 250 + userImgY;
            
            ctx.drawImage(userImage, imgCenterX - dw / 2, imgCenterY - dh / 2, dw, dh);
            ctx.restore();
        }

        // 4. Render Stand Number Text
        const boothText = boothInput.value.trim() ? boothInput.value : "";
        if (boothText) {
            const fontSize = "34px";
            const fontName = "'NeueHaasGrotesk', 'Inter', sans-serif";
            
            const textCenterX = 702;
            const textBaselineY = 440; 

            ctx.fillStyle = "#162842"; // Dark blue text color
            ctx.font = `800 ${fontSize} ${fontName}`;
            ctx.textBaseline = "middle";
            ctx.textAlign = "center";
            ctx.fillText(boothText, textCenterX, textBaselineY);
        }
    }

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
                userImgScale = 280 / Math.max(img.width, img.height);
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
        link.download = 'lex26-exhibitor-badge.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    };
    
    linkedinBtn.onclick = (e) => { 
        e.stopPropagation();
        downloadBtn.click(); 
        
        const shareText = `We are so excited to exhibit at #lubricantexpoeurope 2026 - taking place September 15 - 17 \n\nRegister for free here: https://register.visitcloud.com/survey/3dkj7ikw2zeed?actioncode=000096DOC \n\n5000+ Attendees\n320+ Exhibitors\n100+ Speakers\nAll brought to you over 3 days at Lubricant Expo Europe, Düsseldorf, Germany\n\nSee you there!`;
        
        navigator.clipboard.writeText(shareText).then(() => {
            customModal.classList.add('active');
        }).catch(err => {
            window.open('https://www.linkedin.com/feed/?shareActive=true', '_blank'); 
        });
    };

    modalCloseBtn.onclick = () => {
        customModal.classList.remove('active');
        window.open('https://www.linkedin.com/feed/?shareActive=true', '_blank'); 
    };
    
    emailBtn.onclick = (e) => { 
        e.stopPropagation();
        downloadBtn.click(); 
        
        const emailBody = `We are so excited to exhibit at #lubricantexpoeurope 2026 - taking place September 15 - 17 \n\nRegister for free here: https://register.visitcloud.com/survey/3dkj7ikw2zeed?actioncode=000096DOC \n\n5000+ Attendees\n320+ Exhibitors\n100+ Speakers\nAll brought to you over 3 days at Lubricant Expo Europe, Düsseldorf, Germany\n\nSee you there!`;
        window.location.href = `mailto:?subject=We are exhibiting at Lubricant Expo Europe 2026!&body=${encodeURIComponent(emailBody)}`; 
    };
    
    resetBtn.onclick = (e) => { e.stopPropagation(); location.reload(); };
})();
