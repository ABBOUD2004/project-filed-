const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';
const MATCH_THRESHOLD = 0.55;
const DETECTION_INTERVAL = 250; 

// State variables
let smoothedAge = 0;
let smoothedGender = { male: 0, female: 0 };
let smoothedEmotions = { happy:0, sad:0, angry:0, fearful:0, disgusted:0, surprised:0, neutral:0 };
const smoothFactor = 0.15;
let faceMatcher = null;
let currentStream = null;
let detectionInterval = null;
let isDetecting = false;
let tempFaceDescriptors = [];
let tempPhotoData = null;
let lastAlertTimes = {};
let isMultiCam = false;
let currentFilter = 'normal';
let totalScans = 0;
let criminalsFoundCount = 0;
let safeScansCount = 0;
let threatAlertCount = 0;
let emotionAccumulator = { happy:0, sad:0, angry:0, fearful:0, surprised:0, disgusted:0, neutral:0, count:0 };
let objectsAccumulator = {};

// Database variables
const DB_NAME = 'CriminalDetectionDB';
const DB_VERSION = 2;
const STORE_NAME = 'criminals';
let db;

// DOM Elements
const systemStatusDot = document.getElementById('systemStatusDot');
const systemStatusText = document.getElementById('systemStatusText');
const aiModelsCount = document.getElementById('aiModelsCount');
const faceCount = document.getElementById('faceCount');
const dbCount = document.getElementById('dbCount');
const currentTime = document.getElementById('currentTime');

const navTabs = document.querySelectorAll('.nav-btn[data-tab]');
const scanTab = document.getElementById('scanTab');
const databaseTab = document.getElementById('databaseTab');
const logTab = document.getElementById('logTab');
const analyticsTab = document.getElementById('analyticsTab');
const roboticsTab = document.getElementById('roboticsTab');

const video = document.getElementById('video');
const overlay = document.getElementById('overlay');
const poseCanvas = document.getElementById('poseCanvas');
const scanLine = document.getElementById('scanLine');
const cameraPlaceholder = document.getElementById('cameraPlaceholder');
const cameraInfo = document.getElementById('cameraInfo');
const liveBadge = document.getElementById('liveBadge');
const startCameraBtn = document.getElementById('startCameraBtn');
const stopCameraBtn = document.getElementById('stopCameraBtn');
const multiCamToggle = document.getElementById('multiCamToggle');
const voiceToggle = document.getElementById('voiceToggle');
const cameraViewport = document.getElementById('cameraViewport');
const filterBtns = document.querySelectorAll('.filter-btn');

const multiCamGrid = document.getElementById('multiCamGrid');
const cameraContainer = document.getElementById('cameraContainer');
const cam1Video = document.getElementById('cam1Video');
const cam2Video = document.getElementById('cam2Video');
const cam3Video = document.getElementById('cam3Video');
const cam4Video = document.getElementById('cam4Video');

const detectionResult = document.getElementById('detectionResult');
const threatBar = document.getElementById('threatBar');
const threatValue = document.getElementById('threatValue');
const threatStatusText = document.getElementById('threatStatusText');

const panelTabs = document.querySelectorAll('.panel-tab[data-panel]');
const identityPanel = document.getElementById('identityPanel');
const aiAnalysisPanel = document.getElementById('aiAnalysisPanel');
const objectsPanel = document.getElementById('objectsPanel');

const emoHappy = document.getElementById('emoHappy');
const emoSad = document.getElementById('emoSad');
const emoAngry = document.getElementById('emoAngry');
const emoFearful = document.getElementById('emoFearful');
const emoSurprised = document.getElementById('emoSurprised');
const emoDisgusted = document.getElementById('emoDisgusted');
const emoNeutral = document.getElementById('emoNeutral');

const emoHappyPct = document.getElementById('emoHappyPct');
const emoSadPct = document.getElementById('emoSadPct');
const emoAngryPct = document.getElementById('emoAngryPct');
const emoFearfulPct = document.getElementById('emoFearfulPct');
const emoSurprisedPct = document.getElementById('emoSurprisedPct');
const emoDisgustedPct = document.getElementById('emoDisgustedPct');
const emoNeutralPct = document.getElementById('emoNeutralPct');

const genderValue = document.getElementById('genderValue');
const ageValue = document.getElementById('ageValue');

const poseIcon = document.getElementById('poseIcon');
const poseText = document.getElementById('poseText');
const poseConfidence = document.getElementById('poseConfidence');
const objectsList = document.getElementById('objectsList');

const addCriminalBtn = document.getElementById('addCriminalBtn');
const searchInput = document.getElementById('searchInput');
const criminalsList = document.getElementById('criminalsList');

const logTableBody = document.getElementById('logTableBody');
const logCount = document.getElementById('logCount');
const clearLogBtn = document.getElementById('clearLogBtn');

const addCriminalModal = document.getElementById('addCriminalModal');
const modalTitle = document.getElementById('modalTitle');
const closeModalBtn = document.getElementById('closeModalBtn');
const criminalForm = document.getElementById('criminalForm');
const editCriminalId = document.getElementById('editCriminalId');
const photoPreview = document.getElementById('photoPreview');
const capturePhotoBtn = document.getElementById('capturePhotoBtn');
const uploadPhotoInput = document.getElementById('uploadPhotoInput');
const cancelFormBtn = document.getElementById('cancelFormBtn');
const criminalName = document.getElementById('criminalName');
const criminalIdNumber = document.getElementById('criminalIdNum');
const criminalDanger = document.getElementById('criminalDanger');
const criminalCrimes = document.getElementById('criminalCharges');
const criminalNotes = document.getElementById('criminalNotes');
const criminalLat = document.getElementById('criminalLat');
const criminalLng = document.getElementById('criminalLng');

const loadingOverlay = document.getElementById('loadingOverlay');
const loadingStatus = document.getElementById('loadingStatus');
const loadingBar = document.getElementById('loadingBar');
const alertOverlay = document.getElementById('alertOverlay');

const modelElements = {
    faceDetect: document.getElementById('modelFaceDetect'),
    faceLandmark: document.getElementById('modelFaceLandmark'),
    faceRecog: document.getElementById('modelFaceRecog'),
    emotion: document.getElementById('modelEmotion'),
    ageGender: document.getElementById('modelAgeGender'),
    objectDetect: document.getElementById('modelObjectDetect')
};

// Utilities
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

const dangerTextMap = { 'high': 'شديد الخطورة', 'medium': 'متوسط الخطورة', 'low': 'منخفض الخطورة' };
const dangerColorMap = { 'high': '#ef4444', 'medium': '#f59e0b', 'low': '#3b82f6' };
const statusTextMap = { 'active': 'مطلوب حالياً', 'captured': 'تم القبض عليه', 'cleared': 'تمت تبرئته' };

function playAlertSound() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); 
    oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.5);
}

function startClock() {
    setInterval(() => {
        if(currentTime) currentTime.textContent = new Date().toLocaleTimeString('ar-SA');
    }, 1000);
}

// Database Init
function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = (event) => {
            db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };
        request.onsuccess = (event) => {
            db = event.target.result;
            updateDBCount();
            loadCriminalsList();
            resolve();
        };
        request.onerror = (event) => reject(event.target.error);
    });
}

function getStore(mode) {
    return db.transaction(STORE_NAME, mode).objectStore(STORE_NAME);
}

async function getAllCriminals() {
    return new Promise((resolve, reject) => {
        const request = getStore('readonly').getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function getCriminal(id) {
    return new Promise((resolve, reject) => {
        const request = getStore('readonly').get(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function updateDBCount() {
    if(!dbCount) return;
    const countRequest = getStore('readonly').count();
    countRequest.onsuccess = () => { dbCount.textContent = countRequest.result; };
}

async function rebuildFaceMatcher() {
    try {
        const criminals = await getAllCriminals();
        const labeledDescriptors = [];
        
        for (const criminal of criminals) {
            if (criminal.faceDescriptor && criminal.status === 'active') {
                const descriptorArray = new Float32Array(Object.values(criminal.faceDescriptor));
                labeledDescriptors.push(new faceapi.LabeledFaceDescriptors(criminal.id, [descriptorArray]));
            }
        }
        
        if (labeledDescriptors.length > 0) {
            faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, AI_MATCH_THRESHOLD);
            console.log(`FaceMatcher rebuilt with ${labeledDescriptors.length} active profiles.`);
        } else {
            faceMatcher = null;
        }
    } catch (err) {
        console.error("Error rebuilding face matcher:", err);
    }
}

// Models Loading
async function loadAllModels() {
    let loaded = 0;
    const total = 6;
    const updateProgress = (name, modelEl) => {
        loaded++;
        if(loadingBar) loadingBar.style.width = Math.round((loaded/total)*100) + '%';
        if(aiModelsCount) aiModelsCount.textContent = loaded + '/' + total;
        if(loadingStatus) loadingStatus.textContent = 'تم تحميل: ' + name;
        if (modelEl) modelEl.classList.add('loaded');
    };
    
    try {
        await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
        updateProgress('كشف الوجه', modelElements.faceDetect);
        
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        updateProgress('معالم الوجه', modelElements.faceLandmark);
        
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        updateProgress('التعرف على الوجه', modelElements.faceRecog);
        
        await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
        updateProgress('تحليل المشاعر', modelElements.emotion);
        
        await faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL);
        updateProgress('العمر والجنس', modelElements.ageGender);
        
        try {
            await window.initObjectDetection();
            updateProgress('كشف الأشياء', modelElements.objectDetect);
        } catch(e) {
            console.warn('COCO-SSD failed to load:', e);
            loaded++;
            if(loadingBar) loadingBar.style.width = Math.round((loaded/total)*100) + '%';
        }
    } catch(err) {
        throw new Error('فشل تحميل نماذج الذكاء الاصطناعي: ' + err.message);
    }
}

// Camera control
async function startCamera() {
    try {
        currentStream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" }
        });
        
        video.srcObject = currentStream;
        
        if (cam1Video) cam1Video.srcObject = currentStream;
        if (cam2Video) cam2Video.srcObject = currentStream;
        if (cam3Video) cam3Video.srcObject = currentStream;
        if (cam4Video) cam4Video.srcObject = currentStream;
        
        startCameraBtn.disabled = true;
        stopCameraBtn.disabled = false;
        liveBadge.style.display = 'flex';
        cameraPlaceholder.style.display = 'none';
        cameraViewport.classList.add('scanning');
        scanLine.style.display = 'block';
        
    } catch (err) {
        console.error("Error accessing camera:", err);
        alert("فشل في الوصول إلى الكاميرا. يرجى التحقق من الصلاحيات.");
    }
}

function stopCamera() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
        currentStream = null;
    }
    if (detectionInterval) {
        clearInterval(detectionInterval);
        detectionInterval = null;
    }
    
    video.srcObject = null;
    if (cam1Video) cam1Video.srcObject = null;
    if (cam2Video) cam2Video.srcObject = null;
    if (cam3Video) cam3Video.srcObject = null;
    if (cam4Video) cam4Video.srcObject = null;
    
    startCameraBtn.disabled = false;
    stopCameraBtn.disabled = true;
    liveBadge.style.display = 'none';
    cameraPlaceholder.style.display = 'flex';
    cameraViewport.classList.remove('scanning');
    scanLine.style.display = 'none';
    
    const ctx = overlay.getContext('2d');
    ctx.clearRect(0, 0, overlay.width, overlay.height);
    const poseCtx = poseCanvas.getContext('2d');
    poseCtx.clearRect(0, 0, poseCanvas.width, poseCanvas.height);
    
    showWaitingResult();
}

video.addEventListener('play', () => {
    overlay.width = video.videoWidth;
    overlay.height = video.videoHeight;
    poseCanvas.width = video.videoWidth;
    poseCanvas.height = video.videoHeight;
    
    if (detectionInterval) clearInterval(detectionInterval);
    detectionInterval = setInterval(runDetection, DETECTION_INTERVAL);
});

// Detection Loop
async function runDetection() {
    if (!video.videoWidth || isDetecting) return;
    isDetecting = true;
    
    try {
        const displaySize = { width: video.videoWidth, height: video.videoHeight };
        
        // 1. Face detection
        const detections = await faceapi.detectAllFaces(video, getFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceDescriptors()
            .withFaceExpressions()
            .withAgeAndGender();
        
        const resized = faceapi.resizeResults(detections, displaySize);
        const ctx = overlay.getContext('2d');
        ctx.clearRect(0, 0, overlay.width, overlay.height);
        if(faceCount) faceCount.textContent = resized.length;
        totalScans++;
        
        // 2. Object detection (every 3rd frame)
        let objectPredictions = [];
        if (totalScans % 3 === 0 && window.detectObjects) {
            objectPredictions = await window.detectObjects(video);
            const drawnObjects = window.drawObjectBoxes(objectPredictions, ctx, overlay.width, overlay.height);
            renderObjectsList(drawnObjects);
            drawnObjects.forEach(obj => {
                objectsAccumulator[obj.class] = (objectsAccumulator[obj.class] || 0) + 1;
            });
        }
        
        // 3. Pose detection (every 4th frame)
        let poseResult = null;
        let postureInfo = { posture: 'غير محدد', icon: '', confidence: 0 };
        if (totalScans % 4 === 0 && window.detectPose) {
            poseResult = await window.detectPose(video);
            if (poseResult) {
                window.drawPose(poseResult, poseCanvas, video.videoWidth, video.videoHeight);
                postureInfo = window.analyzePosePosture(poseResult);
                updatePoseDisplay(postureInfo);
            }
        }
        
        // 4. Process face detections
        let matchedCriminal = null;
        let emotions = null;
        let ageGender = null;
        
        for (const detection of resized) {
            const box = detection.detection.box;
            let isMatch = false;
            let bestMatch = null;
            
            if (faceMatcher) {
                bestMatch = faceMatcher.findBestMatch(detection.descriptor);
                if (bestMatch.label !== 'unknown') {
                    isMatch = true;
                    const pct = Math.round((1 - bestMatch.distance) * 100);
                    if (!matchedCriminal || pct > matchedCriminal.percentage) {
                        matchedCriminal = { id: bestMatch.label, percentage: pct };
                    }
                }
            }
            
            // Apply exponential smoothing for intelligence-grade stability
            const expr = detection.expressions;
            Object.keys(expr).forEach(k => {
                smoothedEmotions[k] = (smoothedEmotions[k] || 0) * (1 - smoothFactor) + expr[k] * smoothFactor;
            });
            const dominantEmotion = Object.entries(smoothedEmotions).reduce((a, b) => b[1] > a[1] ? b : a, ['neutral', 0]);
            
            smoothedAge = smoothedAge === 0 ? detection.age : smoothedAge * (1 - smoothFactor) + detection.age * smoothFactor;
            
            if(detection.gender === 'male') smoothedGender.male += 0.2; else smoothedGender.female += 0.2;
            smoothedGender.male *= 0.9; smoothedGender.female *= 0.9;
            const finalGender = smoothedGender.male > smoothedGender.female ? 'ذكر' : 'أنثى';
            
            let finalAge = Math.round(smoothedAge);
            let finalGenderStr = finalGender;
            
            if (isMatch && bestMatch) {
                // We will let handleMatch update the side panel, but for the label we can just show Matched.
                ctx.fillStyle = 'rgba(239,68,68,0.85)';
            } else {
                ctx.fillStyle = 'rgba(15,26,46,0.85)';
            }
            
            const label = isMatch ? `⚠️ مطابق` : `🕵️ ${finalGenderStr} ~${finalAge}`;
            
            ctx.strokeStyle = isMatch ? '#ef4444' : '#22c55e';
            ctx.lineWidth = 3;
            ctx.strokeRect(box.x, box.y, box.width, box.height);
            
            const labelW = ctx.measureText ? 200 : label.length * 10 + 20;
            ctx.fillRect(box.x, box.y - 28, labelW, 28);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 13px Cairo, sans-serif';
            ctx.fillText(label, box.x + 6, box.y - 8);
            
            if (!emotions) {
                emotions = smoothedEmotions;
                updateEmotionBars(smoothedEmotions);
                emotionAccumulator.count++;
                Object.keys(smoothedEmotions).forEach(e => { emotionAccumulator[e] = (emotionAccumulator[e]||0) + smoothedEmotions[e]; });
            }
            if (!ageGender && !isMatch) {
                ageGender = { age: smoothedAge, gender: finalGender };
                updateAgeGender({age: smoothedAge, gender: finalGender});
            }
        }
        
        // 5. Threat level
        const threatLevel = window.calculateThreatLevel({
            isCriminalDetected: !!matchedCriminal,
            dangerLevel: matchedCriminal ? (await getCriminal(matchedCriminal.id))?.dangerLevel : null,
            emotions: emotions ? { angry: emotions.angry, fearful: emotions.fearful, disgusted: emotions.disgusted } : null,
            posture: postureInfo.posture,
            objects: objectPredictions
        });
        updateThreatMeter(threatLevel);
        
        // 6. Handle results
        if (matchedCriminal) {
            await handleMatch(matchedCriminal.id, matchedCriminal.percentage, emotions);
            criminalsFoundCount++;
        } else if (resized.length > 0) {
            showSafeResult();
            safeScansCount++;
            if(alertOverlay) alertOverlay.classList.remove('active');
        } else {
            showWaitingResult();
            if(alertOverlay) alertOverlay.classList.remove('active');
        }
        
        
        // 7. Behavior alert
        if (!matchedCriminal && threatLevel > 60) {
            threatAlertCount++;
            window.speakAlert('انتباه! سلوك مشبوه مكتشف في المنطقة', false);
            
            // Predictive: Spike global threat and flash random zone
            globalThreatScore = Math.min(100, globalThreatScore + 15);
            if(mapGridCells.length) {
                const randomZone = Math.floor(Math.random() * 16);
                mapGridCells[randomZone].className = 'grid-cell hotspot-high';
                
                const patterns = document.getElementById('patternList');
                if(patterns) {
                    patterns.innerHTML = `<li class="critical">تم رصد سلوك مشبوه (تهديد: ${Math.round(threatLevel)}%) في القطاع ${ZONES[randomZone]}</li>` + patterns.innerHTML;
                    if(patterns.children.length > 4) patterns.lastElementChild.remove();
                }
            }
        }

        
        if (typeof window.updateStatCards === 'function') {
            window.updateStatCards(totalScans, criminalsFoundCount, safeScansCount, threatAlertCount);
        }

    } catch (e) {
        console.error("Detection error:", e);
        if(document.getElementById('loadingStatus')) {
            document.getElementById('loadingStatus').textContent = 'AI Error: ' + e.message;
            document.getElementById('loadingStatus').style.color = 'red';
            document.getElementById('loadingOverlay').classList.remove('hidden');
        }
    } finally {
        isDetecting = false;
    }
}

// UI Updaters
function updateEmotionBars(expressions) {
    if(!emoHappy) return;
    const map = [
        {el: emoHappy, pct: emoHappyPct, val: expressions.happy},
        {el: emoSad, pct: emoSadPct, val: expressions.sad},
        {el: emoAngry, pct: emoAngryPct, val: expressions.angry},
        {el: emoFearful, pct: emoFearfulPct, val: expressions.fearful},
        {el: emoSurprised, pct: emoSurprisedPct, val: expressions.surprised},
        {el: emoDisgusted, pct: emoDisgustedPct, val: expressions.disgusted},
        {el: emoNeutral, pct: emoNeutralPct, val: expressions.neutral}
    ];
    map.forEach(item => {
        item.el.style.width = (item.val * 100) + '%';
        item.pct.textContent = Math.round(item.val * 100) + '%';
    });
}

function updateAgeGender({age, gender}) {
    if(genderValue) genderValue.textContent = gender === 'male' ? ' ذكر' : ' أنثى';
    if(ageValue) ageValue.textContent = '~' + Math.round(age) + ' سنة';
}

function updatePoseDisplay({posture, icon, confidence}) {
    if(poseIcon) poseIcon.textContent = icon;
    if(poseText) poseText.textContent = posture;
    if(poseConfidence) poseConfidence.textContent = Math.round(confidence * 100) + '%';
}

function renderObjectsList(objects) {
    if(!objectsList) return;
    objectsList.innerHTML = objects.map(o => `<div class="object-item"><span class="object-name">${translateObject(o.class)}</span><span class="object-score">${Math.round(o.score*100)}%</span></div>`).join('') || '<p class="no-objects" style="color: #64748b; font-size: 0.9rem;">لم يتم كشف أشياء</p>';
}

function translateObject(name) {
    const d = {
        'person':'شخص', 'car':'سيارة', 'chair':'كرسي', 'bottle':'زجاجة', 'cell phone':'هاتف', 
        'laptop':'حاسوب محمول', 'backpack':'حقيبة ظهر', 'handbag':'حقيبة يد', 'knife':'سكين', 
        'scissors':'مقص', 'cup':'كوب', 'book':'كتاب', 'clock':'ساعة', 'tie':'ربطة عنق', 
        'umbrella':'مظلة', 'suitcase':'حقيبة سفر'
    };
    return d[name] || name;
}

function updateThreatMeter(level) {
    if(!threatBar) return;
    threatBar.style.width = level + '%';
    threatValue.textContent = level;
    if (level < 30) {
        threatStatusText.textContent = 'آمن'; 
        threatStatusText.style.color = '#22c55e'; 
        threatValue.style.color = '#22c55e';
    } else if (level <= 60) {
        threatStatusText.textContent = 'يحتاج مراقبة'; 
        threatStatusText.style.color = '#eab308'; 
        threatValue.style.color = '#eab308';
    } else {
        threatStatusText.textContent = 'خطر!'; 
        threatStatusText.style.color = '#ef4444'; 
        threatValue.style.color = '#ef4444';
    }
}

function showSafeResult() {
    if(!detectionResult) return;
    detectionResult.innerHTML = `
        <div style="color:#22c55e; display:flex; align-items:center; gap:0.75rem; font-size:1.1rem; justify-content:center;">
            <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"></path></svg>
            <span>آمن - لا تطابق</span>
        </div>`;
}

function showWaitingResult() {
    if(!detectionResult) return;
    detectionResult.innerHTML = `
        <div style="color:#94a3b8; display:flex; align-items:center; gap:0.75rem; font-size:1.1rem; justify-content:center;">
            <svg class="animate-spin" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 4v2m0 12v2m8-8h-2M6 12H4m13.657-5.657l-1.414 1.414M7.757 16.243l-1.414 1.414m10.607 0l-1.414-1.414M7.757 7.757l-1.414-1.414"></path></svg>
            <span>جاري المسح...</span>
        </div>`;
}

async function handleMatch(criminalId, matchPercentage, emotions) {
    const now = Date.now();
    if (lastAlertTimes[criminalId] && now - lastAlertTimes[criminalId] < 5000) {
        return; 
    }
    lastAlertTimes[criminalId] = now;
    
    const criminal = await getCriminal(criminalId);
    if (!criminal) return;

    // Tracking Log logic
    if (!criminal.tracking) criminal.tracking = [];
    criminal.tracking.unshift({
        time: new Date().toLocaleTimeString('ar-SA'),
        date: new Date().toLocaleDateString('ar-SA'),
        loc: "الكاميرا الرئيسية",
        cam: document.getElementById("cctvSourceSelect")?.value || "CAM-01"
    });
    // Keep last 10
    if (criminal.tracking.length > 10) criminal.tracking.pop();
    
    triggerCloudSync();
    // Save tracking to DB invisibly
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(criminal); // update DB with new tracking!
    
    // Calculate true age from DOB
    let realAge = 0;
    if (criminal.dob) {
        const diff = Date.now() - new Date(criminal.dob).getTime();
        realAge = diff / (1000 * 60 * 60 * 24 * 365.25);
    }
    
    
    // Override the AI Age/Gender estimation with actual database data
    updateAgeGender({ age: realAge, gender: criminal.gender || 'male' });
    
    // Predictive: High Threat Event
    globalThreatScore = Math.min(100, globalThreatScore + 25);
    if(mapGridCells.length) {
        const randomZone = Math.floor(Math.random() * 16);
        mapGridCells[randomZone].className = 'grid-cell hotspot-high';
        
        const patterns = document.getElementById('patternList');
        if(patterns) {
            patterns.innerHTML = `<li class="critical">⚠️ مطابقة لمجرم مسجل (${criminal.name}) في القطاع ${ZONES[randomZone]}</li>` + patterns.innerHTML;
            if(patterns.children.length > 4) patterns.lastElementChild.remove();
        }
    }

    
    if(identityPanel) {
        identityPanel.innerHTML = `
            <div class="criminal-card">
                <div class="card-header">
                    <img src="${criminal.photoUrl}" alt="${criminal.name}" class="card-photo">
                    <div class="card-info">
                        <h3 class="card-name">${criminal.name}</h3>
                        <div class="card-meta">رقم الهوية: ${criminal.idNumber}</div>
                        <div class="match-badge">تطابق ${matchPercentage}%</div>
                    </div>
                </div>
                <div class="card-body">
                    <div class="detail-row"><span class="detail-label">مستوى الخطورة:</span><span class="danger-badge ${criminal.dangerLevel}">${dangerTextMap[criminal.dangerLevel]}</span></div>
                    <div class="detail-row"><span class="detail-label">الجرائم:</span><span>${criminal.crimes}</span></div>
                    <div class="detail-row"><span class="detail-label">الحالة:</span><span>${statusTextMap[criminal.status]}</span></div>
                    ${criminal.notes ? `<div class="detail-row"><span class="detail-label">ملاحظات:</span><span>${criminal.notes}</span></div>` : ''}
                </div>
            </div>`;
    }
    
    if(alertOverlay) alertOverlay.classList.add('active');
    playAlertSound();
    window.speakAlert('تحذير! تم التعرف على شخص مطلوب: ' + criminal.name, true);
    
    let dominantEmotion = 'غير معروف';
    if(emotions) {
        dominantEmotion = Object.entries(emotions).reduce((a, b) => b[1] > a[1] ? b : a, ['neutral', 0])[0];
    }
    
    const objects = Object.keys(objectsAccumulator).slice(0, 2).join('، ') || 'لا يوجد';
    objectsAccumulator = {};
    
    addToLog(criminal, matchPercentage, dominantEmotion, objects);
    
    if (typeof window.addTimelinePoint === 'function') {
        window.addTimelinePoint(criminal.dangerLevel === 'high' ? 90 : 60);
    }
}

// Log Functions
function addToLog(criminal, percentage, emotion, objects) {
    if(!logTableBody) return;
    const row = document.createElement('tr');
    const time = new Date().toLocaleTimeString('ar-SA');
    row.innerHTML = `
        <td>${time}</td>
        <td>${criminal.name}</td>
        <td>${criminal.idNumber}</td>
        <td><span class="danger-badge ${criminal.dangerLevel}">${dangerTextMap[criminal.dangerLevel]}</span></td>
        <td>${percentage}%</td>
        <td>${emotion}</td>
        <td>${objects}</td>
        <td><span class="status-badge ${criminal.status}">${statusTextMap[criminal.status]}</span></td>
    `;
    logTableBody.prepend(row);
    if (logTableBody.children.length > 50) {
        logTableBody.removeChild(logTableBody.lastChild);
    }
    updateLogCount();
}

function updateLogCount() {
    if(logCount && logTableBody) logCount.textContent = logTableBody.children.length;
}

function renderLog() {
    if(logTableBody) logTableBody.innerHTML = '';
    updateLogCount();
}

if(clearLogBtn) clearLogBtn.addEventListener('click', renderLog);

// Database UI Management
function loadCriminalsList() {
    getAllCriminals().then(criminals => {
        if(!criminalsList) return;
        criminalsList.innerHTML = '';
        criminals.forEach(c => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><img src="${c.photoUrl}" alt="${c.name}" style="width:40px; height:40px; border-radius:4px; object-fit:cover;"></td>
                <td>${c.name}</td>
                <td>${c.idNumber}</td>
                <td><span class="danger-badge ${c.dangerLevel}">${dangerTextMap[c.dangerLevel]}</span></td>
                <td><span class="status-badge ${c.status}">${statusTextMap[c.status]}</span></td>
                <td>
                    <button class="icon-btn edit-btn" data-id="${c.id}" title="تعديل">✏️</button>
                    <button class="icon-btn delete-btn" data-id="${c.id}" title="حذف">🗑️</button>
                </td>
            `;
            criminalsList.appendChild(tr);
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                if(confirm('هل أنت متأكد من حذف هذا السجل؟')) {
                    const id = e.currentTarget.getAttribute('data-id');
                    await new Promise((resolve) => {
                        const req = getStore('readwrite').delete(id);
                        req.onsuccess = resolve;
                    });
                    loadCriminalsList();
                    updateDBCount();
                    rebuildFaceMatcher();
                }
            });
        });
        
        // Add edit listener if needed...
    });
}

// Events
function setupEventListeners() {
    if(startCameraBtn) startCameraBtn.addEventListener('click', startCamera);
    if(stopCameraBtn) stopCameraBtn.addEventListener('click', stopCamera);
    
    if(multiCamToggle) {
        multiCamToggle.addEventListener('click', () => {
            isMultiCam = !isMultiCam;
            multiCamToggle.classList.toggle('active');
            if(isMultiCam) {
                cameraContainer.style.display = 'none';
                multiCamGrid.style.display = 'grid';
            } else {
                cameraContainer.style.display = 'block';
                multiCamGrid.style.display = 'none';
            }
        });
    }
    
    if(voiceToggle) {
        voiceToggle.addEventListener('click', () => {
            const enabled = !window.isVoiceEnabled();
            window.setVoiceEnabled(enabled);
            voiceToggle.innerHTML = enabled ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>' : '🔇';
            voiceToggle.classList.toggle('active', enabled);
        });
    }
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            const target = e.currentTarget;
            target.classList.add('active');
            window.applyCameraFilter(cameraViewport, target.getAttribute('data-filter'));
        });
    });
    
    navTabs.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = e.currentTarget;
            navTabs.forEach(b => b.classList.remove('active'));
            target.classList.add('active');
            
            document.querySelectorAll('.tab-content').forEach(sec => sec.classList.remove('active'));
            const tabId = target.getAttribute('data-tab');
            const targetTab = document.getElementById(tabId + 'Tab');
            if (targetTab) targetTab.classList.add('active');
            
            if (tabId === 'analytics' && typeof window.initAnalyticsCharts === 'function') {
                window.initAnalyticsCharts();
                if(window.updateDangerPie) window.updateDangerPie();
                if(window.updateEmotionRadar) window.updateEmotionRadar();
                if(window.updateObjectsChart) window.updateObjectsChart();
            }
            if (tabId === 'analytics' && typeof window.refreshMapMarkers === 'function') {
                window.refreshMapMarkers();
            }
            if (tabId === 'robotics' && typeof window.initRoboticsTab === 'function') {
                window.initRoboticsTab();
            }
        });
    });
    
    panelTabs.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = e.currentTarget;
            panelTabs.forEach(b => b.classList.remove('active'));
            target.classList.add('active');
            
            document.querySelectorAll('.panel-section').forEach(sec => sec.classList.remove('active'));
            const panelId = target.getAttribute('data-panel');
            const targetPanel = document.getElementById(panelId + 'Panel');
            if (targetPanel) targetPanel.classList.add('active');
        });
    });
    
    // Add Criminal Modal Logic
    if(addCriminalBtn) addCriminalBtn.addEventListener('click', () => {
        criminalForm.reset();
        editCriminalId.value = '';
        photoPreview.innerHTML = `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" opacity="0.3"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg><p>التقط صورة أو ارفع واحدة</p>`;
        tempFaceDescriptors = []; if(document.getElementById("captureCountBadge")) document.getElementById("captureCountBadge").style.display="none"; if(capturePhotoBtn) capturePhotoBtn.disabled=false; if(document.getElementById("offensesContainer")) document.getElementById("offensesContainer").innerHTML="";
        tempPhotoData = null;
        modalTitle.textContent = 'إضافة شخص جديد';
        addCriminalModal.classList.add('active');
    });
    
    if(closeModalBtn) closeModalBtn.addEventListener('click', (e) => { e.preventDefault(); addCriminalModal.classList.remove('active'); });
    if(cancelFormBtn) cancelFormBtn.addEventListener('click', (e) => { e.preventDefault(); addCriminalModal.classList.remove('active'); });
    
    
    if(capturePhotoBtn) {
                capturePhotoBtn.addEventListener('click', async () => {
            if (!video.srcObject) {
                await startCamera();
                await new Promise(r => setTimeout(r, 800));
            }
            
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d').drawImage(video, 0, 0);
            
            const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
            photoPreview.innerHTML = `<img src="${dataUrl}" style="width:100%; height:100%; object-fit:cover;">`;
            
            try {
                const detection = await faceapi.detectSingleFace(canvas, getFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();
                if (detection) {
                    tempFaceDescriptors.push(Array.from(detection.descriptor));
                    if(tempFaceDescriptors.length === 1) tempPhotoData = dataUrl; // save first photo as primary
                    
                    const badge = document.getElementById('captureCountBadge');
                    badge.style.display = 'flex';
                    badge.textContent = tempFaceDescriptors.length;
                    
                    if (tempFaceDescriptors.length < 3) {
                        alert(`تم التقاط الزاوية ${tempFaceDescriptors.length} بنجاح. يرجى تدوير الوجه قليلاً والتقاط صورة أخرى.`);
                    } else {
                        alert('تم اكتمال تدريب النظام بـ 3 زوايا بنجاح!');
                        capturePhotoBtn.disabled = true;
                    }
                } else {
                    alert('لم يتم العثور على وجه واضح. يرجى التأكد من الإضاءة.');
                }
            } catch(e) {
                console.error("Capture detection error:", e);
                alert("حدث خطأ أثناء تحليل الصورة.");
            }
        });
    }

    if(uploadPhotoInput) {
        uploadPhotoInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const img = await faceapi.bufferToImage(file);
            photoPreview.innerHTML = `<img src="${img.src}" style="width:100%; height:100%; object-fit:cover;">`;
            tempPhotoData = img.src;
            
            const detection = await faceapi.detectSingleFace(img, getFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();
            if (detection) {
                tempFaceDescriptors = [Array.from(detection.descriptor)];
                alert('تم استخراج ميزات الوجه بنجاح');
            } else {
                tempFaceDescriptors = []; if(document.getElementById("captureCountBadge")) document.getElementById("captureCountBadge").style.display="none"; if(capturePhotoBtn) capturePhotoBtn.disabled=false; if(document.getElementById("offensesContainer")) document.getElementById("offensesContainer").innerHTML="";
                alert('لم يتم العثور على وجه في الصورة');
            }
        });
    }
    
    const saveFormBtn = document.getElementById('saveFormBtn');
    if(saveFormBtn && criminalForm) {
        saveFormBtn.addEventListener('click', (e) => {
            e.preventDefault();
            criminalForm.dispatchEvent(new Event('submit', { cancelable: true }));
        });
    }

    if(criminalForm) {
        criminalForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (tempFaceDescriptors.length === 0 && !editCriminalId.value) {
                alert('يجب تقديم صورة تحتوي على وجه واضح');
                return;
            }
            
            const criminal = {
                id: editCriminalId.value || generateUUID(),
                name: criminalName.value,
                idNumber: criminalIdNumber.value,
                dangerLevel: criminalDanger.value,
                crimes: criminalCrimes.value,
                notes: criminalNotes.value,
                lat: criminalLat ? parseFloat(criminalLat.value) : null,
                lng: criminalLng ? parseFloat(criminalLng.value) : null,
                status: 'active',
                createdAt: new Date().toISOString()
            };
            
            if (tempPhotoData) criminal.photoUrl = tempPhotoData;
            if (tempFaceDescriptor) criminal.faceDescriptor = tempFaceDescriptor;
            
            await new Promise((resolve) => {
                const req = getStore('readwrite').put(criminal);
                req.onsuccess = resolve;
            });
            
            addCriminalModal.classList.remove('active');
            loadCriminalsList();
            updateDBCount();
            rebuildFaceMatcher();
        });
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await loadAllModels();
        
        if(loadingStatus) loadingStatus.textContent = 'تهيئة قاعدة البيانات...';
        await initDB();
        await rebuildFaceMatcher();
        renderLog();
        
        try { if(window.initPoseDetection) await window.initPoseDetection(); } catch(e) { console.warn('Pose detection unavailable'); }
        
        setTimeout(() => {
            if(loadingOverlay) loadingOverlay.classList.add('hidden');
            if(systemStatusDot) systemStatusDot.classList.add('active');
            if(systemStatusText) systemStatusText.textContent = 'النظام نشط';
        }, 500);
        
        setupEventListeners();
        startClock();
        
    } catch (err) {
        console.error('Init error:', err);
        if(loadingStatus) {
            loadingStatus.textContent = 'خطأ في تحميل النظام: ' + err.message;
            loadingStatus.style.color = '#ef4444';
        }
    }
});


// --- SECURITY: LOGIN SYSTEM ---
document.getElementById('loginBtn')?.addEventListener('click', () => {
    const pw = document.getElementById('loginPassword').value;
    if (pw === 'Admin') {
        document.getElementById('loginOverlay').classList.remove('active');
    } else {
        document.getElementById('loginError').style.display = 'block';
    }
});
document.getElementById('loginPassword')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') document.getElementById('loginBtn').click();
});


// --- OFFENSES LOGIC ---
document.getElementById('addOffenseRowBtn')?.addEventListener('click', () => {
    const container = document.getElementById('offensesContainer');
    const row = document.createElement('div');
    row.className = 'offense-row';
    const today = new Date().toISOString().split('T')[0];
    row.innerHTML = `
        <input type="date" class="off-date" value="${today}">
        <input type="text" class="off-desc" placeholder="وصف الجريمة...">
        <select class="off-sev">
            <option value="low">منخفضة</option>
            <option value="medium">متوسطة</option>
            <option value="high">عالية</option>
        </select>
        <button type="button" class="del-offense-btn" title="حذف"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
    `;
    row.querySelector('.del-offense-btn').addEventListener('click', () => row.remove());
    container.appendChild(row);
});


// --- PREDICTIVE POLICING MODULE ---
let globalThreatScore = 15;
let mapGridCells = [];
const ZONES = ['الشمالي', 'الشمالي الشرقي', 'الشرقي', 'الجنوبي الشرقي', 'الجنوبي', 'الجنوبي الغربي', 'الغربي', 'الشمالي الغربي', 'المركزي أ', 'المركزي ب', 'المركزي ج', 'المركزي د', 'الصناعية', 'التجارية', 'السكنية', 'الحدودية'];

function initPredictiveMap() {
    const grid = document.getElementById('mapGrid');
    if (!grid) return;
    grid.innerHTML = '';
    mapGridCells = [];
    for(let i=0; i<16; i++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.textContent = ZONES[i];
        grid.appendChild(cell);
        mapGridCells.push(cell);
    }
}

function updatePredictiveDashboard() {
    // Randomize slightly based on real events
    const fill = document.getElementById('futureThreatFill');
    const val = document.getElementById('futureThreatValue');
    if (fill && val) {
        fill.style.width = globalThreatScore + '%';
        let status = 'هادئ';
        if (globalThreatScore > 40) status = 'حذر';
        if (globalThreatScore > 75) status = 'خطر محدق';
        val.textContent = Math.round(globalThreatScore) + '% - ' + status;
    }
    
    // Decay threat
    if (globalThreatScore > 15) globalThreatScore -= 0.5;
    
    // Decay cells
    mapGridCells.forEach(cell => {
        if(Math.random() < 0.1) {
            cell.className = 'grid-cell'; // reset
        }
    });
}
setInterval(updatePredictiveDashboard, 5000);

// Call init once
initPredictiveMap();


window.updateCriminalStatus = async function(id, newStatus) {
    const criminal = await getCriminal(id);
    if(criminal) {
        criminal.status = newStatus;
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).put(criminal);
        tx.oncomplete = () => {
            // Re-trigger handleMatch visually or just alert
            alert('تم تحديث الحالة إلى: ' + newStatus);
            // Refresh DB view if open
            if(document.getElementById('databaseTab').classList.contains('active')) loadDatabaseList();
        };
    }
};


// --- PHOTO SCANNER LOGIC ---
const modeLiveBtn = document.getElementById('modeLiveBtn');
const modePhotoBtn = document.getElementById('modePhotoBtn');
const liveCameraMode = document.getElementById('liveCameraMode');
const photoScanMode = document.getElementById('photoScanMode');
const scanUploadTrigger = document.getElementById('scanUploadTrigger');
const scanUploadInput = document.getElementById('scanUploadInput');
const scannedImageContainer = document.getElementById('scannedImageContainer');
const scannedImage = document.getElementById('scannedImage');
const scanCanvasOverlay = document.getElementById('scanCanvasOverlay');
const scanTools = document.getElementById('scanTools');
const runPhotoScanBtn = document.getElementById('runPhotoScanBtn');
const scanAnotherBtn = document.getElementById('scanAnotherBtn');

if(modeLiveBtn && modePhotoBtn) {
    modeLiveBtn.addEventListener('click', () => {
        modeLiveBtn.classList.add('active'); modePhotoBtn.classList.remove('active');
        liveCameraMode.style.display = 'flex'; photoScanMode.classList.remove('active');
        if(!isDetecting && currentStream) startDetection();
    });
    modePhotoBtn.addEventListener('click', () => {
        modePhotoBtn.classList.add('active'); modeLiveBtn.classList.remove('active');
        liveCameraMode.style.display = 'none'; photoScanMode.classList.add('active');
        stopDetection();
    });
    
    scanUploadTrigger.addEventListener('click', () => scanUploadInput.click());
    scanAnotherBtn.addEventListener('click', () => {
        scanUploadInput.value = '';
        scannedImage.src = '';
        scannedImageContainer.style.display = 'none';
        scanTools.style.display = 'none';
        scanUploadTrigger.style.display = 'block';
        const ctx = scanCanvasOverlay.getContext('2d');
        ctx.clearRect(0,0,scanCanvasOverlay.width, scanCanvasOverlay.height);
        document.getElementById('detectionResult').innerHTML = '<div class="no-detection"><p class="no-detection-hint">في الانتظار...</p></div>';
    });
    
    scanUploadInput.addEventListener('change', (e) => {
        if(e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                scannedImage.src = ev.target.result;
                scannedImage.onload = () => {
                    scanUploadTrigger.style.display = 'none';
                    scannedImageContainer.style.display = 'flex';
                    scanTools.style.display = 'flex';
                    
                    // Match canvas to image dimensions exactly
                    const rect = scannedImage.getBoundingClientRect();
                    scanCanvasOverlay.width = scannedImage.naturalWidth;
                    scanCanvasOverlay.height = scannedImage.naturalHeight;
                    scanCanvasOverlay.style.width = scannedImage.width + 'px';
                    scanCanvasOverlay.style.height = scannedImage.height + 'px';
                };
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    });
    
    runPhotoScanBtn.addEventListener('click', async () => {
        if(!scannedImage.src) return;
        runPhotoScanBtn.disabled = true;
        runPhotoScanBtn.innerHTML = 'جاري الفحص...';
        
        try {
            const detections = await faceapi.detectAllFaces(scannedImage, getFaceDetectorOptions())
                .withFaceLandmarks().withFaceDescriptors();
            
            const ctx = scanCanvasOverlay.getContext('2d');
            ctx.clearRect(0,0,scanCanvasOverlay.width, scanCanvasOverlay.height);
            
            let matchFound = false;
            let highestMatch = null;
            
            detections.forEach(det => {
                const box = det.detection.box;
                let label = 'غير معروف';
                let color = '#22c55e';
                
                if(faceMatcher) {
                    const bestMatch = faceMatcher.findBestMatch(det.descriptor);
                    if(bestMatch.label !== 'unknown') {
                        matchFound = true;
                        color = '#ef4444';
                        label = `مطابق ${Math.round((1 - bestMatch.distance)*100)}%`;
                        
                        if(!highestMatch || (1 - bestMatch.distance) > highestMatch.pct) {
                            highestMatch = { id: bestMatch.label, pct: Math.round((1 - bestMatch.distance)*100) };
                        }
                    }
                }
                
                ctx.strokeStyle = color;
                ctx.lineWidth = 4;
                ctx.strokeRect(box.x, box.y, box.width, box.height);
                ctx.fillStyle = color;
                ctx.fillRect(box.x, box.y - 30, ctx.measureText(label).width + 20, 30);
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 20px Cairo';
                ctx.fillText(label, box.x + 5, box.y - 10);
            });
            
            if(matchFound && highestMatch) {
                await handleMatch(highestMatch.id, highestMatch.pct, null);
                document.getElementById('panelBadge').className = 'panel-badge alert';
                document.getElementById('panelBadge').textContent = 'تم إيجاد مطابقات!';
            } else if (detections.length > 0) {
                document.getElementById('detectionResult').innerHTML = `
                    <div class="no-detection">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" style="margin-bottom:16px;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        <h3 class="no-detection-title">آمن: تم فحص ${detections.length} وجوه</h3>
                        <p class="no-detection-hint">لا يوجد مجرمين مسجلين في هذه الصورة.</p>
                    </div>`;
                document.getElementById('panelBadge').className = 'panel-badge clear';
                document.getElementById('panelBadge').textContent = 'آمن';
            } else {
                alert('لم يتم العثور على أي وجوه في الصورة.');
            }
        } catch(e) {
            console.error(e);
            alert('حدث خطأ أثناء الفحص');
        }
        
        runPhotoScanBtn.disabled = false;
        runPhotoScanBtn.innerHTML = 'بدء الفحص الذكي';
    });
}


// --- AI SETTINGS ---
let AI_MIN_CONFIDENCE = 0.3;
let AI_MATCH_THRESHOLD = 0.55;
let AI_MODEL_TYPE = 'ssd';

const aiConfRange = document.getElementById('aiConfRange');
const aiMatchRange = document.getElementById('aiMatchRange');
const aiConfVal = document.getElementById('aiConfVal');
const aiMatchVal = document.getElementById('aiMatchVal');
const saveAiSettingsBtn = document.getElementById('saveAiSettingsBtn');

if(aiConfRange) {
    aiConfRange.addEventListener('input', e => aiConfVal.textContent = e.target.value + '%');
    aiMatchRange.addEventListener('input', e => aiMatchVal.textContent = e.target.value + '%');
    saveAiSettingsBtn.addEventListener('click', async () => {
        AI_MIN_CONFIDENCE = parseInt(aiConfRange.value) / 100;
        AI_MATCH_THRESHOLD = parseInt(aiMatchRange.value) / 100;
        AI_MODEL_TYPE = document.getElementById('aiModelSelect').value;
        
        await rebuildFaceMatcher(); // rebuild with new threshold
        document.getElementById('settingsModal').classList.remove('active');
        alert('تم تطبيق إعدادات الذكاء الاصطناعي الجديدة!');
    });
}

function getFaceDetectorOptions() {
    return AI_MODEL_TYPE === 'ssd' 
        ? new faceapi.SsdMobilenetv1Options({ minConfidence: AI_MIN_CONFIDENCE })
        : new faceapi.TinyFaceDetectorOptions({ scoreThreshold: AI_MIN_CONFIDENCE });
}

function triggerCloudSync() {
    const status = document.getElementById('cloudSyncStatus');
    if(!status) return;
    status.textContent = 'جاري الرفع...';
    status.classList.add('sync-active');
    setTimeout(() => {
        status.textContent = 'متصل (AWS)';
        status.classList.remove('sync-active');
    }, 3000);
}
