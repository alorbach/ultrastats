/*

Helper Javascript functions

*/

function CheckAlphaPNGImage(ImageName, ImageTrans)
{
	var agt=navigator.userAgent.toLowerCase();
	var is_ie = ((agt.indexOf("msie") != -1) && (agt.indexOf("opera") == -1));

	if (is_ie)
		document.images[ImageName].src = ImageTrans;
}

function NewWindow(Location, WindowName,X_width,Y_height,Option) {
	var windowReference;
	var Addressbar = "location=NO";		//Default
	var OptAddressBar = "AddressBar";	//Default für Adressbar
	if (Option == OptAddressBar) {		//Falls AdressBar gewünscht wird
		Addressbar = "location=YES";
		}
	windowReference = window.open(Location,WindowName, 
	'toolbar=no,' + Addressbar + ',directories=no,status=yes,menubar=no,scrollbars=yes,resizable=yes,copyhistory=no,width=' + X_width + 
	',height=' + Y_height);
	if (!windowReference.opener)
		windowReference.opener = self;

}

// helper array to keep track of the timeouts!
var runningTimeouts = new Array();
var defaultMenuTimeout = 1500;
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
	var szTimeOut = "ToggleDisplayOffTypeById('" + ObjID + "')";
	runningTimeouts[ObjID] = window.setTimeout(szTimeOut, defaultMenuTimeout);
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
	// First clear timeout
	ToggleDisplayClearTimeout(ObjID);

	// Set new  timeout
	ToggleDisplaySetTimeout(ObjID);
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
