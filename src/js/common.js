/*
*
*	Helper Javascript functions
*
*	Legacy global function names remain available for compatibility.
*	Current templates use delegated listeners and data-* markers where possible.
*	Aliases are also exposed on window.UltraStatsUI.
*
*	Sections: pointer helpers -> popup/window helpers -> delegated UI behavior ->
*	admin parser embed -> parser classic shell -> autosubmit / popup helpers ->
*	admin index medal settings -> UltraStatsUI export.
*/

/* --- Pointer helpers (popup positioning) ---------------------------------- */

/** Document Y for a mouse event (pageY or clientY + scroll). */
function UltraStatsPointerPageY(ev)
{
	if (!ev) {
		return 0;
	}
	if (typeof ev.pageY === 'number') {
		return ev.pageY;
	}
	var sy = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
	return (ev.clientY || 0) + sy;
}

/** Viewport X for a mouse event (clientX). */
function UltraStatsPointerClientX(ev)
{
	if (!ev) {
		return 0;
	}
	return typeof ev.clientX === 'number' ? ev.clientX : 0;
}

/* --- window.open helper (templates keep legacy signature) ---------------- */

function NewWindow(Location, WindowName,X_width,Y_height,Option) {
	var windowReference;
	var Addressbar = "location=NO";		// default: no address bar in popup
	var OptAddressBar = "AddressBar";	// option value: show address bar
	if (Option == OptAddressBar) {		// show browser address bar
		Addressbar = "location=YES";
		}
	windowReference = window.open(Location,WindowName, 
	'toolbar=no,' + Addressbar + ',directories=no,status=yes,menubar=no,scrollbars=yes,resizable=yes,copyhistory=no,width=' + X_width + 
	',height=' + Y_height);
	if (!windowReference.opener)
		windowReference.opener = self;

}

/* --- Toggle display (menus / collapsible by element id) -------------------- */

// helper array to keep track of the timeouts!
var runningTimeouts = new Array();
var defaultMenuTimeout = 3000;
/*
* Toggle display type from NONE to BLOCK
*/ 
function ToggleDisplayTypeById(ObjID)
{
	var obj = document.getElementById(ObjID);
	if (obj != null)
	{
		if (obj.style.display == '' || obj.style.display == 'none')
		{
			obj.style.display='block';
			
			// Set Timeout to make sure the menu disappears
			ToggleDisplaySetTimeout(ObjID);
		}
		else
		{
			obj.style.display='none';
			
			// Abort Timeout if set!
			ToggleDisplayClearTimeout(ObjID);
		}
	}
}

function ToggleDisplaySetTimeout(ObjID)
{
	// Set Timeout 
	runningTimeouts[ObjID] = window.setTimeout( function () {
		ToggleDisplayOffTypeById( ObjID );
	}, defaultMenuTimeout );
}

function ToggleDisplayClearTimeout(ObjID)
{
	// Abort Timeout if set!
	if ( runningTimeouts[ObjID] != null )
	{
		window.clearTimeout(runningTimeouts[ObjID]);
	}
}

function ToggleDisplayEnhanceTimeOut(ObjID)
{
	// Only perform if timeout exists!
	if (runningTimeouts[ObjID] != null)
	{
		// First clear timeout
		ToggleDisplayClearTimeout(ObjID);

		// Set new  timeout
		ToggleDisplaySetTimeout(ObjID);
	}
}

/*
* Make Style sheet display OFF in any case
*/ 
function ToggleDisplayOffTypeById(ObjID)
{
	var obj = document.getElementById(ObjID);
	if (obj != null)
	{
		obj.style.display='none';
	}
}

/* --- Detail popup (#popupdetails) ---------------------------------------- */

/* 
*	Detail popup handling functions
*/
var myPopupHovering = false;
function HoveringPopup(event, parentObj)
{
	// This will allow the detail window to be relocated
	myPopupHovering = true;
}

function FinishHoveringPopup(event, parentObj)
{
	// This will avoid moving the detail window when it is open
	myPopupHovering = false;
}

function FinishPopupWindow() // ) //, parentObj)
{
	// Change CSS Class
	var obj = document.getElementById('popupdetails');
	if (obj != null) {
		obj.className = 'popupdetails with_border' + ( obj.classList && obj.classList.contains( 'us-popup-panel' ) ? ' us-popup-panel' : '' );
	}
}

function disableEventPropagation(myEvent)
{
	if (myEvent && myEvent.stopPropagation) {
		myEvent.stopPropagation();
	}
}

function movePopupWindow(myEvent, ObjName, parentObj)
{
	var obj = document.getElementById(ObjName);
	
//	var PopupContentWidth = 0;
//	var middle = PopupContentWidth / 2;
	var middle = -10;

	if (myPopupHovering == false && obj != null && parentObj != null)
	{
		obj.style.top = (UltraStatsPointerPageY(myEvent) + 20) + 'px';
		obj.style.left = (UltraStatsPointerClientX(myEvent) - middle) + 'px';
	}
}

function GoToPopupTarget(myTarget, parentObj)
{
	if (!myPopupHovering)
	{
		// Change document location
		document.location=myTarget;
	}
	else /* Close Popup */
	{
		FinishPopupWindow(parentObj);
	}
}

function setPopupTextById(elementId, value)
{
	var el = document.getElementById(elementId);
	if (el != null)
	{
		el.textContent = (value == null ? '' : String(value));
	}
}

function HoverPopup( myObjRef, myPopupTitle, HoverContent, OptionalImage )
{
	// Change CSS Class
	var obj = document.getElementById('popupdetails');
	if (obj == null) {
		return;
	}
	obj.className = 'popupdetails_popup with_border' + ( obj.classList && obj.classList.contains( 'us-popup-panel' ) ? ' us-popup-panel' : '' );

	if ( myObjRef != null)
	{
		myObjRef.src = OptionalImage; 
		// "{BASEPATH}images/player/" + myTeam + "/hover/" + ImageBaseName + ".png";
	}

	// Set title/content as plain text (avoid DOM HTML injection).
	setPopupTextById("popuptitle", myPopupTitle);
	setPopupTextById("popupcontent", HoverContent);
}

function HoverPopupMenuHelp( myEvent, parentObj, myPopupTitle, HoverContent )
{
	// Modern menu usability relies on CSS flyouts and native title text; keep the legacy API as a no-op.
	return false;
}

/* --- Public menu delegated handlers (Phase 5.2 / CSP cleanup) ------------ */

(function UltraStatsBindPublicMenuHandlers() {
	function closestWithClass( el, className ) {
		while ( el && el.nodeType === 1 ) {
			if ( el.classList && el.classList.contains( className ) ) {
				return el;
			}
			el = el.parentNode;
		}
		return null;
	}
	function enhanceTimeoutsFromElement( el ) {
		var targets = [];
		var singleTarget = el.getAttribute( 'data-enhance-timeout' );
		var multiTargets = el.getAttribute( 'data-enhance-timeouts' );
		if ( singleTarget ) {
			targets.push( singleTarget );
		}
		if ( multiTargets ) {
			targets = targets.concat( multiTargets.split( /\s+/ ) );
		}
		for ( var i = 0; i < targets.length; i++ ) {
			if ( targets[i] ) {
				ToggleDisplayEnhanceTimeOut( targets[i] );
			}
		}
	}
	function onClick( ev ) {
		var el = closestWithClass( ev.target, 'us-toggle-display' );
		if ( !el ) {
			return;
		}
		var targetId = el.getAttribute( 'data-toggle-target' );
		if ( targetId ) {
			ev.preventDefault();
			ToggleDisplayTypeById( targetId );
		}
	}
	function onMouseOver( ev ) {
		var el = closestWithClass( ev.target, 'us-popup-panel' );
		if ( el ) {
			HoveringPopup( ev, el );
			return;
		}
		el = closestWithClass( ev.target, 'us-player-popup-part' );
		if ( el ) {
			HoverPopup(
				el,
				el.getAttribute( 'data-popup-title' ) || '',
				el.getAttribute( 'data-popup-content' ) || '',
				el.getAttribute( 'data-popup-image' ) || el.getAttribute( 'src' ) || ''
			);
			return;
		}
		el = closestWithClass( ev.target, 'us-player-legend-part' );
		if ( el ) {
			var legendEl = document.getElementById( el.getAttribute( 'data-legend-target' ) || '' );
			if ( legendEl ) {
				legendEl.textContent = el.getAttribute( 'data-hover-display' ) || '';
			}
			return;
		}
		el = closestWithClass( ev.target, 'us-popup-help' );
		if ( el ) {
			HoverPopup(
				null,
				el.getAttribute( 'data-popup-title' ) || '',
				el.getAttribute( 'data-popup-content' ) || '',
				''
			);
			return;
		}
	}
	function onMouseMove( ev ) {
		if ( closestWithClass( ev.target, 'us-popup-panel' ) ) {
			disableEventPropagation( ev );
			return;
		}
		var timeoutEl = ev.target;
		while ( timeoutEl && timeoutEl.nodeType === 1 ) {
			if (
				timeoutEl.getAttribute( 'data-enhance-timeout' )
				|| timeoutEl.getAttribute( 'data-enhance-timeouts' )
			) {
				enhanceTimeoutsFromElement( timeoutEl );
				break;
			}
			timeoutEl = timeoutEl.parentNode;
		}
		var popupEl = closestWithClass( ev.target, 'us-popup-help' );
		if ( !popupEl ) {
			popupEl = closestWithClass( ev.target, 'us-player-popup-part' );
		}
		if ( popupEl ) {
			movePopupWindow( ev, 'popupdetails', popupEl );
		}
	}
	function onMouseOut( ev ) {
		var popupPanel = closestWithClass( ev.target, 'us-popup-panel' );
		if ( popupPanel ) {
			FinishHoveringPopup( ev, popupPanel );
			return;
		}
		var playerPopupEl = closestWithClass( ev.target, 'us-player-popup-part' );
		if ( playerPopupEl ) {
			FinishPopupWindow();
			if ( playerPopupEl.getAttribute( 'data-out-src' ) ) {
				playerPopupEl.src = playerPopupEl.getAttribute( 'data-out-src' );
			}
			return;
		}
		var playerLegendEl = closestWithClass( ev.target, 'us-player-legend-part' );
		if ( playerLegendEl ) {
			if ( playerLegendEl.getAttribute( 'data-out-src' ) ) {
				playerLegendEl.src = playerLegendEl.getAttribute( 'data-out-src' );
			}
			var legendEl = document.getElementById( playerLegendEl.getAttribute( 'data-legend-target' ) || '' );
			if ( legendEl ) {
				legendEl.textContent = playerLegendEl.getAttribute( 'data-out-text' ) || '';
			}
			return;
		}
		if ( closestWithClass( ev.target, 'us-popup-help' ) ) {
			FinishPopupWindow();
		}
	}
	function bind() {
		document.addEventListener( 'click', onClick, false );
		document.addEventListener( 'mouseover', onMouseOver, false );
		document.addEventListener( 'mousemove', onMouseMove, false );
		document.addEventListener( 'mouseout', onMouseOut, false );
	}
	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', bind, false );
	} else {
		bind();
	}
})();

/* --- Admin parser embed stream (Phase 5.4 / CSP cleanup) ----------------- */

(function UltraStatsBindAdminParserEmbedStream() {
	function bind() {
		var wrap = document.getElementById('parser-log-wrap');
		var pre = document.getElementById('parser-log-pre');
		var logHeader = document.getElementById('parser-log-header');
		var statusEl = document.getElementById('parser-stream-status');
		var cancelBtn = document.getElementById('parser-cancel-btn');
		var doneBanner = document.getElementById('parser-done-banner');
		/** Batched plain-text log: fewer DOM nodes than one &lt;tr&gt; per line (huge logs stay responsive). */
		var lineBuf = [];
		var LOG_FLUSH = 100;
		if (!wrap || !pre) { return; }
		var op = wrap.getAttribute('data-parser-op') || '';
		var sid = wrap.getAttribute('data-parser-id') || '';
		var es = null;
		var pendingRunTotals = null;
		var streamEndedCancelled = false;

		if (cancelBtn && sid) {
			cancelBtn.addEventListener('click', function () {
				if (!cancelBtn.disabled) {
					cancelBtn.disabled = true;
					if (statusEl) { statusEl.style.display = 'block'; statusEl.textContent = wrap.getAttribute('data-msg-cancelling') || 'Cancelling…'; }
				}
				fetch('parser-cancel.php?id=' + encodeURIComponent(sid), { method: 'POST', credentials: 'same-origin', headers: { 'Accept': 'application/json' } })
					.then(function (r) { return r.json().catch(function () { return { ok: false }; }); })
					.then(function (j) {
						if (!j || j.ok === false) { cancelBtn.disabled = false; if (statusEl) { statusEl.textContent = 'Running…'; } }
					})
					.catch(function () { cancelBtn.disabled = false; if (statusEl) { statusEl.textContent = 'Running…'; } });
			});
		}

		function oneLine(s) {
			return String(s || '').replace(/\r\n|\n|\r/g, ' \u21b5 ');
		}
		function fmtLogLine(d) {
			var n = String(d.n != null ? d.n : '');
			if (typeof n.padStart === 'function') {
				n = n.padStart(5, ' ');
			} else {
				while (n.length < 5) { n = ' ' + n; }
			}
			return n + '  ' + oneLine(d.lvl) + '  ' + oneLine(d.fac) + '  ' + oneLine(d.msg);
		}
		function flushLogBuf() {
			if (!lineBuf.length) { return; }
			pre.appendChild(document.createTextNode(lineBuf.join('\n') + '\n'));
			lineBuf.length = 0;
			wrap.scrollTop = wrap.scrollHeight;
		}
		function hideDoneBanner() {
			if (!doneBanner) { return; }
			doneBanner.setAttribute('hidden', '');
			doneBanner.textContent = '';
		}
		function showDoneBanner(doneData) {
			if (!doneBanner) { return; }
			var label = wrap.getAttribute('data-msg-done') || 'DONE';
			var sec = doneData && doneData.seconds != null && doneData.seconds !== '' ? String(doneData.seconds) : '';
			var returnLbl = wrap.getAttribute('data-msg-return-serverlist') || 'Server list';
			var listHref = wrap.getAttribute('data-parser-serverlist-href') || 'servers.php';
			hideDoneBanner();
			doneBanner.removeAttribute('hidden');
			var main = document.createElement('span');
			main.className = 'parser-done-banner-main';
			main.textContent = sec ? (label + '  ·  ' + sec + 's') : label;
			doneBanner.appendChild(main);
			doneBanner.appendChild(document.createTextNode('  '));
			var a = document.createElement('a');
			a.className = 'parser-done-banner-link';
			a.href = listHref;
			a.textContent = returnLbl;
			a.setAttribute('aria-label', returnLbl);
			doneBanner.appendChild(a);
			try { wrap.scrollTop = wrap.scrollHeight; } catch (eSc) {}
		}
		function appendLogRow(d) {
			if (!d || d.t !== 'log') { return; }
			lineBuf.push(fmtLogLine(d));
			if (lineBuf.length >= LOG_FLUSH) { flushLogBuf(); }
			if (statusEl) { statusEl.style.display = 'none'; }
		}

		function buildThead(d) {
			if (!d || d.t !== 'header' || !d.cols || !logHeader) { return; }
			logHeader.textContent = d.cols.join('    ');
			logHeader.style.display = 'block';
		}

		/** FTP password must be entered on classic parser-core (POST); link user there from SSE. */
		function renderParserFtpPasswordPanel(d) {
			if (!d || d.t !== 'ftp_password' || !wrap || !wrap.parentNode) { return; }
			var ex = document.getElementById('parser-ftp-password-box');
			if (ex) { try { ex.remove(); } catch (eRem) {} }
			var box = document.createElement('div');
			box.id = 'parser-ftp-password-box';
			box.className = 'us-parser-ftp-password-box';
			box.setAttribute('role', 'alert');
			var title = document.createElement('div');
			title.className = 'us-parser-ftp-password-title';
			title.textContent = d.message || '';
			box.appendChild(title);
			if (d.hint) {
				var hint = document.createElement('div');
				hint.className = 'us-parser-ftp-password-hint';
				hint.textContent = d.hint;
				box.appendChild(hint);
			}
			var a = document.createElement('a');
			a.href = d.classicUrl || '#';
			a.className = 'us-parser-ftp-password-link';
			a.textContent = d.linkLabel || 'Get New Logfile';
			a.setAttribute('aria-label', d.linkLabel || 'Get New Logfile');
			a.addEventListener('click', function () {
				try { box.remove(); } catch (eL) {}
			});
			box.appendChild(a);
			wrap.parentNode.insertBefore(box, wrap);
			try {
				box.scrollIntoView({ behavior: 'smooth', block: 'center' });
			} catch (eScroll) {
				try { box.scrollIntoView(true); } catch (e2) {}
			}
		}

		/** Shown above the log (not below) so it stays visible; also used from `done` if `confirm_action` is missed. */
		function renderParserConfirmPanel(d) {
			if (!d || d.t !== 'confirm' || !wrap || !wrap.parentNode) { return; }
			var ex = document.getElementById('parser-confirm-box');
			if (ex) { try { ex.remove(); } catch (eRem) {} }
			var box = document.createElement('div');
			box.id = 'parser-confirm-box';
			box.className = 'us-parser-confirm-banner';
			box.setAttribute('role', 'alert');
			var w = document.createElement('div');
			w.className = 'us-parser-confirm-heading';
			w.textContent = d.warning || '';
			box.appendChild(w);
			var btnRow = document.createElement('div');
			btnRow.className = 'us-parser-confirm-buttons';
			var yes = document.createElement('button');
			yes.type = 'button';
			yes.className = 'us-parser-confirm-yes line0';
			yes.textContent = d.confirmLabel || 'Yes';
			yes.setAttribute('aria-label', d.confirmLabel || 'Yes');
			yes.addEventListener('click', function () {
				if (d.confirmUrl) { startParserStream(d.confirmUrl); }
			});
			var no = document.createElement('button');
			no.type = 'button';
			no.className = 'us-parser-confirm-no line2';
			no.textContent = d.cancelLabel || 'No';
			no.setAttribute('aria-label', d.cancelLabel || 'No');
			no.addEventListener('click', function () {
				if (statusEl) { statusEl.textContent = 'Cancelled.'; }
				try { box.remove(); } catch (eN) {}
				window.history.back();
			});
			btnRow.appendChild(yes);
			btnRow.appendChild(no);
			box.appendChild(btnRow);
			wrap.parentNode.insertBefore(box, wrap);
			try {
				box.scrollIntoView({ behavior: 'smooth', block: 'center' });
			} catch (eScroll) {
				try { box.scrollIntoView(true); } catch (e2) {}
			}
		}

		function startParserStream(url) {
			hideDoneBanner();
			if (es) { try { es.close(); } catch (e) {} }
			var oldBox = document.getElementById('parser-confirm-box');
			if (oldBox) { try { oldBox.remove(); } catch (e0) {} }
			var oldFtp = document.getElementById('parser-ftp-password-box');
			if (oldFtp) { try { oldFtp.remove(); } catch (eFtp) {} }
			streamEndedCancelled = false;
			var opMatch = /[?&]op=([^&]+)/.exec(url);
			var streamOp = opMatch ? decodeURIComponent(opMatch[1]) : (op || '');
			if (cancelBtn) {
				if (streamOp === 'updatestats' && sid) {
					cancelBtn.style.display = 'inline-block';
					cancelBtn.disabled = false;
				} else {
					cancelBtn.style.display = 'none';
				}
			}
			es = new EventSource(url);
			if (statusEl) { statusEl.style.display = 'block'; statusEl.textContent = 'Running…'; }

			es.addEventListener('message', function (ev) {
				try {
					var d = JSON.parse(ev.data);
					if (d.t === 'log') { appendLogRow(d); }
					else if (d.t === 'confirm') {
						if (statusEl) {
							statusEl.style.display = 'block';
							statusEl.textContent = 'Confirmation required — choose an action below.';
						}
						renderParserConfirmPanel(d);
					} else if (d.t === 'ftp_password') {
						if (statusEl) {
							statusEl.style.display = 'block';
							statusEl.textContent = 'FTP login failed — use the link below to enter your password on the classic page.';
						}
						renderParserFtpPasswordPanel(d);
					}
				} catch (err) { /* ignore */ }
			});
			es.addEventListener('table_header', function (ev) {
				try { buildThead(JSON.parse(ev.data)); } catch (err) { }
			});
			es.addEventListener('confirm_action', function (ev) {
				try {
					if (statusEl) {
						statusEl.style.display = 'block';
						statusEl.textContent = 'Confirmation required — choose an action below.';
					}
					renderParserConfirmPanel(JSON.parse(ev.data));
				} catch (eConf) { /* ignore */ }
			});
			es.addEventListener('password_prompt', function (ev) {
				try {
					if (statusEl) {
						statusEl.style.display = 'block';
						statusEl.textContent = 'FTP login failed — use the link below to enter your password on the classic page.';
					}
					renderParserFtpPasswordPanel(JSON.parse(ev.data));
				} catch (ePw) { /* ignore */ }
			});
			es.addEventListener('need_resume', function (ev) {
				var d = JSON.parse(ev.data);
				if (es) { try { es.close(); } catch (e2) {} es = null; }
				flushLogBuf();
				if (d.message) {
					appendLogRow({ t: 'log', n: '—', lvl: 'Info', fac: 'Parser', msg: d.message, fc: 'line0', lc: 'line0', mc: 'cellmenu1' });
					flushLogBuf();
				}
				if (d.url) { setTimeout(function () { startParserStream(d.url); }, 0); }
			});
			es.addEventListener('parser_error', function (ev) {
				var d = JSON.parse(ev.data);
				flushLogBuf();
				if (es) { try { es.close(); } catch (e4) {} es = null; }
				hideDoneBanner();
				if (statusEl) { statusEl.textContent = d.message || 'Error'; }
			});
			es.addEventListener('cancelled', function (ev) {
				try {
					var d = JSON.parse(ev.data);
					flushLogBuf();
					streamEndedCancelled = true;
					hideDoneBanner();
					if (statusEl) {
						statusEl.style.display = 'block';
						statusEl.textContent = d.message || wrap.getAttribute('data-msg-cancelled') || 'Cancelled.';
					}
				} catch (e5) { }
			});
			es.addEventListener('runtotals_next', function (ev) {
				pendingRunTotals = JSON.parse(ev.data);
			});
			es.addEventListener('error', function (ev) {
				if (es && es.readyState === EventSource.CLOSED) { return; }
			});
			es.addEventListener('done', function (ev) {
				flushLogBuf();
				if (es) { try { es.close(); } catch (e3) {} es = null; }
				if (cancelBtn) { cancelBtn.style.display = 'none'; }
				var doneData = {};
				try { doneData = JSON.parse(ev.data); } catch (eDone) {}
				var willChainRunTotals = pendingRunTotals && pendingRunTotals.url;
				if (statusEl) {
					if (doneData.awaitingConfirm) {
						hideDoneBanner();
						statusEl.textContent = 'Confirmation required — choose an action below.';
						if (doneData.confirm) {
							renderParserConfirmPanel(doneData.confirm);
						}
					} else if (doneData.awaitingPassword) {
						hideDoneBanner();
						statusEl.textContent = 'FTP login failed — use the link below to enter your password on the classic page.';
						if (doneData.passwordForm) {
							renderParserFtpPasswordPanel(doneData.passwordForm);
						}
					} else {
						statusEl.textContent = streamEndedCancelled ? (statusEl.textContent) : 'Done.';
					}
				}
				if (willChainRunTotals) {
					hideDoneBanner();
					var del = Math.max(0, parseInt(pendingRunTotals.delayMs, 10) || 0);
					var u = pendingRunTotals.url;
					var p = pendingRunTotals;
					pendingRunTotals = null;
					if (p.label && statusEl) { statusEl.textContent = p.label + ' in ' + (del / 1000) + 's…'; }
					setTimeout(function () { startParserStream(u); }, del);
				} else if (!doneData.awaitingConfirm && !doneData.awaitingPassword && !streamEndedCancelled) {
					showDoneBanner(doneData);
				}
			});
		}

		if (op) {
			startParserStream('parser-sse.php?op=' + encodeURIComponent(op) + (sid ? '&id=' + encodeURIComponent(sid) : ''));
		}
	}
	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', bind, false );
	} else {
		bind();
	}
})();

/* --- Parser classic shell helpers (Phase 5.1 / CSP cleanup) -------------- */

(function UltraStatsBindParserClassicShell() {
	function runAutoReloads() {
		var nodes = document.querySelectorAll ? document.querySelectorAll( '[data-reload-url][data-reload-delay]' ) : [];
		for ( var i = 0; i < nodes.length; i++ ) {
			(function ( el ) {
				var url = el.getAttribute( 'data-reload-url' );
				var delay = parseInt( el.getAttribute( 'data-reload-delay' ), 10 );
				if ( !url || isNaN( delay ) || delay < 0 ) {
					return;
				}
				window.setTimeout( function () {
					window.location.replace( url );
				}, delay );
			})( nodes[i] );
		}
	}
	function bindParserAutoscroll() {
		var body = document.body;
		if ( !body || body.getAttribute( 'data-parser-autoscroll' ) !== 'true' ) {
			return;
		}
		var intervalId = window.setInterval( function () {
			window.scrollTo( 0, 1000000 );
		}, 250 );
		window.addEventListener( 'load', function () {
			window.scrollTo( 0, 1000000 );
			window.clearInterval( intervalId );
		}, false );
	}
	function bind() {
		runAutoReloads();
		bindParserAutoscroll();
	}
	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', bind, false );
	} else {
		bind();
	}
})();

/* --- Autosubmit <select> (Phase 5.2) -------------------------------------- */

/*
 * Phase 5.2 - header server / language / style <select>: submit parent form on change (no inline OnChange).
 */
(function UltraStatsBindAutosubmitSelects() {
	function hasAutosubmitClass( el ) {
		if ( !el || el.nodeName !== 'SELECT' ) {
			return false;
		}
		if ( el.classList && el.classList.contains ) {
			return el.classList.contains( 'us-autosubmit-select' );
		}
		return ( ' ' + el.className + ' ' ).indexOf( ' us-autosubmit-select ' ) !== -1;
	}
	function onChange( ev ) {
		var el = ev.target;
		if ( !hasAutosubmitClass( el ) ) {
			return;
		}
		var f = el.form;
		if ( f ) {
			f.submit();
		}
	}
	function bind() {
		document.addEventListener( 'change', onChange, false );
	}
	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', bind, false );
	} else {
		bind();
	}
})();

/** Admin FTP builder popup: reload opener (if any) and close (Phase 5.2). */
function UltraStatsAdminCloseFtpBuilderPopup()
{
	try {
		if ( window.opener && window.opener.location ) {
			window.opener.location.reload();
		}
	} catch ( err ) {
	}
	window.close();
}

(function UltraStatsBindAdminFtpBuilderClose() {
	function onClick( ev ) {
		var el = ev.target;
		if ( ! el || ( el.nodeName !== 'BUTTON' && el.nodeName !== 'INPUT' ) ) {
			return;
		}
		if ( ! el.classList || ! el.classList.contains( 'us-admin-ftpbuilder-close' ) ) {
			return;
		}
		UltraStatsAdminCloseFtpBuilderPopup();
	}
	function bind() {
		document.addEventListener( 'click', onClick, false );
	}
	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', bind, false );
	} else {
		bind();
	}
})();

(function UltraStatsBindAdminFtpBuilderWindowHints() {
	function centerPopup( marker ) {
		var width = parseInt( marker.getAttribute( 'data-popup-center-width' ) || '500', 10 );
		var height = parseInt( marker.getAttribute( 'data-popup-center-height' ) || '500', 10 );
		if ( isNaN( width ) || isNaN( height ) ) {
			return;
		}
		try {
			window.moveTo( ( screen.width - width ) / 2, ( screen.height - height ) / 2 );
			window.focus();
		} catch ( err ) {
		}
	}
	function scheduleClose( marker ) {
		var delay = parseInt( marker.getAttribute( 'data-ftpbuilder-close-delay' ) || '5000', 10 );
		if ( isNaN( delay ) || delay < 0 ) {
			return;
		}
		window.setTimeout( function () {
			UltraStatsAdminCloseFtpBuilderPopup();
		}, delay );
	}
	function bind() {
		var centerMarker = document.querySelector ? document.querySelector( '[data-popup-center-width][data-popup-center-height]' ) : null;
		if ( centerMarker ) {
			centerPopup( centerMarker );
		}
		var closeMarker = document.querySelector ? document.querySelector( '[data-ftpbuilder-close-delay]' ) : null;
		if ( closeMarker ) {
			scheduleClose( closeMarker );
		}
	}
	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', bind, false );
	} else {
		bind();
	}
})();

/* --- Generic admin click handlers (Phase 5.2 incremental) ----------------- */

/* Optional browser guard for GET-first destructive links. */
(function UltraStatsBindConfirmNavigation() {
	function onClick( ev ) {
		var el = ev.target;
		while ( el && el.nodeType === 1 && el.nodeName !== 'A' ) {
			el = el.parentNode;
		}
		if ( !el || !el.classList || !el.classList.contains( 'us-confirm-nav' ) ) {
			return;
		}
		var msg = el.getAttribute( 'data-confirm-message' ) || 'Are you sure?';
		if ( !window.confirm( msg ) ) {
			ev.preventDefault();
		}
	}
	function bind() {
		document.addEventListener( 'click', onClick, false );
	}
	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', bind, false );
	} else {
		bind();
	}
})();

/* Delegated popup opener for admin helper buttons (replaces inline onclick). */
(function UltraStatsBindPopupButtons() {
	function onClick( ev ) {
		var el = ev.target;
		while ( el && el.nodeType === 1 && el.nodeName !== 'INPUT' && el.nodeName !== 'BUTTON' ) {
			el = el.parentNode;
		}
		if ( !el || !el.classList || !el.classList.contains( 'us-open-popup' ) ) {
			return;
		}
		var url = el.getAttribute( 'data-popup-url' ) || '';
		if ( !url ) {
			return;
		}
		NewWindow(
			url,
			el.getAttribute( 'data-popup-name' ) || 'PopupWindow',
			parseInt( el.getAttribute( 'data-popup-width' ) || '500', 10 ),
			parseInt( el.getAttribute( 'data-popup-height' ) || '500', 10 ),
			el.getAttribute( 'data-popup-options' ) || ''
		);
	}
	function bind() {
		document.addEventListener( 'click', onClick, false );
	}
	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', bind, false );
	} else {
		bind();
	}
})();

/* Delegated history-back links with real href fallback (Phase 6.4). */
(function UltraStatsBindHistoryBackLinks() {
	function onClick( ev ) {
		var el = ev.target;
		while ( el && el.nodeType === 1 && el.nodeName !== 'A' ) {
			el = el.parentNode;
		}
		if ( !el || !el.classList || !el.classList.contains( 'us-history-back' ) ) {
			return;
		}
		if ( window.history && window.history.length > 1 ) {
			ev.preventDefault();
			window.history.back();
		}
	}
	function bind() {
		document.addEventListener( 'click', onClick, false );
	}
	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', bind, false );
	} else {
		bind();
	}
})();

/* --- Admin FTP builder preview (Phase 5.2 incremental) ------------------- */

function UltraStatsBuildFtpBuilderUrl( myform )
{
	var szPassword = "";
	if ( myform.elements.password.value.length > 0 ) {
		szPassword = ":" + myform.elements.password.value;
	}

	return 'ftp://'
		+ myform.elements.username.value
		+ szPassword
		+ '@'
		+ myform.elements.serverip.value
		+ ':'
		+ myform.elements.serverport.value
		+ myform.elements.pathtogamelog.value
		+ myform.elements.gamelogfilename.value;
}

function updateftpurl( myform )
{
	if ( !myform || !myform.elements ) {
		return;
	}
	var preview = document.getElementById( 'preview' );
	if ( !preview ) {
		return;
	}
	preview.textContent = UltraStatsBuildFtpBuilderUrl( myform );
}

(function UltraStatsBindFtpBuilderPreview() {
	var ftpFieldNames = {
		serverip: true,
		serverport: true,
		username: true,
		password: true,
		pathtogamelog: true,
		gamelogfilename: true
	};
	function isFtpBuilderField( el ) {
		return el
			&& el.form
			&& el.form.name === 'ftpcheck'
			&& Object.prototype.hasOwnProperty.call( ftpFieldNames, el.name );
	}
	function onInput( ev ) {
		var el = ev.target;
		if ( isFtpBuilderField( el ) ) {
			updateftpurl( el.form );
		}
	}
	function bind() {
		document.addEventListener( 'input', onInput, false );
		if ( document.forms.ftpcheck ) {
			updateftpurl( document.forms.ftpcheck );
		}
	}
	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', bind, false );
	} else {
		bind();
	}
})();

/* --- Admin index medal settings (Phase 5.4 / CSP cleanup) --------------- */

(function UltraStatsBindAdminMedalSettings() {
	var medalGroups = { pro: true, anti: true, custom: true };
	function q( sel ) {
		return document.querySelectorAll ? document.querySelectorAll( sel ) : [];
	}
	function syncGroup( groupName ) {
		var masters = q( 'input.us-medal-group-toggle[data-us-medal-group="' + groupName + '"]' );
		var cbs = q( 'input.us-medal-cb[data-us-medal-group="' + groupName + '"]' );
		if ( !masters.length || !cbs.length ) {
			return;
		}
		var master = masters[0];
		var checkedCount = 0;
		for ( var i = 0; i < cbs.length; i++ ) {
			if ( cbs[i].checked ) {
				checkedCount++;
			}
		}
		master.indeterminate = checkedCount > 0 && checkedCount < cbs.length;
		master.checked = checkedCount === cbs.length;
	}
	function onGroupToggleChange( ev ) {
		var t = ev.target;
		if ( !t || !t.classList || !t.classList.contains( 'us-medal-group-toggle' ) ) {
			return;
		}
		var groupName = t.getAttribute( 'data-us-medal-group' );
		if ( !medalGroups[groupName] ) {
			return;
		}
		t.indeterminate = false;
		var cbs = q( 'input.us-medal-cb[data-us-medal-group="' + groupName + '"]' );
		for ( var i = 0; i < cbs.length; i++ ) {
			cbs[i].checked = t.checked;
		}
	}
	function onMedalCheckboxChange( ev ) {
		var t = ev.target;
		if ( !t || !t.classList || !t.classList.contains( 'us-medal-cb' ) ) {
			return;
		}
		var groupName = t.getAttribute( 'data-us-medal-group' );
		if ( groupName ) {
			syncGroup( groupName );
		}
	}
	function isMedalOptionTarget( t ) {
		if ( !t ) {
			return false;
		}
		if ( t.classList && t.classList.contains( 'us-medal-group-toggle' ) ) {
			return true;
		}
		if ( t.classList && t.classList.contains( 'us-medal-cb' ) ) {
			return true;
		}
		return typeof t.name === 'string' && t.name.indexOf( 'medal_' ) === 0;
	}
	function bindAutosave( form, statusEl ) {
		var msgSaving = statusEl.getAttribute( 'data-msg-saving' ) || 'Saving...';
		var msgRecalc = statusEl.getAttribute( 'data-msg-recalc' ) || 'Recalculating...';
		var msgDone = statusEl.getAttribute( 'data-msg-done' ) || 'Done.';
		var msgErr = statusEl.getAttribute( 'data-msg-error' ) || 'Error.';
		var recalcUrl = statusEl.getAttribute( 'data-recalc-url' ) || 'parser-sse.php?op=calcmedalsonly';
		var debounceMs = parseInt( statusEl.getAttribute( 'data-debounce-ms' ) || '500', 10 );
		if ( isNaN( debounceMs ) || debounceMs < 0 ) {
			debounceMs = 500;
		}
		var debTimer = null;
		var doneHide = null;
		var inFlight = false;
		var pending = false;
		var es = null;
		function setStatus( text ) {
			statusEl.textContent = text || '\u00a0';
		}
		function closeEs() {
			if ( es ) {
				try { es.close(); } catch ( e1 ) {}
				es = null;
			}
		}
		function finishCycle() {
			inFlight = false;
			if ( pending ) {
				pending = false;
				runSaveAndRecalc();
			}
		}
		function startRecalcThenFinish() {
			closeEs();
			setStatus( msgRecalc );
			var recalcEnded = false;
			function endRecalc( ok ) {
				if ( recalcEnded ) {
					return;
				}
				recalcEnded = true;
				closeEs();
				if ( ok ) {
					setStatus( msgDone );
					try {
						if ( doneHide ) {
							window.clearTimeout( doneHide );
						}
					} catch ( e2 ) {}
					doneHide = window.setTimeout( function () {
						setStatus( '' );
						doneHide = null;
					}, 4000 );
				} else {
					setStatus( msgErr );
				}
				finishCycle();
			}
			es = new EventSource( recalcUrl );
			es.addEventListener( 'done', function () { endRecalc( true ); } );
			es.addEventListener( 'parser_error', function () { endRecalc( false ); } );
			es.addEventListener( 'error', function () {
				if ( !es ) {
					return;
				}
				if ( es.readyState === EventSource.CONNECTING ) {
					return;
				}
				if ( recalcEnded ) {
					return;
				}
				if ( es.readyState === EventSource.OPEN ) {
					return;
				}
				endRecalc( false );
			} );
		}
		function runSaveAndRecalc() {
			if ( inFlight ) {
				pending = true;
				return;
			}
			inFlight = true;
			setStatus( msgSaving );
			var fd = new FormData( form );
			fd.set( 'ajax_save', '1' );
			fetch( form.action || 'index.php', { method: 'POST', body: fd, credentials: 'same-origin' } )
				.then( function ( r ) {
					if ( !r.ok ) {
						throw new Error( 'http' );
					}
					return r.json();
				} )
				.then( function ( j ) {
					if ( !j || j.ok !== true ) {
						throw new Error( 'json' );
					}
					startRecalcThenFinish();
				} )
				.catch( function () {
					setStatus( msgErr );
					finishCycle();
				} );
		}
		function onFormChange( ev ) {
			if ( !isMedalOptionTarget( ev.target ) ) {
				return;
			}
			if ( debTimer ) {
				try { window.clearTimeout( debTimer ); } catch ( e3 ) {}
				debTimer = null;
			}
			debTimer = window.setTimeout( function () {
				debTimer = null;
				if ( inFlight ) {
					pending = true;
					return;
				}
				runSaveAndRecalc();
			}, debounceMs );
		}
		form.addEventListener( 'change', onFormChange, false );
	}
	function bind() {
		var form = document.getElementById( 'admin-gen-form' );
		if ( !form ) {
			return;
		}
		for ( var groupName in medalGroups ) {
			if ( Object.prototype.hasOwnProperty.call( medalGroups, groupName ) ) {
				syncGroup( groupName );
			}
		}
		var masters = q( 'input.us-medal-group-toggle' );
		for ( var i = 0; i < masters.length; i++ ) {
			masters[i].addEventListener( 'change', onGroupToggleChange, false );
		}
		form.addEventListener( 'change', onMedalCheckboxChange, true );
		var statusEl = document.getElementById( 'medal-autorecalc-status' );
		if ( statusEl ) {
			bindAutosave( form, statusEl );
		}
	}
	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', bind, false );
	} else {
		bind();
	}
})();

/* --- window.UltraStatsUI (Phase 5.1; mirrors legacy globals) -------------- */

/* Phase 5.1: single namespace for tooling/tests; globals unchanged for templates. */
window.UltraStatsUI = {
	NewWindow: NewWindow,
	ToggleDisplayTypeById: ToggleDisplayTypeById,
	ToggleDisplaySetTimeout: ToggleDisplaySetTimeout,
	ToggleDisplayClearTimeout: ToggleDisplayClearTimeout,
	ToggleDisplayEnhanceTimeOut: ToggleDisplayEnhanceTimeOut,
	ToggleDisplayOffTypeById: ToggleDisplayOffTypeById,
	HoveringPopup: HoveringPopup,
	FinishHoveringPopup: FinishHoveringPopup,
	FinishPopupWindow: FinishPopupWindow,
	disableEventPropagation: disableEventPropagation,
	movePopupWindow: movePopupWindow,
	GoToPopupTarget: GoToPopupTarget,
	setPopupTextById: setPopupTextById,
	HoverPopup: HoverPopup,
	HoverPopupMenuHelp: HoverPopupMenuHelp,
	UltraStatsPointerPageY: UltraStatsPointerPageY,
	UltraStatsPointerClientX: UltraStatsPointerClientX,
	UltraStatsAdminCloseFtpBuilderPopup: UltraStatsAdminCloseFtpBuilderPopup,
	UltraStatsBuildFtpBuilderUrl: UltraStatsBuildFtpBuilderUrl,
	updateftpurl: updateftpurl
};
