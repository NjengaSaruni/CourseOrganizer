import{a as M}from"./chunk-FHQFZ7BW.js";import{a as E}from"./chunk-CJME7ZFP.js";import{a as C}from"./chunk-E25IYVGI.js";import{Ma as w,h as x,l as g,p as v,s as b}from"./chunk-X3WSSSVM.js";var T=class y{constructor(e,t,i){this.http=e;this.courseService=t;this.libJitsiCallService=i}apiUrl=C.apiUrl;videoCallModal=null;currentCallFrame=null;pendingVideoCallData=null;startLibJitsiCall(e){console.log("Starting Lib-Jitsi-Meet call with data:",e);let t=this.extractRoomNameFromUrl(e.join_url);t||(t=`meeting-${e.meeting_id}-${Date.now()}`);let i={displayName:e.user_name||"User",email:e.user_email||"",avatar:e.user_avatar||""},o={roomName:t,meetingTitle:e.meeting_title||"Video Meeting",userInfo:i,meetingId:e.meeting_id};this.libJitsiCallService.startCall(o)}isDailyCoAvailable(){return typeof window.DailyIframe<"u"}isMediaDevicesSupported(){return!!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia)}isSecureContext(){return window.isSecureContext}getMediaDeviceInfo(){return{isSecureContext:this.isSecureContext(),isMediaDevicesSupported:this.isMediaDevicesSupported(),userAgent:navigator.userAgent,protocol:window.location.protocol,hostname:window.location.hostname}}ensureIframePermissions(e){e.setAttribute("allow","camera; microphone; autoplay; fullscreen; display-capture"),e.setAttribute("allowfullscreen","true"),e.setAttribute("sandbox","allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation"),console.log("Iframe permissions set:",{allow:e.getAttribute("allow"),allowfullscreen:e.getAttribute("allowfullscreen"),sandbox:e.getAttribute("sandbox")})}requestMediaPermissions(){return!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia?(console.warn("Media devices API not supported"),Promise.resolve(null)):window.isSecureContext?(console.log("Requesting media permissions..."),navigator.mediaDevices.getUserMedia({video:!0,audio:!0}).then(e=>(console.log("Media permissions granted"),e)).catch(e=>(console.warn("Media permissions denied or error:",e),null))):(console.warn("Not in a secure context - camera access may be restricted"),Promise.resolve(null))}requestMediaPermissionsWithGuidance(){return new Promise(e=>{if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){console.warn("Media devices API not supported"),e(!1);return}console.log("Requesting media permissions..."),navigator.mediaDevices.getUserMedia({video:!0,audio:!0}).then(t=>{console.log("Media permissions granted"),t.getTracks().forEach(i=>i.stop()),e(!0)}).catch(t=>{console.warn("Media permissions denied or error:",t),e(!1)})})}requestMediaPermissionsInternal(){if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){console.warn("Media devices API not supported"),this.updatePermissionStatus("Media devices API not supported","warning");return}if(!window.isSecureContext){console.warn("Not in a secure context - camera access may be restricted"),this.updatePermissionStatus("Camera access requires HTTPS or localhost","warning"),this.showPermissionMessage("Camera and microphone access requires a secure connection (HTTPS). Please ensure you are using HTTPS.","warning");return}console.log("Requesting media permissions..."),navigator.mediaDevices.getUserMedia({video:!0,audio:!0}).then(e=>{console.log("Media permissions granted"),e.getTracks().forEach(t=>t.stop()),this.updatePermissionStatus("Camera and microphone access granted!","success"),this.showPermissionMessage("Camera and microphone access granted!","success")}).catch(e=>{console.warn("Media permissions denied or error:",e);let t="Camera and microphone access denied. ",i="Permissions denied";e.name==="NotAllowedError"?(t+="Please allow camera and microphone access in your browser settings and refresh the page.",i="Please allow camera and microphone access"):e.name==="NotFoundError"?(t+="No camera or microphone found. Please check your devices.",i="No camera or microphone found"):e.name==="NotSupportedError"?(t+="Camera and microphone access is not supported in this browser.",i="Camera access not supported"):e.name==="NotReadableError"?(t+="Camera or microphone is already in use by another application.",i="Camera/microphone in use"):(t+="Please check your browser permissions and device settings.",i="Permission error occurred"),this.updatePermissionStatus(i,"warning"),this.showPermissionMessage(t,"warning")})}updatePermissionStatus(e,t){let i=document.getElementById("permission-status");i&&(i.textContent=e,i.style.color=t==="success"?"#28a745":t==="warning"?"#ffc107":"#dc3545")}showPermissionMessage(e,t){let i=document.createElement("div");i.style.cssText=`
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${t==="success"?"#28a745":t==="warning"?"#ffc107":"#dc3545"};
      color: white;
      padding: 12px 16px;
      border-radius: 6px;
      z-index: 10001;
      max-width: 400px;
      font-size: 14px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `,i.textContent=e,document.body.appendChild(i),setTimeout(()=>{i.parentNode&&document.body.removeChild(i)},4e3)}showPermissionGuidance(){this.closeVideoCallModal();let e=document.createElement("div");e.id="permission-guidance-modal",e.style.cssText=`
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.9);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;let t=document.createElement("div");t.style.cssText=`
      background: white;
      border-radius: 12px;
      padding: 2rem;
      max-width: 500px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    `,t.innerHTML=`
      <div style="text-align: center; margin-bottom: 2rem;">
        <div style="width: 64px; height: 64px; background: #fef3c7; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
          <svg style="width: 32px; height: 32px; color: #f59e0b;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 style="margin: 0 0 0.5rem; color: #1f2937; font-size: 1.5rem; font-weight: 600;">Camera Access Required</h2>
        <p style="margin: 0; color: #6b7280; font-size: 1rem;">To join the video call, you need to allow camera and microphone access.</p>
      </div>

      <div style="margin-bottom: 2rem;">
        <h3 style="margin: 0 0 1rem; color: #1f2937; font-size: 1.125rem; font-weight: 600;">How to enable camera access:</h3>
        
        <div style="background: #f9fafb; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
          <h4 style="margin: 0 0 0.5rem; color: #374151; font-size: 1rem; font-weight: 600;">Chrome/Edge:</h4>
          <ol style="margin: 0; padding-left: 1.5rem; color: #6b7280; font-size: 0.875rem; line-height: 1.5;">
            <li>Click the camera icon in the address bar</li>
            <li>Select "Allow" for camera and microphone</li>
            <li>Refresh the page</li>
          </ol>
        </div>

        <div style="background: #f9fafb; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
          <h4 style="margin: 0 0 0.5rem; color: #374151; font-size: 1rem; font-weight: 600;">Firefox:</h4>
          <ol style="margin: 0; padding-left: 1.5rem; color: #6b7280; font-size: 0.875rem; line-height: 1.5;">
            <li>Click the shield icon in the address bar</li>
            <li>Click "Allow" for camera and microphone</li>
            <li>Refresh the page</li>
          </ol>
        </div>

        <div style="background: #f9fafb; border-radius: 8px; padding: 1rem;">
          <h4 style="margin: 0 0 0.5rem; color: #374151; font-size: 1rem; font-weight: 600;">Safari:</h4>
          <ol style="margin: 0; padding-left: 1.5rem; color: #6b7280; font-size: 0.875rem; line-height: 1.5;">
            <li>Go to Safari > Preferences > Websites</li>
            <li>Select "Camera" and "Microphone"</li>
            <li>Set this website to "Allow"</li>
            <li>Refresh the page</li>
          </ol>
        </div>
      </div>

      <div style="display: flex; gap: 1rem; justify-content: flex-end;">
        <button id="retry-permissions" style="
          padding: 0.75rem 1.5rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: white;
          color: #374151;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        ">Try Again</button>
        <button id="join-audio-only" style="
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 6px;
          background: #3b82f6;
          color: white;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        ">Join Audio Only</button>
        <button id="close-guidance" style="
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 6px;
          background: #dc2626;
          color: white;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        ">Cancel</button>
      </div>
    `,e.appendChild(t),document.body.appendChild(e);let i=t.querySelector("#retry-permissions"),o=t.querySelector("#join-audio-only"),r=t.querySelector("#close-guidance");i?.addEventListener("click",()=>{document.body.removeChild(e),this.requestMediaPermissionsWithGuidance().then(n=>{n&&this.pendingVideoCallData?this.proceedWithVideoCall(this.pendingVideoCallData):this.showPermissionGuidance()})}),o?.addEventListener("click",()=>{document.body.removeChild(e),this.pendingVideoCallData&&this.joinAudioOnly(this.pendingVideoCallData)}),r?.addEventListener("click",()=>{document.body.removeChild(e)}),e.addEventListener("click",n=>{n.target===e&&document.body.removeChild(e)})}joinTimetableMeeting(e){return this.http.post(`${this.apiUrl}/timetable/${e}/join-meeting/`,{}).pipe(g(this.handleError.bind(this)))}joinMeeting(e){return this.http.post(`${this.apiUrl}/meetings/${e}/join/`,{}).pipe(g(this.handleError.bind(this)))}createVideoCallForTimetable(e){return this.http.post(`${this.apiUrl}/timetable/${e}/create-meeting/`,{}).pipe(g(this.handleError.bind(this)))}deleteVideoCallForTimetable(e){return this.http.delete(`${this.apiUrl}/timetable/${e}/delete-meeting/`).pipe(g(this.handleError.bind(this)))}openVideoCall(e){if(this.pendingVideoCallData=e,!this.isSecureContext()){alert("Camera and microphone access requires a secure connection (HTTPS). Please ensure you are using HTTPS.");return}if(!this.isMediaDevicesSupported()){alert("Your browser does not support camera and microphone access. Please use a modern browser.");return}this.requestMediaPermissionsWithGuidance().then(t=>{t?this.proceedWithVideoCall(e):this.showPermissionGuidance()})}openEmbeddedVideoCall(e){if(this.pendingVideoCallData=e,!this.isSecureContext()){alert("Camera and microphone access requires a secure connection (HTTPS). Please ensure you are using HTTPS.");return}if(!this.isMediaDevicesSupported()){alert("Your browser does not support camera and microphone access. Please use a modern browser.");return}this.requestMediaPermissionsWithGuidance().then(t=>{t?this.createEmbeddedVideoCall(e):this.showPermissionGuidance()})}proceedWithVideoCall(e){let t=e.join_url&&e.join_url.includes("daily.co"),i=e.join_url&&(e.join_url.includes("meet.jit.si")||e.join_url.includes("jitsi.riverlearn.co.ke")),o=e.join_url&&e.join_url.includes("jitsi.riverlearn.co.ke");console.log("Video call platform detection:",{declaredPlatform:e.platform,isDailyUrl:t,isJitsiUrl:i,isRiverLearnJitsi:o,joinUrl:e.join_url}),o?(console.log("Using Lib-Jitsi-Meet for RiverLearn server"),this.startLibJitsiCall(e)):e.platform==="daily"&&t&&this.isDailyCoAvailable()?this.embedDailyCall(e):(console.log("Using iframe Jitsi call method"),this.embedJitsiCall(e))}joinAudioOnly(e){if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){alert("Microphone access is not supported in this browser.");return}navigator.mediaDevices.getUserMedia({video:!1,audio:!0}).then(t=>{console.log("Audio permission granted, joining audio only"),t.getTracks().forEach(i=>i.stop()),this.proceedWithVideoCall(e)}).catch(t=>{console.warn("Audio permission denied:",t),alert("Microphone access is required for audio-only calls. Please allow microphone access and try again.")})}embedDailyCall(e){if(typeof window.DailyIframe>"u"){console.error("DailyIframe not loaded. Please ensure the Daily.co SDK is included."),alert("Video call service not available. Please refresh the page and try again.");return}this.createVideoCallModal(e)}embedJitsiCall(e){this.createVideoCallModal(e)}createEmbeddedVideoCall(e){if(e.join_url&&e.join_url.includes("jitsi.riverlearn.co.ke")){console.log("Using Lib-Jitsi-Meet for RiverLearn server"),this.startLibJitsiCall(e);return}if(this.closeEmbeddedVideoCall(),!document.querySelector(".bg-white.shadow-sm.border-b.border-gray-200")){console.error("Could not find page header container");return}let o=document.createElement("div");o.id="embedded-video-call",o.style.cssText=`
      position: fixed;
      top: 80px;
      right: 20px;
      width: 500px;
      height: 400px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      z-index: 1000;
      display: flex;
      flex-direction: column;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      border: 1px solid #e5e7eb;
      resize: both;
      overflow: hidden;
      min-width: 300px;
      min-height: 200px;
      max-width: 90vw;
      max-height: 80vh;
    `;let r=document.createElement("div");r.style.cssText=`
      background: #f8fafc;
      color: #1f2937;
      padding: 12px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #e5e7eb;
      border-radius: 12px 12px 0 0;
      cursor: move;
      user-select: none;
    `;let n=document.createElement("div");n.style.cssText="font-size: 14px; font-weight: 600; flex: 1;",n.textContent=e.meeting_title||"Video Call";let l=document.createElement("div");l.style.cssText="display: flex; gap: 8px; align-items: center;";let a=document.createElement("button");a.innerHTML="\u26F6",a.title="Fullscreen",a.style.cssText=`
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 4px;
      width: 24px;
      height: 24px;
      cursor: pointer;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    `,a.onclick=()=>this.toggleEmbeddedFullscreen();let u=document.createElement("button");u.innerHTML="\u2922",u.title="Resize",u.style.cssText=`
      background: #6b7280;
      color: white;
      border: none;
      border-radius: 4px;
      width: 24px;
      height: 24px;
      cursor: pointer;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    `,u.onclick=()=>this.toggleEmbeddedResize();let d=document.createElement("button");d.innerHTML="\u2715",d.title="Close",d.style.cssText=`
      background: #ef4444;
      color: white;
      border: none;
      border-radius: 4px;
      width: 24px;
      height: 24px;
      cursor: pointer;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    `,d.onclick=()=>this.closeEmbeddedVideoCall(),l.appendChild(a),l.appendChild(u),l.appendChild(d),r.appendChild(n),r.appendChild(l);let c=document.createElement("div");c.id="embedded-video-area",c.style.cssText=`
      flex: 1;
      position: relative;
      background: #000;
      display: flex;
      align-items: center;
      justify-content: center;
    `;let m=document.createElement("div");m.id="embedded-video-loading",m.style.cssText=`
      text-align: center;
      color: white;
    `,m.innerHTML=`
      <div style="
        width: 32px;
        height: 32px;
        border: 3px solid #444;
        border-top: 3px solid #3b82f6;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 8px;
      "></div>
      <div style="font-size: 12px;">Connecting...</div>
    `;let s=document.createElement("iframe");s.id="embedded-video-frame",s.style.cssText=`
      width: 100%;
      height: 100%;
      border: none;
      display: none;
    `,s.setAttribute("allow","camera; microphone; autoplay; fullscreen; display-capture"),s.setAttribute("allowfullscreen","true"),c.appendChild(m),c.appendChild(s);let f=document.createElement("div");f.style.cssText=`
      background: #f8fafc;
      padding: 8px 12px;
      display: flex;
      justify-content: center;
      gap: 8px;
      border-top: 1px solid #e5e7eb;
      border-radius: 0 0 12px 12px;
    `;let p=document.createElement("button");p.innerHTML="\u2212",p.title="Minimize",p.style.cssText=`
      padding: 4px 8px;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 500;
      background: white;
      color: #374151;
    `,p.onclick=()=>this.minimizeEmbeddedVideoCall();let h=document.createElement("button");h.textContent="Leave",h.title="Leave Meeting",h.style.cssText=`
      padding: 4px 8px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 500;
      background: #ef4444;
      color: white;
    `,h.onclick=()=>this.closeEmbeddedVideoCall(),f.appendChild(p),f.appendChild(h),o.appendChild(r),o.appendChild(c),o.appendChild(f),document.body.appendChild(o),this.videoCallModal=o,this.addDragFunctionality(r,o),this.initializeEmbeddedVideoCall(e,s,m)}createVideoCallModal(e){this.closeVideoCallModal();let t=document.createElement("div");t.id="video-call-modal",t.style.cssText=`
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.9);
      z-index: 10000;
      display: flex;
      flex-direction: column;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;let i=document.createElement("div");i.style.cssText=`
      background: #2d2d2d;
      color: white;
      padding: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #444;
    `;let o=document.createElement("h2");o.textContent=e.meeting_title||"Video Call",o.style.cssText="margin: 0; font-size: 1.2rem; font-weight: 600;";let r=document.createElement("div");r.textContent=`${e.user_name} ${e.admin_host?`\u2022 Host: ${e.admin_host}`:""}`,r.style.cssText="font-size: 0.9rem; opacity: 0.8;";let n=document.createElement("button");n.innerHTML="\u2715",n.style.cssText=`
      background: #dc3545;
      color: white;
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      cursor: pointer;
      font-size: 1.2rem;
      display: flex;
      align-items: center;
      justify-content: center;
    `,n.onclick=()=>this.closeVideoCallModal(),i.appendChild(o),i.appendChild(r),i.appendChild(n);let l=document.createElement("div");l.id="video-call-container",l.style.cssText=`
      flex: 1;
      position: relative;
      background: #000;
      display: flex;
      align-items: center;
      justify-content: center;
    `;let a=document.createElement("div");a.id="video-loading",a.style.cssText=`
      text-align: center;
      color: white;
    `,a.innerHTML=`
      <div style="
        width: 40px;
        height: 40px;
        border: 4px solid #444;
        border-top: 4px solid #007bff;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 1rem;
      "></div>
      <div>Connecting to video call...</div>
      <div id="permission-status" style="
        font-size: 12px;
        opacity: 0.8;
        margin-top: 8px;
        color: #ccc;
      ">Checking camera and microphone permissions...</div>
    `;let u=document.createElement("style");u.textContent=`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `,document.head.appendChild(u);let d=document.createElement("iframe");d.id="video-call-frame",d.style.cssText=`
      width: 100%;
      height: 100%;
      border: none;
      display: none;
    `,d.setAttribute("allow","camera; microphone; autoplay; fullscreen; display-capture"),d.setAttribute("allowfullscreen","true"),l.appendChild(a),l.appendChild(d);let c=document.createElement("div");c.style.cssText=`
      background: #2d2d2d;
      padding: 1rem;
      display: flex;
      justify-content: center;
      gap: 1rem;
      border-top: 1px solid #444;
    `;let m=document.createElement("button");m.textContent="Fullscreen",m.style.cssText=`
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 500;
      background: #007bff;
      color: white;
    `,m.onclick=()=>this.toggleFullscreen();let s=document.createElement("button");s.textContent="Leave Call",s.style.cssText=`
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 500;
      background: #dc3545;
      color: white;
    `,s.onclick=()=>this.closeVideoCallModal(),c.appendChild(m),c.appendChild(s),t.appendChild(i),t.appendChild(l),t.appendChild(c),document.body.appendChild(t),this.videoCallModal=t,this.initializeEmbeddedVideoCall(e,d,a)}initializeEmbeddedVideoCall(e,t,i){let o=e.join_url&&e.join_url.includes("daily.co"),r=e.join_url&&(e.join_url.includes("meet.jit.si")||e.join_url.includes("jitsi.riverlearn.co.ke"));console.log("Platform detection:",{declaredPlatform:e.platform,isDailyUrl:o,isJitsiUrl:r,joinUrl:e.join_url}),e.platform==="daily"&&o?this.initializeEmbeddedDailyCall(e,t,i):this.initializeEmbeddedJitsiCall(e,t,i)}initializeEmbeddedDailyCall(e,t,i){console.log("Initializing Daily.co call with data:",e);let o=setTimeout(()=>{i.innerHTML=`
        <div style="color: #ff6b6b; text-align: center;">
          <h3>Connection Timeout</h3>
          <p>Failed to connect after 30 seconds. Please try again.</p>
          <button onclick="location.reload()" style="
            padding: 0.5rem 1rem;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            margin-top: 1rem;
          ">Retry</button>
        </div>
      `},3e4);try{if(!e.join_url||e.join_url.trim()===""){console.warn("Daily.co URL is empty, falling back to Jitsi"),this.initializeEmbeddedJitsiCall(e,t,i);return}console.log("Creating Daily.co frame with URL:",e.join_url),this.ensureIframePermissions(t),this.currentCallFrame=window.DailyIframe.createFrame(t,{showLeaveButton:!1,showFullscreenButton:!1,showLocalVideo:!0,showParticipantsBar:!0,showChatButton:!0,showCameraButton:!0,showMicrophoneButton:!0,showScreenShareButton:!0,showHangupButton:!1,colors:{accent:"#007bff",accentText:"#ffffff",background:"#1a1a1a",backgroundAccent:"#2d2d2d",baseText:"#ffffff",border:"#444444",mainAreaBg:"#000000",supportiveText:"#cccccc"}}),this.currentCallFrame.on("joined-meeting",()=>{console.log("Joined Daily.co meeting successfully"),clearTimeout(o),i.style.display="none",t.style.display="block"}).on("left-meeting",()=>{console.log("Left Daily.co meeting"),this.closeVideoCallModal()}).on("error",n=>{console.error("Daily.co error:",n),clearTimeout(o),i.innerHTML=`
            <div style="color: #ff6b6b; text-align: center;">
              <h3>Connection Error</h3>
              <p>Failed to connect to video call. Please try again.</p>
              <button onclick="location.reload()" style="
                padding: 0.5rem 1rem;
                background: #007bff;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                margin-top: 1rem;
              ">Retry</button>
            </div>
          `});let r={url:e.join_url,userName:e.user_name};e.daily_token&&(r.token=e.daily_token),console.log("Joining Daily.co meeting with config:",r),this.currentCallFrame.join(r)}catch(r){console.error("Failed to initialize Daily.co call:",r),clearTimeout(o),i.innerHTML=`
        <div style="color: #ff6b6b; text-align: center;">
          <h3>Initialization Error</h3>
          <p>Failed to initialize video call. Please try again.</p>
          <button onclick="location.reload()" style="
            padding: 0.5rem 1rem;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            margin-top: 1rem;
          ">Retry</button>
        </div>
      `}}initializeEmbeddedJitsiCall(e,t,i){console.log("Initializing Jitsi call with data:",e);let o=setTimeout(()=>{i.innerHTML=`
        <div style="color: #ff6b6b; text-align: center;">
          <h3>Connection Timeout</h3>
          <p>Failed to connect after 30 seconds. Please try again.</p>
          <button onclick="location.reload()" style="
            padding: 0.5rem 1rem;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            margin-top: 1rem;
          ">Retry</button>
        </div>
      `},3e4);this.ensureIframePermissions(t),this.generateJitsiTokenForCall(e,t,i,o),t.onerror=()=>{clearTimeout(o),i.innerHTML=`
        <div style="color: #ff6b6b; text-align: center;">
          <h3>Connection Error</h3>
          <p>Failed to load video call. Please try again.</p>
          <button onclick="location.reload()" style="
            padding: 0.5rem 1rem;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            margin-top: 1rem;
          ">Retry</button>
        </div>
      `}}generateJitsiTokenForCall(e,t,i,o){let r=this.extractRoomNameFromUrl(e.join_url);r||(r=`meeting-${e.meeting_id}-${Date.now()}`),this.courseService.generateJitsiToken(r,e.meeting_id).subscribe({next:n=>{console.log("JWT token generated:",n);let l=n.room_url;t.src=l,t.onload=()=>{clearTimeout(o),i.style.display="none",t.style.display="block",console.log("Authenticated Jitsi iframe loaded successfully")},t.onerror=()=>{clearTimeout(o),console.error("Failed to load authenticated Jitsi iframe");let a=`https://jitsi.riverlearn.co.ke/${r}`;t.src=a}},error:n=>{console.error("Failed to generate JWT token:",n),clearTimeout(o);let l=e.join_url||`https://jitsi.riverlearn.co.ke/${r}`;t.src=l,t.onload=()=>{i.style.display="none",t.style.display="block",console.log("Fallback Jitsi iframe loaded successfully")}}})}extractRoomNameFromUrl(e){if(!e)return null;try{let i=new URL(e).pathname.split("/").filter(o=>o);return i[i.length-1]||null}catch(t){return console.error("Error parsing URL:",t),null}}closeEmbeddedVideoCall(){let e=document.getElementById("embedded-video-call");if(e&&document.body.removeChild(e),this.currentCallFrame){try{this.currentCallFrame.destroy()}catch(t){console.log("Error destroying call frame:",t)}this.currentCallFrame=null}this.pendingVideoCallData=null}minimizeEmbeddedVideoCall(){let e=document.getElementById("embedded-video-call");if(e){let t=document.getElementById("embedded-video-area"),i=e.querySelector("div:last-child");t&&i&&(t.style.display==="none"?(t.style.display="flex",i.style.display="flex",e.style.height="400px"):(t.style.display="none",i.style.display="none",e.style.height="auto"))}}toggleEmbeddedFullscreen(){let e=document.getElementById("embedded-video-call");e&&(document.fullscreenElement?document.exitFullscreen().then(()=>{e.style.cssText=`
            position: fixed;
            top: 80px;
            right: 20px;
            width: 500px;
            height: 400px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            z-index: 1000;
            display: flex;
            flex-direction: column;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            border: 1px solid #e5e7eb;
            resize: both;
            overflow: hidden;
            min-width: 300px;
            min-height: 200px;
            max-width: 90vw;
            max-height: 80vh;
          `}):e.requestFullscreen().then(()=>{e.style.cssText=`
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: white;
            border-radius: 0;
            box-shadow: none;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            border: none;
            resize: none;
            overflow: hidden;
          `}).catch(t=>{console.log("Error attempting to enable fullscreen:",t)}))}toggleEmbeddedResize(){let e=document.getElementById("embedded-video-call");e&&(e.style.resize==="both"?(e.style.resize="none",e.style.cursor="default"):(e.style.resize="both",e.style.cursor="nw-resize"))}addDragFunctionality(e,t){let i=!1,o=0,r=0,n=0,l=0,a=0,u=0;e.addEventListener("mousedown",d),document.addEventListener("mousemove",c),document.addEventListener("mouseup",m);function d(s){s.target&&s.target.tagName==="BUTTON"||(n=s.clientX-a,l=s.clientY-u,(s.target===e||e.contains(s.target))&&(i=!0,e.style.cursor="grabbing"))}function c(s){i&&(s.preventDefault(),o=s.clientX-n,r=s.clientY-l,a=o,u=r,t.style.transform=`translate(${o}px, ${r}px)`)}function m(){n=o,l=r,i=!1,e.style.cursor="move"}}closeVideoCallModal(){if(this.currentCallFrame){try{this.currentCallFrame.destroy()}catch(i){console.log("Error destroying call frame:",i)}this.currentCallFrame=null}this.videoCallModal&&(document.body.removeChild(this.videoCallModal),this.videoCallModal=null);let e=document.getElementById("permission-guidance-modal");e&&document.body.removeChild(e),this.pendingVideoCallData=null;let t=document.querySelector("style[data-video-call]");t&&document.head.removeChild(t)}toggleFullscreen(){this.videoCallModal&&(document.fullscreenElement?document.exitFullscreen():this.videoCallModal.requestFullscreen().catch(e=>{console.log("Error attempting to enable fullscreen:",e)}))}handleError(e){return console.error("Video call error:",e),x(()=>e)}static \u0275fac=function(t){return new(t||y)(b(w),b(E),b(M))};static \u0275prov=v({token:y,factory:y.\u0275fac,providedIn:"root"})};export{T as a};
