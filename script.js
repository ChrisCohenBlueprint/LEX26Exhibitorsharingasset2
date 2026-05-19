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

    // Modal UI Elements
    const customModal = document.getElementById('custom-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    const FRAME_PATH = 'frame.png'; 

    let frameImage = new Image();
    let userImage = null, userImgX = 0, userImgY = 0, userImgScale = 1;
    let isDragging = false, startX, startY;

    // Portrait HD Canvas Resolution standard
    canvas.width = 800; 
    canvas.height = 1000;

    frameImage.crossOrigin = "anonymous";
    frameImage.src = FRAME_PATH;
    frameImage.onload = () => render();

    nameInput.oninput = () => render();
    companyInput.oninput = () => render();

    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 1. Draw Clean Canvas White Underlay Base
        ctx.fillStyle = "#ffffff"; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 2. Map Profile Avatar Masking Window Hole
        if (userImage) {
            ctx.save();
            
            const circleX = 400; 
            const circleY = 620; 
            const radius = 265;  
            
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

        // 4. Render Dynamic Inline Bottom Line Strings with Auto-Spacing
        let regularText = nameInput.value.trim() ? nameInput.value : "Your Name, Title, ";
        const boldText = companyInput.value.trim() ? companyInput.value : "Company Name";

        // CRITICAL UX FIX: If the regular text has content and does NOT end with a space, 
        // automatically append a space so it never squishes into the bold company name.
        if (regularText.length > 0 && !regularText.endsWith(' ')) {
            regularText = regularText + ' ';
        }

        const fontSize = "24px";
        const fontName = "'NeueHaasGrotesk', 'Inter', sans-serif";

        // Light Text Fragment (Weight 300)
        ctx.font = `300 ${fontSize} ${fontName}`;
        const regularWidth = ctx.measureText(regularText).width;

        // Medium Text Fragment (Weight 500)
        ctx.font = `500 ${fontSize} ${fontName}`;
        const boldWidth = ctx.measureText(boldText).width;

        const totalWidth = regularWidth + boldWidth;
        
        let currentX = (canvas.width - totalWidth) / 2;
        const textBaselineY = 910; 

        ctx.fillStyle = "#ffffff";
        ctx.font = `300 ${fontSize} ${fontName}`;
        ctx.textBaseline = "middle";
        ctx.textAlign = "left";
        ctx.fillText(regularText, currentX, textBaselineY);

        currentX += regularWidth;
        ctx.font = `500 ${fontSize} ${fontName}`;
        ctx.fillText(boldText, currentX, textBaselineY);
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

    canvas.onmousedown = (e) => {
        if (!userImage) return; 
        isDragging = true;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        startX = (e.clientX - rect.left) * scaleX - userImgX;
        startY = (e.clientY - rect.top) * scaleY - startY;
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
        
        const shareText = `So excited for #lubricantexpoeurope 2026 - taking place September 15 - 17 \n\nRegister for free here: https://register.visitcloud.com/survey/3dkj7ikw2zeed?actioncode=000096DOC \n\n5000+ Attendees\n320+ Exhibitors\n100+ Speakers\nAll brought to you over 3 days at Lubricant Expo Europe, Düsseldorf, Germany\n\nSee you there!`;
        
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
        
        const emailBody = `So excited for #lubricantexpoeurope 2026 - taking place September 15 - 17 \n\nRegister for free here: https://register.visitcloud.com/survey/3dkj7ikw2zeed?actioncode=000096DOC \n\n5000+ Attendees\n320+ Exhibitors\n100+ Speakers\nAll brought to you over 3 days at Lubricant Expo Europe, Düsseldorf, Germany\n\nSee you there!`;
        window.location.href = `mailto:?subject=I'm speaking at Lubricant Expo Europe 2026!&body=${encodeURIComponent(emailBody)}`; 
    };
    
    resetBtn.onclick = (e) => { e.stopPropagation(); location.reload(); };
})();
