let cocoModel = null;

window.initObjectDetection = async function() {
  try {
    cocoModel = await cocoSsd.load();
    console.log('COCO-SSD loaded');
    return true;
  } catch(e) {
    console.error('Error loading COCO-SSD:', e);
    return false;
  }
}

window.detectObjects = async function(videoElement) {
  if (!cocoModel) return [];
  try {
    const predictions = await cocoModel.detect(videoElement);
    return predictions; // [{class: 'person', score: 0.95, bbox: [x,y,w,h]}, ...]
  } catch(e) { return []; }
}

let poseDetector = null;

window.initPoseDetection = async function() {
  try {
    // MoveNet SinglePose Lightning
    poseDetector = await poseDetection.createDetector(
      poseDetection.SupportedModels.MoveNet,
      { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
    );
    console.log('MoveNet loaded');
    return true;
  } catch(e) {
    console.error('Error loading MoveNet:', e);
    return false;
  }
}

window.detectPose = async function(videoElement) {
  if (!poseDetector) return null;
  try {
    const poses = await poseDetector.estimatePoses(videoElement);
    return poses.length > 0 ? poses[0] : null;
  } catch(e) { return null; }
}

window.drawPose = function(pose, canvas, videoWidth, videoHeight) {
  if (!pose || !pose.keypoints) return;
  const ctx = canvas.getContext('2d');
  // Set canvas size to match video
  canvas.width = videoWidth;
  canvas.height = videoHeight;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  const keypoints = pose.keypoints;
  const minConfidence = 0.3;
  
  // Draw skeleton connections
  const connections = [
    ['left_shoulder','right_shoulder'],['left_shoulder','left_elbow'],['left_elbow','left_wrist'],
    ['right_shoulder','right_elbow'],['right_elbow','right_wrist'],['left_shoulder','left_hip'],
    ['right_shoulder','right_hip'],['left_hip','right_hip'],['left_hip','left_knee'],
    ['left_knee','left_ankle'],['right_hip','right_knee'],['right_knee','right_ankle']
  ];
  
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 2;
  connections.forEach(([a, b]) => {
    const kpA = keypoints.find(k => k.name === a);
    const kpB = keypoints.find(k => k.name === b);
    if (kpA && kpB && kpA.score > minConfidence && kpB.score > minConfidence) {
      ctx.beginPath();
      ctx.moveTo(kpA.x, kpA.y);
      ctx.lineTo(kpB.x, kpB.y);
      ctx.stroke();
    }
  });
  
  // Draw keypoints
  keypoints.forEach(kp => {
    if (kp.score > minConfidence) {
      ctx.beginPath();
      ctx.arc(kp.x, kp.y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#22c55e';
      ctx.fill();
    }
  });
}

window.analyzePosePosture = function(pose) {
  if (!pose || !pose.keypoints) return { posture: 'unknown', icon: '', confidence: 0 };
  const kp = {};
  pose.keypoints.forEach(p => { kp[p.name] = p; });
  const minScore = 0.3;
  
  // Check if running (knees far apart vertically)
  const lAnkle = kp['left_ankle'];
  const rAnkle = kp['right_ankle'];
  const lKnee = kp['left_knee'];
  const rKnee = kp['right_knee'];
  const lShoulder = kp['left_shoulder'];
  const rShoulder = kp['right_shoulder'];
  const lWrist = kp['left_wrist'];
  const rWrist = kp['right_wrist'];
  const nose = kp['nose'];
  
  // Check hands raised above shoulders
  if (lWrist && rWrist && lShoulder && rShoulder &&
      lWrist.score > minScore && rWrist.score > minScore &&
      lShoulder.score > minScore && rShoulder.score > minScore) {
    if (lWrist.y < lShoulder.y - 50 && rWrist.y < rShoulder.y - 50) {
      return { posture: 'رافع اليدين', icon: '', confidence: 0.8 };
    }
    if (lWrist.y < lShoulder.y - 30 || rWrist.y < rShoulder.y - 30) {
      return { posture: 'يد مرفوعة', icon: '', confidence: 0.6 };
    }
  }
  
  // Check crouching/bending (nose close to knees level)
  if (nose && lKnee && nose.score > minScore && lKnee.score > minScore) {
    if (Math.abs(nose.y - lKnee.y) < 80) {
      return { posture: 'منحني', icon: '', confidence: 0.7 };
    }
  }
  
  // Default standing
  if (lShoulder && rShoulder && lShoulder.score > minScore && rShoulder.score > minScore) {
    return { posture: 'واقف', icon: '', confidence: 0.9 };
  }
  
  return { posture: 'غير محدد', icon: '', confidence: 0 };
}

window.calculateThreatLevel = function(options) {
  // options: { isCriminalDetected, dangerLevel, emotions, posture, objects }
  let score = 0;
  
  // Criminal detected
  if (options.isCriminalDetected) {
    score += options.dangerLevel === 'high' ? 50 : options.dangerLevel === 'medium' ? 35 : 20;
  }
  
  // Suspicious emotions
  if (options.emotions) {
    score += (options.emotions.angry || 0) * 20;
    score += (options.emotions.fearful || 0) * 15;
    score += (options.emotions.disgusted || 0) * 10;
  }
  
  // Suspicious posture
  if (options.posture) {
    if (options.posture === 'رافع اليدين') score += 15;
    if (options.posture === 'منحني') score += 10;
  }
  
  // Suspicious objects
  if (options.objects) {
    const suspiciousItems = ['knife', 'scissors', 'baseball bat', 'sports ball'];
    options.objects.forEach(obj => {
      if (suspiciousItems.includes(obj.class)) score += 25;
    });
    // Backpack near a criminal
    if (options.isCriminalDetected) {
      options.objects.forEach(obj => {
        if (obj.class === 'backpack' || obj.class === 'handbag' || obj.class === 'suitcase') score += 10;
      });
    }
  }
  
  return Math.min(Math.round(score), 100);
}

window.drawObjectBoxes = function(predictions, ctx, canvasWidth, canvasHeight) {
  // Lower threshold for bad lighting
  const filtered = predictions.filter(p => p.score > 0.25);
  const threats = ['knife', 'scissors', 'backpack', 'handbag', 'suitcase', 'cell phone'];
  
  filtered.forEach(pred => {
    if (pred.class === 'person') return; // Don't draw box for person, but keep in list

    const [x, y, w, h] = pred.bbox;
    const isThreat = threats.includes(pred.class);
    
    // Draw advanced HUD box
    ctx.strokeStyle = isThreat ? '#ef4444' : '#eab308';
    ctx.lineWidth = 2;
    
    // Corner brackets instead of full box for premium look
    const len = 15;
    ctx.beginPath();
    ctx.moveTo(x, y + len); ctx.lineTo(x, y); ctx.lineTo(x + len, y); // Top Left
    ctx.moveTo(x + w, y + len); ctx.lineTo(x + w, y); ctx.lineTo(x + w - len, y); // Top Right
    ctx.moveTo(x, y + h - len); ctx.lineTo(x, y + h); ctx.lineTo(x + len, y + h); // Bottom Left
    ctx.moveTo(x + w, y + h - len); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w - len, y + h); // Bottom Right
    ctx.stroke();
    
    // Label
    const label = `${pred.class.toUpperCase()} [${Math.round(pred.score * 100)}%]`;
    ctx.fillStyle = isThreat ? 'rgba(239, 68, 68, 0.9)' : 'rgba(234, 179, 8, 0.9)';
    ctx.fillRect(x, y - 22, ctx.measureText(label).width + 10, 22);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px "JetBrains Mono", sans-serif';
    ctx.fillText(label, x + 5, y - 7);
    
    // Warning dot if threat
    if(isThreat) {
        ctx.beginPath();
        ctx.arc(x + w, y, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#ef4444';
        ctx.fill();
        ctx.stroke();
    }
  });
  
  return filtered;
}


let voiceEnabled = true;
let lastVoiceAlert = 0;

window.setVoiceEnabled = function(enabled) { voiceEnabled = enabled; }
window.isVoiceEnabled = function() { return voiceEnabled; }

window.speakAlert = function(text, urgent) {
  if (!voiceEnabled) return;
  const now = Date.now();
  if (now - lastVoiceAlert < 8000) return; // 8s cooldown
  lastVoiceAlert = now;
  
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-SA';
    utterance.rate = 1.1;
    utterance.pitch = urgent ? 1.3 : 1;
    utterance.volume = 1;
    window.speechSynthesis.speak(utterance);
  }
}

window.applyCameraFilter = function(viewportElement, filterName) {
  if(!viewportElement) return;
  viewportElement.classList.remove('nightvision-filter', 'thermal-filter', 'contrast-filter');
  switch(filterName) {
    case 'nightvision': viewportElement.classList.add('nightvision-filter'); break;
    case 'thermal': viewportElement.classList.add('thermal-filter'); break;
    case 'contrast': viewportElement.classList.add('contrast-filter'); break;
    default: break; // 'normal' — no filter
  }
}
