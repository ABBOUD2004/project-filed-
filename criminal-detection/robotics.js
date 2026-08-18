let roboticsInitialized = false;

window.initRoboticsTab = function() {
  if (roboticsInitialized) return;
  roboticsInitialized = true;
  
  const container = document.getElementById('roboticsContent');
  if (!container) return;
  
  container.innerHTML = `
    <!-- Section 1: AI Pipeline -->
    <div class="robotics-section">
      <h2><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-left:6px;"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8" y2="16"></line><line x1="16" y1="16" x2="16" y2="16"></line></svg> خط أنابيب الذكاء الاصطناعي — من الكاميرا إلى القرار</h2>
      <p style="color:#8494b2; font-size:0.88rem; margin-bottom:20px;">
        نظامنا يستخدم نفس المبدأ الذي تستخدمه الروبوتات المتقدمة: خط أنابيب متعدد المراحل يبدأ بالاستشعار وينتهي بالقرار.
      </p>
      <div class="pipeline-flow">
        <div class="pipeline-step"><span class="step-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-left:6px;"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg></span><span class="step-label">استشعار<br>الكاميرا</span></div>
        <span class="pipeline-arrow">→</span>
        <div class="pipeline-step"><span class="step-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-left:6px;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg></span><span class="step-label">كشف<br>الوجه</span></div>
        <span class="pipeline-arrow">→</span>
        <div class="pipeline-step"><span class="step-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-left:6px;"><path d="M10 2v20"></path><path d="M14 2v20"></path><path d="M2 12h20"></path></svg></span><span class="step-label">التعرف<br>والمطابقة</span></div>
        <span class="pipeline-arrow">→</span>
        <div class="pipeline-step"><span class="step-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-left:6px;"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg></span><span class="step-label">تحليل<br>المشاعر</span></div>
        <span class="pipeline-arrow">→</span>
        <div class="pipeline-step"><span class="step-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-left:6px;"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg></span><span class="step-label">كشف<br>الأشياء</span></div>
        <span class="pipeline-arrow">→</span>
        <div class="pipeline-step"><span class="step-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-left:6px;"><path d="M13 4v16"></path><path d="M13 4h4v4"></path><path d="M13 10h-4"></path><path d="M13 15H9"></path></svg></span><span class="step-label">تحليل<br>الوضعية</span></div>
        <span class="pipeline-arrow">→</span>
        <div class="pipeline-step" style="border-color:#ef4444;"><span class="step-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="M4.93 4.93l1.41 1.41"></path><path d="M17.66 17.66l1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="M6.34 17.66l-1.41 1.41"></path><path d="M19.07 4.93l-1.41 1.41"></path><circle cx="12" cy="12" r="4"></circle></svg></span><span class="step-label">القرار<br>والتنبيه</span></div>
      </div>
    </div>

    <!-- Section 2: Sensor Fusion Concept -->
    <div class="robotics-section">
      <h2><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-left:6px;"><path d="M19.428 15.428A2 2 0 0 0 21 14h-2a2 2 0 0 1-2-2V8a2 2 0 0 0-2-2h-4a2 2 0 0 1-2-2V2a2 2 0 0 0-2-2v2a2 2 0 0 1-2-2H3a2 2 0 0 0-2 2v4a2 2 0 0 1 2 2h2a2 2 0 0 0 2 2v4a2 2 0 0 1 2 2H3a2 2 0 0 0 2 2h4a2 2 0 0 1 2 2v2a2 2 0 0 0 2-2v-2a2 2 0 0 1 2-2h4a2 2 0 0 0 2-2z"></path></svg> دمج الحواس (Sensor Fusion)</h2>
      <div class="concept-card">
        <h4>ما هو دمج الحواس؟</h4>
        <p>تمامًا كما يدمج الروبوت بيانات الكاميرا والليدار والـ IMU لبناء صورة شاملة عن محيطه، نظامنا يدمج <strong>6 نماذج AI</strong> مختلفة في الوقت الفعلي:
        التعرف على الوجه + المشاعر + العمر/الجنس + كشف الأشياء + تحليل الوضعية + تحليل السلوك.</p>
      </div>
      <div class="concept-card">
        <h4>لماذا الدمج مهم؟</h4>
        <p>كل نموذج وحده يعطي معلومات جزئية. لكن دمجهم يعطي <strong>فهماً شاملاً للمشهد</strong>: هل هذا الشخص مجرم مطلوب؟ هل هو متوتر؟ هل يحمل شيئاً مشبوهاً؟ هل سلوكه غير طبيعي؟</p>
      </div>
      <div class="concept-card">
        <h4>مقياس الخطورة المركّب</h4>
        <p>مقياس الخطورة (Threat Level) في نظامنا هو نتيجة دمج كل هذه الحواس في رقم واحد (0-100)، مثلما تفعل أنظمة القيادة الذاتية في تقييم خطورة المشهد.</p>
      </div>
    </div>

    <!-- Section 3: Comparison Table -->
    <div class="robotics-section">
      <h2><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-left:6px;"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg> مقارنة: نظامنا vs منصات محاكاة الروبوتات</h2>
      <p style="color:#8494b2; font-size:0.85rem; margin-bottom:16px;">كيف يتقاطع نظامنا مع المنصات المذكورة في مستند Robotics Simulation Platforms.</p>
      <table class="comparison-table">
        <thead>
          <tr>
            <th>المنصة</th>
            <th>مجال العمل</th>
            <th>قدرات AI المشتركة مع نظامنا</th>
            <th>التقنية المشتركة</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>The Construct</strong></td>
            <td>محاكاة ROS في المتصفح</td>
            <td>Computer Vision عبر كاميرات محاكاة</td>
            <td>معالجة الصور في المتصفح</td>
          </tr>
          <tr>
            <td><strong>NVIDIA Isaac Sim</strong></td>
            <td>توائم رقمية + تدريب AI</td>
            <td>Vision-Language-Action (VLA) — نفس مبدأ دمج الرؤية والقرار</td>
            <td>نماذج إدراك متقدمة</td>
          </tr>
          <tr>
            <td><strong>Gazebo</strong></td>
            <td>محاكاة روبوتات + ROS</td>
            <td>كشف الأشياء عبر كاميرات محاكاة + LiDAR</td>
            <td>Object Detection Pipeline</td>
          </tr>
          <tr>
            <td><strong>Hugging Face LeRobot</strong></td>
            <td>تدريب سياسات AI للروبوتات</td>
            <td>تعلم من المشاهدة (Imitation Learning) — يشبه تعلم بصمات الوجوه</td>
            <td>End-to-End Vision Policies</td>
          </tr>
          <tr>
            <td><strong>MuJoCo</strong></td>
            <td>Reinforcement Learning</td>
            <td>تحليل الوضعية والحركة — نستخدم MoveNet لنفس الغرض</td>
            <td>Pose Estimation & Control</td>
          </tr>
          <tr>
            <td><strong>Webots</strong></td>
            <td>محاكاة تعليمية في المتصفح</td>
            <td>كاميرات محاكاة + OpenCV — مثل استخدامنا لـ face-api.js</td>
            <td>Browser-based CV</td>
          </tr>
          <tr>
            <td><strong>Applied Intuition</strong></td>
            <td>قيادة ذاتية + أمان</td>
            <td>Perception Stack — نظامنا perception stack أمني</td>
            <td>Multi-sensor Fusion</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Section 4: Sim-to-Real -->
    <div class="robotics-section">
      <h2><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-left:6px;"><polyline points="1 4 1 10 7 10"></polyline><polyline points="23 20 23 14 17 14"></polyline><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path></svg> من المحاكاة إلى الواقع (Sim-to-Real Transfer)</h2>
      <div class="concept-card">
        <h4>تدريب اصطناعي، تطبيق حقيقي</h4>
        <p>منصات مثل NVIDIA Isaac Sim تولّد ملايين الصور الاصطناعية بظروف إضاءة وزوايا مختلفة لتدريب نماذج الذكاء الاصطناعي. نظامنا يمكن تحسين دقته باستخدام <strong>بيانات اصطناعية</strong> مولّدة من هذه المحاكيات — خاصة في الحالات الصعبة (إضاءة ضعيفة، زوايا جانبية، أقنعة).</p>
      </div>
      <div class="concept-card">
        <h4>Edge AI — الذكاء على الحافة</h4>
        <p>نظامنا يشبه ما تفعله الروبوتات في <strong>Edge AI</strong>: كل المعالجة تتم محلياً (في المتصفح) بدون إرسال البيانات لسيرفر خارجي. هذا يعني:
        ⚡ سرعة عالية — لا تأخير شبكة |  🔒 خصوصية — البيانات لا تغادر الجهاز | 📴 يعمل بدون إنترنت (بعد التحميل الأول)</p>
      </div>
    </div>

    <!-- Section 5: Technical Architecture -->
    <div class="robotics-section">
      <h2><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-left:6px;"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg> البنية التقنية للنظام</h2>
      <h3>النماذج المستخدمة (6 نماذج AI)</h3>
      <table class="comparison-table">
        <thead>
          <tr><th>#</th><th>النموذج</th><th>المكتبة</th><th>الوظيفة</th><th>المعادل الروبوتي</th></tr>
        </thead>
        <tbody>
          <tr><td>1</td><td>TinyFaceDetector</td><td>face-api.js</td><td>كشف الوجوه</td><td>Object Detection (YOLO)</td></tr>
          <tr><td>2</td><td>FaceRecognitionNet</td><td>face-api.js</td><td>التعرف على الهوية</td><td>Feature Matching (SLAM)</td></tr>
          <tr><td>3</td><td>FaceExpressionNet</td><td>face-api.js</td><td>تحليل المشاعر</td><td>HRI Emotion Recognition</td></tr>
          <tr><td>4</td><td>AgeGenderNet</td><td>face-api.js</td><td>تقدير العمر/الجنس</td><td>Person Re-identification</td></tr>
          <tr><td>5</td><td>COCO-SSD</td><td>TensorFlow.js</td><td>كشف 80 نوع من الأشياء</td><td>Semantic Segmentation</td></tr>
          <tr><td>6</td><td>MoveNet</td><td>TensorFlow.js</td><td>تحليل وضعية الجسم</td><td>Pose Estimation (OpenPose)</td></tr>
        </tbody>
      </table>
    </div>

    <!-- Section 6: VLA Concept -->
    <div class="robotics-section">
      <h2><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-left:6px;"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"></path><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"></path></svg> مفهوم Vision-Language-Action (VLA)</h2>
      <div class="concept-card">
        <h4>ما هو VLA؟</h4>
        <p>مفهوم متقدم من NVIDIA Isaac يدمج ثلاث قدرات:
        <strong>الرؤية</strong> (فهم الصورة) + <strong>اللغة</strong> (فهم الأوامر النصية) + <strong>الفعل</strong> (اتخاذ قرار).
        نظامنا يطبق نسخة مبسطة: <strong>الرؤية</strong> (6 نماذج AI) + <strong>اللغة</strong> (التنبيهات الصوتية بالعربي) + <strong>الفعل</strong> (التنبيه وتسجيل الحدث).</p>
      </div>
    </div>
  `;
}
